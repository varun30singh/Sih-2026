import { Injectable, createSuccessResponse, createErrorResponse } from '../../common';
import { ConfigService } from '../../config';
import { Pool } from 'pg';
import { BUYERS_TABLE, BUYER_COLUMNS, BuyerRow, toBuyer } from './buyer.entity';
import { CreateBuyerDto } from './dto/create-buyer.dto';
import { UpdateBuyerDto } from './dto/update-buyer.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INT4_MAX = 2147483647;

@Injectable()
export class BuyersService {
  private pool: Pool | null = null;

  constructor(private readonly config: ConfigService) {}

  /** Connection pool is created lazily from the existing DATABASE_URL config (no hard-coded credentials). */
  private getPool(): Pool {
    if (!this.pool) {
      this.pool = new Pool({ connectionString: this.config.databaseUrl });
    }
    return this.pool;
  }

  async findAll() {
    try {
      const { rows } = await this.getPool().query<BuyerRow>(
        `SELECT ${BUYER_COLUMNS} FROM ${BUYERS_TABLE} ORDER BY id`,
      );
      return createSuccessResponse(rows.map(toBuyer));
    } catch (err) {
      return this.dbError(err);
    }
  }

  async findById(rawId: string) {
    const id = BuyersService.parseId(rawId);
    if (id === null) return createErrorResponse('INVALID_BUYER_ID', 'Buyer id must be a positive integer');
    try {
      const { rows } = await this.getPool().query<BuyerRow>(
        `SELECT ${BUYER_COLUMNS} FROM ${BUYERS_TABLE} WHERE id = $1`,
        [id],
      );
      if (rows.length === 0) return createErrorResponse('BUYER_NOT_FOUND', `Buyer ${id} not found`);
      return createSuccessResponse(toBuyer(rows[0]));
    } catch (err) {
      return this.dbError(err);
    }
  }

  async create(body: CreateBuyerDto) {
    const userId = BuyersService.extractUserId(body);
    if (userId === null) return createErrorResponse('INVALID_USER_ID', 'userId must be a valid UUID');
    try {
      const { rows } = await this.getPool().query<BuyerRow>(
        `INSERT INTO ${BUYERS_TABLE} (user_id) VALUES ($1) RETURNING ${BUYER_COLUMNS}`,
        [userId],
      );
      return createSuccessResponse(toBuyer(rows[0]), 'Buyer created successfully');
    } catch (err) {
      return this.dbError(err);
    }
  }

  async update(rawId: string, body: UpdateBuyerDto) {
    const id = BuyersService.parseId(rawId);
    if (id === null) return createErrorResponse('INVALID_BUYER_ID', 'Buyer id must be a positive integer');
    const userId = BuyersService.extractUserId(body);
    if (userId === null) return createErrorResponse('INVALID_USER_ID', 'userId must be a valid UUID');
    try {
      const { rows } = await this.getPool().query<BuyerRow>(
        `UPDATE ${BUYERS_TABLE} SET user_id = $1 WHERE id = $2 RETURNING ${BUYER_COLUMNS}`,
        [userId, id],
      );
      if (rows.length === 0) return createErrorResponse('BUYER_NOT_FOUND', `Buyer ${id} not found`);
      return createSuccessResponse(toBuyer(rows[0]), 'Buyer updated successfully');
    } catch (err) {
      return this.dbError(err);
    }
  }

  async remove(rawId: string) {
    const id = BuyersService.parseId(rawId);
    if (id === null) return createErrorResponse('INVALID_BUYER_ID', 'Buyer id must be a positive integer');
    try {
      const { rows } = await this.getPool().query<BuyerRow>(
        `DELETE FROM ${BUYERS_TABLE} WHERE id = $1 RETURNING ${BUYER_COLUMNS}`,
        [id],
      );
      if (rows.length === 0) return createErrorResponse('BUYER_NOT_FOUND', `Buyer ${id} not found`);
      return createSuccessResponse(toBuyer(rows[0]), 'Buyer deleted successfully');
    } catch (err) {
      return this.dbError(err);
    }
  }

  /** Returns a positive int4 or null. */
  private static parseId(raw: string): number | null {
    if (typeof raw !== 'string' || !/^\d+$/.test(raw)) return null;
    const id = Number(raw);
    return id >= 1 && id <= INT4_MAX ? id : null;
  }

  /** Accepts `userId` (project convention) or `user_id`; returns a valid UUID string or null. */
  private static extractUserId(body: CreateBuyerDto | UpdateBuyerDto): string | null {
    const value = body?.userId ?? body?.user_id;
    return typeof value === 'string' && UUID_REGEX.test(value) ? value : null;
  }

  /** Maps PostgreSQL error codes to API error codes; never leaks raw DB messages. */
  private dbError(err: any) {
    switch (err?.code) {
      case '23503': // foreign_key_violation
        return createErrorResponse('INVALID_USER_ID', 'userId does not match an existing user');
      case '23505': // unique_violation
        return createErrorResponse('BUYER_CONFLICT', 'A buyer with this userId already exists');
      case '22P02': // invalid_text_representation (bad uuid)
        return createErrorResponse('INVALID_USER_ID', 'userId must be a valid UUID');
      default:
        console.error('[BuyersService] Database error:', err);
        return createErrorResponse('DATABASE_ERROR', 'Unable to complete the buyers request');
    }
  }
}
