import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { api } from '../lib/api';
import { getStoredToken, getStoredUser } from '../lib/auth';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface FarmerProfile {
  id: number;
  user_id: number | null;
  name: string;
  village: string | null;
  phone: string | null;
}

interface Centre {
  id: number;
  name: string;
  location: string;
  capacity_per_slot: number;
  processing_rate: number | null;
}

interface Crop {
  id: number;
  name: string;
  mspRate?: number;
  unit?: string;
}

interface Slot {
  id: number;
  centre_id: number;
  crop_id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
}

interface BookingSuccessData {
  token_number: string;
  centreName: string;
  centreLocation: string;
  date: string;
  slotTime: string;
  cropName: string;
  quantity: string;
  queuePosition?: number;
}

export default function BookSlotScreen() {
  const params = useLocalSearchParams<{ centreId?: string }>();

  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Selections
  const [selectedCentreId, setSelectedCentreId] = useState<number | null>(
    params.centreId ? Number(params.centreId) : null,
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState('');

  // UI States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [validationError, setValidationError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Confirmation Success State
  const [bookingSuccess, setBookingSuccess] =
    useState<BookingSuccessData | null>(null);

  async function loadInitialData() {
    try {
      setLoadError('');
      setLoading(true);

      const token = await getStoredToken();
      const user = await getStoredUser();

      if (!token || !user?.id) {
        router.replace('/');
        return;
      }

      // Fetch farmer profile, centres, crops, and slots from real backend endpoints
      const [farmerRes, centresRes, cropsRes, slotsRes] = await Promise.all([
        api.get<ApiResponse<FarmerProfile>>(`/farmers/user/${user.id}`, token),
        api.get<ApiResponse<Centre[]>>('/procurement-centres', token),
        api.get<ApiResponse<Crop[]>>('/crops', token),
        api.get<ApiResponse<Slot[]>>('/slots', token),
      ]);

      const fetchedCentres = centresRes.data || [];
      const fetchedCrops = cropsRes.data || [];
      const fetchedSlots = slotsRes.data || [];

      setFarmer(farmerRes.data || null);
      setCentres(fetchedCentres);
      setCrops(fetchedCrops);
      setSlots(fetchedSlots);

      // Auto-select centre if parameter provided or only 1 exists
      if (params.centreId) {
        setSelectedCentreId(Number(params.centreId));
      } else if (fetchedCentres.length === 1) {
        setSelectedCentreId(fetchedCentres[0].id);
      }
    } catch (err) {
      console.error('Error loading booking data:', err);
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Unable to load procurement information. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter slots for selected centre
  const centreSlots = useMemo(() => {
    if (!selectedCentreId) return [];
    return slots.filter((s) => s.centre_id === selectedCentreId);
  }, [slots, selectedCentreId]);

  // Extract unique available dates for selected centre
  const availableDates = useMemo(() => {
    const dates = Array.from(
      new Set(
        centreSlots.map((s) => {
          if (!s.date) return '';
          return s.date.includes('T') ? s.date.split('T')[0] : s.date;
        }),
      ),
    ).filter(Boolean);
    return dates.sort();
  }, [centreSlots]);

  // Auto-select first date when availableDates updates or resets
  useEffect(() => {
    if (availableDates.length > 0) {
      if (!selectedDate || !availableDates.includes(selectedDate)) {
        setSelectedDate(availableDates[0]);
      }
    } else {
      setSelectedDate(null);
    }
    setSelectedSlotId(null);
  }, [availableDates]);

  // Slots for the selected date
  const dateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return centreSlots.filter((s) => {
      const slotDateStr = s.date.includes('T') ? s.date.split('T')[0] : s.date;
      return slotDateStr === selectedDate;
    });
  }, [centreSlots, selectedDate]);

  // Find currently selected entities
  const selectedCentre = useMemo(
    () => centres.find((c) => c.id === selectedCentreId) || null,
    [centres, selectedCentreId],
  );

  const selectedSlot = useMemo(
    () => slots.find((s) => s.id === selectedSlotId) || null,
    [slots, selectedSlotId],
  );

  const selectedCrop = useMemo(
    () => crops.find((c) => c.id === selectedCropId) || null,
    [crops, selectedCropId],
  );

  // When a slot is chosen, if the slot defines a crop_id, auto-select it
  function handleSelectSlot(slot: Slot) {
    const remaining = slot.capacity - slot.booked_count;
    if (remaining <= 0) return; // Disabled

    setSelectedSlotId(slot.id);
    setValidationError('');

    if (slot.crop_id) {
      setSelectedCropId(slot.crop_id);
    }
  }

  function formatDate(isoString: string): string {
    try {
      const d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return isoString;
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  }

  function formatTime(isoString: string): string {
    try {
      const d = new Date(isoString);
      if (Number.isNaN(d.getTime())) return isoString;
      return d.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  }

  async function handleConfirmBooking() {
    setValidationError('');
    setSubmitError('');

    // Field Validations
    if (!farmer) {
      setValidationError('Farmer profile not loaded. Please log in again.');
      return;
    }

    if (!selectedCentreId) {
      setValidationError('Please select a procurement centre (Step 1).');
      return;
    }

    if (!selectedDate || !selectedSlotId) {
      setValidationError('Please select an available time slot (Step 2).');
      return;
    }

    if (!selectedCropId) {
      setValidationError('Please select a crop (Step 3).');
      return;
    }

    const qtyNum = Number(quantity.trim());
    if (!quantity.trim() || Number.isNaN(qtyNum) || qtyNum <= 0) {
      setValidationError(
        'Please enter a valid estimated harvest quantity in quintals.',
      );
      return;
    }

    try {
      setSubmitting(true);
      const token = await getStoredToken();
      if (!token) {
        router.replace('/');
        return;
      }

      const payload = {
        farmer_id: farmer.id,
        slot_id: selectedSlotId,
        crop_id: selectedCropId,
        quantity_estimate: qtyNum,
        booked_by: 'self',
        status: 'booked',
      };

      const res = await api.post<
        ApiResponse<{
          booking?: {
            id: number;
            token_number: string;
            status: string;
          };
          token_number?: string;
          queuePosition?: number;
        }>
      >('/bookings', payload, token);

      const bookingData = res.data?.booking;
      const tokenNumber =
        bookingData?.token_number || res.data?.token_number || 'T-PENDING';
      const queuePosition = res.data?.queuePosition;

      // Transition to Confirmation View
      setBookingSuccess({
        token_number: tokenNumber,
        centreName: selectedCentre?.name || 'Procurement Centre',
        centreLocation: selectedCentre?.location || '',
        date: formatDate(selectedDate),
        slotTime: selectedSlot
          ? `${formatTime(selectedSlot.start_time)} – ${formatTime(selectedSlot.end_time)}`
          : 'Scheduled Window',
        cropName: selectedCrop?.name || 'Crop',
        quantity: String(qtyNum),
        queuePosition,
      });
    } catch (err) {
      console.error('Booking submission error:', err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Failed to create booking. Please check your network and retry.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  // 1. Loading State
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1F6B45" />
        <Text style={styles.loadingText}>Loading procurement slots...</Text>
      </View>
    );
  }

  // 2. Fatal Load Error State
  if (loadError) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorHeading}>Unable to Load Data</Text>
        <Text style={styles.errorSubtext}>{loadError}</Text>
        <Pressable style={styles.retryButton} onPress={loadInitialData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  // 3. Success Confirmation Screen
  if (bookingSuccess) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.successContainer}
      >
        <View style={styles.successIconBadge}>
          <Text style={styles.successCheckmark}>✓</Text>
        </View>

        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSubtitle}>
          Your procurement slot is secured in the official MandiMitra system.
        </Text>

        {/* Token Card */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>YOUR TOKEN NUMBER</Text>
          <Text style={styles.tokenNumber}>#{bookingSuccess.token_number}</Text>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>CONFIRMED & QUEUED</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsHeading}>Slot Details</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Procurement Centre</Text>
            <Text style={styles.detailValue}>
              {bookingSuccess.centreName}
              {bookingSuccess.centreLocation
                ? ` (${bookingSuccess.centreLocation})`
                : ''}
            </Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Scheduled Date</Text>
            <Text style={styles.detailValue}>{bookingSuccess.date}</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Window</Text>
            <Text style={styles.detailValue}>{bookingSuccess.slotTime}</Text>
          </View>

          <View style={styles.detailDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Crop & Quantity</Text>
            <Text style={styles.detailValue}>
              {bookingSuccess.cropName} • {bookingSuccess.quantity} Quintals
            </Text>
          </View>

          {bookingSuccess.queuePosition !== undefined && (
            <>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Live Queue Position</Text>
                <Text style={[styles.detailValue, { color: '#1F6B45' }]}>
                  Position #{bookingSuccess.queuePosition}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Action Buttons */}
        <Pressable
          style={styles.primaryActionButton}
          onPress={() => router.replace('/queue')}
        >
          <Text style={styles.primaryActionText}>View My Queue</Text>
        </Pressable>

        <Pressable
          style={styles.secondaryActionButton}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.secondaryActionText}>Back to Home</Text>
        </Pressable>
      </ScrollView>
    );
  }

  // 4. Main Booking Form
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.formContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Farmer Greeting Banner */}
      <View style={styles.greetingBanner}>
        <View style={styles.greetingTextContainer}>
          <Text style={styles.greetingFarmerName}>
            {farmer?.name || 'Farmer'}
          </Text>
          <Text style={styles.greetingSubtext}>
            {farmer?.village ? `📍 ${farmer.village}` : 'MandiMitra Procurement'}
          </Text>
        </View>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>4 Steps</Text>
        </View>
      </View>

      {/* Validation Error Banner */}
      {validationError ? (
        <View style={styles.validationBanner}>
          <Text style={styles.validationText}>⚠️ {validationError}</Text>
        </View>
      ) : null}

      {/* Submission Failure Banner */}
      {submitError ? (
        <View style={styles.submitErrorCard}>
          <Text style={styles.submitErrorHeading}>Booking Failed</Text>
          <Text style={styles.submitErrorText}>{submitError}</Text>
          <Pressable
            style={styles.retrySubmitButton}
            onPress={handleConfirmBooking}
          >
            <Text style={styles.retrySubmitButtonText}>Retry Booking</Text>
          </Pressable>
        </View>
      ) : null}

      {/* ================= STEP 1: CHOOSE CENTRE ================= */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Choose Procurement Centre</Text>
        </View>

        {centres.length === 0 ? (
          <View style={styles.emptyNotice}>
            <Text style={styles.emptyNoticeText}>
              No procurement centres currently available.
            </Text>
          </View>
        ) : (
          centres.map((centre) => {
            const isSelected = centre.id === selectedCentreId;
            return (
              <Pressable
                key={centre.id}
                style={[
                  styles.selectionCard,
                  isSelected && styles.selectionCardActive,
                ]}
                onPress={() => {
                  setSelectedCentreId(centre.id);
                  setValidationError('');
                }}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.selectionCardContent}>
                  <Text style={styles.cardTitle}>{centre.name}</Text>
                  <Text style={styles.cardSubtitle}>📍 {centre.location}</Text>
                  <Text style={styles.cardMeta}>
                    Slot Capacity: {centre.capacity_per_slot}
                    {centre.processing_rate
                      ? ` • Processing: ${centre.processing_rate} qtl/hr`
                      : ''}
                  </Text>
                </View>
              </Pressable>
            );
          })
        )}
      </View>

      {/* ================= STEP 2: CHOOSE DATE & TIME SLOT ================= */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>Choose Date & Available Slot</Text>
        </View>

        {!selectedCentreId ? (
          <Text style={styles.stepHint}>
            Please select a procurement centre above first.
          </Text>
        ) : availableDates.length === 0 ? (
          <View style={styles.emptyNotice}>
            <Text style={styles.emptyNoticeText}>
              No scheduled slots available for this centre at this time.
            </Text>
          </View>
        ) : (
          <>
            {/* Date Selector Chips */}
            <Text style={styles.substepLabel}>Select Date:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateChipScroll}
            >
              {availableDates.map((dateStr) => {
                const isSelected = dateStr === selectedDate;
                return (
                  <Pressable
                    key={dateStr}
                    style={[
                      styles.dateChip,
                      isSelected && styles.dateChipActive,
                    ]}
                    onPress={() => {
                      setSelectedDate(dateStr);
                      setSelectedSlotId(null);
                      setValidationError('');
                    }}
                  >
                    <Text
                      style={[
                        styles.dateChipText,
                        isSelected && styles.dateChipTextActive,
                      ]}
                    >
                      📅 {formatDate(dateStr)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Slot List for Selected Date */}
            <Text style={[styles.substepLabel, { marginTop: 14 }]}>
              Select Time Window:
            </Text>

            {dateSlots.length === 0 ? (
              <Text style={styles.stepHint}>
                No slots found for the chosen date.
              </Text>
            ) : (
              dateSlots.map((slot) => {
                const isSelected = slot.id === selectedSlotId;
                const remaining = Math.max(0, slot.capacity - slot.booked_count);
                const isFull = remaining <= 0;
                const slotCrop = crops.find((c) => c.id === slot.crop_id);

                return (
                  <Pressable
                    key={slot.id}
                    disabled={isFull}
                    style={[
                      styles.slotCard,
                      isSelected && styles.slotCardActive,
                      isFull && styles.slotCardFull,
                    ]}
                    onPress={() => handleSelectSlot(slot)}
                  >
                    <View style={styles.slotHeaderRow}>
                      <Text
                        style={[
                          styles.slotTimeText,
                          isFull && styles.slotTimeTextFull,
                        ]}
                      >
                        🕒 {formatTime(slot.start_time)} –{' '}
                        {formatTime(slot.end_time)}
                      </Text>

                      {/* Capacity Badge */}
                      {isFull ? (
                        <View style={styles.fullBadge}>
                          <Text style={styles.fullBadgeText}>FULL</Text>
                        </View>
                      ) : remaining <= 2 ? (
                        <View style={styles.lowCapacityBadge}>
                          <Text style={styles.lowCapacityBadgeText}>
                            {remaining} left
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.availableBadge}>
                          <Text style={styles.availableBadgeText}>
                            {remaining} available
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.slotMetaRow}>
                      <Text style={styles.slotCapacityText}>
                        Booked: {slot.booked_count} / {slot.capacity}
                      </Text>
                      {slotCrop && (
                        <Text style={styles.slotCropTag}>
                          🌾 {slotCrop.name}
                        </Text>
                      )}
                    </View>
                  </Pressable>
                );
              })
            )}
          </>
        )}
      </View>

      {/* ================= STEP 3: CHOOSE CROP & QUANTITY ================= */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepTitle}>Crop & Estimated Quantity</Text>
        </View>

        <Text style={styles.substepLabel}>Select Crop:</Text>
        <View style={styles.cropGrid}>
          {crops.map((crop) => {
            const isSelected = crop.id === selectedCropId;
            const matchesSlotCrop = selectedSlot?.crop_id === crop.id;

            return (
              <Pressable
                key={crop.id}
                style={[
                  styles.cropChip,
                  isSelected && styles.cropChipActive,
                  matchesSlotCrop && styles.cropChipMatched,
                ]}
                onPress={() => {
                  setSelectedCropId(crop.id);
                  setValidationError('');
                }}
              >
                <Text
                  style={[
                    styles.cropChipName,
                    isSelected && styles.cropChipNameActive,
                  ]}
                >
                  🌾 {crop.name}
                </Text>
                {crop.mspRate && (
                  <Text
                    style={[
                      styles.cropChipMsp,
                      isSelected && styles.cropChipMspActive,
                    ]}
                  >
                    MSP ₹{crop.mspRate.toLocaleString('en-IN')}/{crop.unit || 'qtl'}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Quantity Field */}
        <Text style={[styles.substepLabel, { marginTop: 14 }]}>
          Estimated Quantity:
        </Text>
        <View style={styles.quantityInputRow}>
          <TextInput
            style={styles.quantityInput}
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text);
              setValidationError('');
            }}
            placeholder="e.g. 50"
            placeholderTextColor="#8A938D"
            keyboardType="decimal-pad"
            editable={!submitting}
          />
          <View style={styles.quantityUnitBox}>
            <Text style={styles.quantityUnitText}>Quintals</Text>
          </View>
        </View>

        {/* Estimated Value Calculation */}
        {selectedCrop?.mspRate && Number(quantity) > 0 ? (
          <View style={styles.estimateBox}>
            <Text style={styles.estimateText}>
              Estimated MSP Payout:{' '}
              <Text style={styles.estimateValue}>
                ₹
                {(
                  Number(quantity) * selectedCrop.mspRate
                ).toLocaleString('en-IN')}
              </Text>
            </Text>
          </View>
        ) : null}
      </View>

      {/* ================= STEP 4: REVIEW & CONFIRM ================= */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumberBadge}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <Text style={styles.stepTitle}>Review & Confirm</Text>
        </View>

        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Farmer</Text>
            <Text style={styles.summaryValue}>{farmer?.name || '—'}</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Centre</Text>
            <Text style={styles.summaryValue}>
              {selectedCentre?.name || 'Not selected'}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Date & Window</Text>
            <Text style={styles.summaryValue}>
              {selectedDate && selectedSlot
                ? `${formatDate(selectedDate)} (${formatTime(selectedSlot.start_time)})`
                : 'Not selected'}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Crop & Quantity</Text>
            <Text style={styles.summaryValue}>
              {selectedCrop?.name || 'Not selected'}
              {quantity ? ` • ${quantity} Qtl` : ''}
            </Text>
          </View>
        </View>

        {/* Confirm Button */}
        <Pressable
          style={[
            styles.confirmBookingButton,
            submitting && styles.confirmBookingButtonDisabled,
          ]}
          onPress={handleConfirmBooking}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmBookingButtonText}>Confirm Booking</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F4',
  },
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F4',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#68736B',
    fontWeight: '500',
  },
  errorIcon: {
    fontSize: 38,
    marginBottom: 8,
  },
  errorHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#202720',
  },
  errorSubtext: {
    fontSize: 13,
    color: '#68736B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#1F6B45',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Greeting Banner
  greetingBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EDE9',
  },
  greetingTextContainer: {
    flex: 1,
  },
  greetingFarmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#202720',
  },
  greetingSubtext: {
    fontSize: 12,
    color: '#68736B',
    marginTop: 2,
  },
  stepBadge: {
    backgroundColor: '#E5F1EA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F6B45',
  },

  // Error Banners
  validationBanner: {
    backgroundColor: '#FFF4E5',
    borderColor: '#FFD8A8',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  validationText: {
    color: '#8A5300',
    fontSize: 13,
    fontWeight: '600',
  },
  submitErrorCard: {
    backgroundColor: '#FDE8E8',
    borderColor: '#F8B4B4',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  submitErrorHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#9B1C1C',
  },
  submitErrorText: {
    fontSize: 12,
    color: '#9B1C1C',
    marginTop: 4,
  },
  retrySubmitButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#9B1C1C',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
  },
  retrySubmitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },

  // Step Cards
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8EDE9',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F6B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#202720',
  },
  stepHint: {
    fontSize: 13,
    color: '#68736B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  substepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344139',
    marginBottom: 8,
  },
  emptyNotice: {
    padding: 12,
    backgroundColor: '#F5F7F4',
    borderRadius: 10,
    marginTop: 4,
  },
  emptyNoticeText: {
    fontSize: 12,
    color: '#68736B',
  },

  // Centre Selection
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    backgroundColor: '#FAFCFA',
    marginBottom: 8,
  },
  selectionCardActive: {
    borderColor: '#1F6B45',
    backgroundColor: '#F0F7F2',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1F6B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1F6B45',
  },
  selectionCardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#202720',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#68736B',
    marginTop: 2,
  },
  cardMeta: {
    fontSize: 11,
    color: '#8A938D',
    marginTop: 4,
  },

  // Date Selector
  dateChipScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FAFCFA',
    borderWidth: 1,
    borderColor: '#E8EDE9',
    marginRight: 8,
  },
  dateChipActive: {
    backgroundColor: '#1F6B45',
    borderColor: '#1F6B45',
  },
  dateChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#344139',
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },

  // Slot Selection
  slotCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    backgroundColor: '#FAFCFA',
    marginBottom: 8,
  },
  slotCardActive: {
    borderColor: '#1F6B45',
    backgroundColor: '#F0F7F2',
  },
  slotCardFull: {
    opacity: 0.55,
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTimeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#202720',
  },
  slotTimeTextFull: {
    color: '#8A938D',
  },
  availableBadge: {
    backgroundColor: '#E5F1EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  availableBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1F6B45',
  },
  lowCapacityBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowCapacityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  fullBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  slotMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  slotCapacityText: {
    fontSize: 11,
    color: '#68736B',
  },
  slotCropTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F6B45',
  },

  // Crop Selection
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    backgroundColor: '#FAFCFA',
  },
  cropChipActive: {
    backgroundColor: '#1F6B45',
    borderColor: '#1F6B45',
  },
  cropChipMatched: {
    borderColor: '#1F6B45',
  },
  cropChipName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#202720',
  },
  cropChipNameActive: {
    color: '#FFFFFF',
  },
  cropChipMsp: {
    fontSize: 11,
    color: '#68736B',
    marginTop: 2,
  },
  cropChipMspActive: {
    color: '#E5F1EA',
  },

  // Quantity Input
  quantityInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#FAFCFA',
    borderWidth: 1,
    borderColor: '#D4DDD6',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
    color: '#202720',
  },
  quantityUnitBox: {
    marginLeft: 8,
    backgroundColor: '#E5F1EA',
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityUnitText: {
    color: '#1F6B45',
    fontWeight: '700',
    fontSize: 13,
  },
  estimateBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F0F7F2',
    borderRadius: 8,
  },
  estimateText: {
    fontSize: 12,
    color: '#344139',
  },
  estimateValue: {
    fontWeight: '700',
    color: '#1F6B45',
  },

  // Review Summary
  summaryContainer: {
    backgroundColor: '#FAFCFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    padding: 12,
    marginBottom: 14,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#68736B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#202720',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E8EDE9',
    marginVertical: 4,
  },

  // Confirm Button
  confirmBookingButton: {
    backgroundColor: '#1F6B45',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBookingButtonDisabled: {
    opacity: 0.65,
  },
  confirmBookingButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Success Confirmation Styles
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1F6B45',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  successCheckmark: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#202720',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    color: '#68736B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  tokenCard: {
    width: '100%',
    backgroundColor: '#1F6B45',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E5F1EA',
    letterSpacing: 1,
  },
  tokenNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 6,
    fontFamily: 'monospace',
  },
  statusPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8EDE9',
    marginBottom: 20,
  },
  detailsHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#202720',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#68736B',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#202720',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 10,
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E8EDE9',
    marginVertical: 2,
  },
  primaryActionButton: {
    width: '100%',
    backgroundColor: '#1F6B45',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryActionButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4DDD6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionText: {
    color: '#344139',
    fontSize: 14,
    fontWeight: '700',
  },
});
