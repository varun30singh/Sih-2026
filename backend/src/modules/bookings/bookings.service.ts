import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { $Enums } from '../../generated/prisma/client';
import { createSuccessResponse } from '../../common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByFarmer(farmerId: string) {
    const parsedFarmerId = Number(farmerId);

    if (!Number.isInteger(parsedFarmerId) || parsedFarmerId <= 0) {
      throw new BadRequestException(
        'Invalid farmerId: must be a positive integer',
      );
    }

    const bookings = await this.prisma.bookings.findMany({
      where: { farmer_id: parsedFarmerId },
      include: {
        slots: {
          include: {
            procurement_centres: true,
          },
        },
        crops: true,
      },
      orderBy: { id: 'desc' },
    });

    return createSuccessResponse(bookings);
  }

  async create(body: any) {
    if (!body || typeof body !== 'object') {
      throw new BadRequestException('Request body is required');
    }

    const farmerIdRaw = body.farmer_id ?? body.farmerId;
    const slotIdRaw = body.slot_id ?? body.slotId;
    const cropIdRaw = body.crop_id ?? body.cropId;
    const quantityEstimateRaw =
      body.quantity_estimate ?? body.quantityEstimate;
    const tokenNumberRaw = body.token_number ?? body.tokenNumber;
    const statusRaw = body.status;
    const bookedByRaw = body.booked_by ?? body.bookedBy;

    const farmer_id = Number(farmerIdRaw);

    if (!Number.isInteger(farmer_id) || farmer_id <= 0) {
      throw new BadRequestException(
        'farmer_id is required and must be a valid positive integer',
      );
    }

    const slot_id = Number(slotIdRaw);

    if (!Number.isInteger(slot_id) || slot_id <= 0) {
      throw new BadRequestException(
        'slot_id is required and must be a valid positive integer',
      );
    }

    const crop_id = Number(cropIdRaw);

    if (!Number.isInteger(crop_id) || crop_id <= 0) {
      throw new BadRequestException(
        'crop_id is required and must be a valid positive integer',
      );
    }

    let quantity_estimate: number | null = null;

    if (
      quantityEstimateRaw !== undefined &&
      quantityEstimateRaw !== null &&
      quantityEstimateRaw !== ''
    ) {
      quantity_estimate = Number(quantityEstimateRaw);

      if (
        !Number.isFinite(quantity_estimate) ||
        quantity_estimate < 0
      ) {
        throw new BadRequestException(
          'quantity_estimate must be a valid non-negative number',
        );
      }
    }

    let status: $Enums.booking_status =
      $Enums.booking_status.booked;

    if (statusRaw) {
      const lower = String(statusRaw).toLowerCase();

      if (lower in $Enums.booking_status) {
        status = lower as $Enums.booking_status;
      } else if (lower === 'confirmed') {
        status = $Enums.booking_status.booked;
      } else {
        throw new BadRequestException(
          `Invalid booking status: ${statusRaw}. Valid statuses: ${Object.values(
            $Enums.booking_status,
          ).join(', ')}`,
        );
      }
    }

    let booked_by: $Enums.booked_by_type =
      $Enums.booked_by_type.self;

    if (bookedByRaw) {
      const lower = String(bookedByRaw).toLowerCase();

      if (lower in $Enums.booked_by_type) {
        booked_by = lower as $Enums.booked_by_type;
      } else {
        throw new BadRequestException(
          `Invalid booked_by: ${bookedByRaw}. Valid options: ${Object.values(
            $Enums.booked_by_type,
          ).join(', ')}`,
        );
      }
    }

    const token_number = tokenNumberRaw
      ? String(tokenNumberRaw).trim().slice(0, 10)
      : this.generateToken();

    if (!token_number) {
      throw new BadRequestException(
        'token_number cannot be empty',
      );
    }

    /*
     * The entire booking operation is transactional.
     *
     * This guarantees:
     * 1. Slot capacity cannot be exceeded.
     * 2. booked_count and booking stay consistent.
     * 3. Every successful booking gets a queue entry.
     * 4. If any operation fails, everything rolls back.
     */
    const result = await this.prisma.$transaction(
      async (tx) => {
        const [farmerExists, slot, cropExists] =
          await Promise.all([
            tx.farmers.findUnique({
              where: { id: farmer_id },
            }),
            tx.slots.findUnique({
              where: { id: slot_id },
            }),
            tx.crops.findUnique({
              where: { id: crop_id },
            }),
          ]);

        if (!farmerExists) {
          throw new NotFoundException(
            `Farmer with id ${farmer_id} not found`,
          );
        }

        if (!slot) {
          throw new NotFoundException(
            `Slot with id ${slot_id} not found`,
          );
        }

        if (!cropExists) {
          throw new NotFoundException(
            `Crop with id ${crop_id} not found`,
          );
        }

        /*
         * The slot itself determines the crop.
         * This prevents a farmer from booking a slot
         * against a different crop.
         */
        if (slot.crop_id !== crop_id) {
          throw new BadRequestException(
            'Selected crop does not match the selected slot',
          );
        }

        /*
         * Atomic capacity protection.
         *
         * UPDATE only succeeds when:
         * booked_count < capacity
         *
         * Therefore concurrent requests cannot both
         * successfully consume the final slot.
         */
        const capacityUpdate =
          await tx.slots.updateMany({
            where: {
              id: slot_id,
              booked_count: {
                lt: slot.capacity,
              },
            },
            data: {
              booked_count: {
                increment: 1,
              },
            },
          });

        if (capacityUpdate.count !== 1) {
          throw new BadRequestException(
            'This slot is already full. Please select another available slot.',
          );
        }

        let booking;

        try {
          booking = await tx.bookings.create({
            data: {
              farmer_id,
              slot_id,
              crop_id,
              quantity_estimate,
              token_number,
              status,
              booked_by,
            },
          });
        } catch (error) {
          /*
           * If booking creation fails after the slot count
           * was incremented, the transaction automatically
           * rolls the slot count back.
           */
          throw error;
        }

        /*
         * A booking automatically enters the queue.
         * The queue uses the actual procurement centre
         * belonging to the selected slot.
         */
        const queueItem = await tx.queue.create({
          data: {
            booking_id: booking.id,
            centre_id: slot.centre_id,
            status: $Enums.queue_status.waiting,
            entered_at: new Date(),
            called_at: null,
          },
        });

        /*
         * Position among currently waiting farmers at
         * this procurement centre.
         */
        const waitingBefore =
          await tx.queue.count({
            where: {
              centre_id: slot.centre_id,
              status: $Enums.queue_status.waiting,
              id: {
                lt: queueItem.id,
              },
            },
          });

        const queuePosition = waitingBefore + 1;

        return {
          booking,
          queue: queueItem,
          queuePosition,
          slot: {
            id: slot.id,
            centre_id: slot.centre_id,
            capacity: slot.capacity,
            booked_count: slot.booked_count + 1,
            remaining_capacity:
              Math.max(
                slot.capacity -
                  (slot.booked_count + 1),
                0,
              ),
          },
        };
      },
    );

    return createSuccessResponse(
      result,
      'Slot booked successfully',
    );
  }

  async cancel(bookingId: number, userId: number) {
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      throw new BadRequestException(
        'Invalid bookingId: must be a positive integer',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
        include: {
          farmers: true,
          slots: true,
        },
      });

      if (!booking) {
        throw new NotFoundException(`Booking with id ${bookingId} not found`);
      }

      if (booking.farmers?.user_id !== userId) {
        throw new ForbiddenException(
          'You are not authorized to cancel this booking.',
        );
      }

      if (booking.status === $Enums.booking_status.cancelled) {
        throw new BadRequestException(
          'This booking has already been cancelled.',
        );
      }

      const updatedBooking = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: $Enums.booking_status.cancelled,
        },
      });

      await tx.queue.updateMany({
        where: { booking_id: bookingId },
        data: {
          status: $Enums.queue_status.done,
        },
      });

      if (booking.slots && booking.slots.booked_count > 0) {
        await tx.slots.update({
          where: { id: booking.slot_id },
          data: {
            booked_count: {
              decrement: 1,
            },
          },
        });
      }

      return updatedBooking;
    });

    return createSuccessResponse(result, 'Booking cancelled successfully');
  }

  private generateToken(): string {
    return `T-${Date.now()
      .toString(36)
      .slice(-4)
      .toUpperCase()}${Math.random()
      .toString(36)
      .slice(-3)
      .toUpperCase()}`.slice(0, 10);
  }
}
