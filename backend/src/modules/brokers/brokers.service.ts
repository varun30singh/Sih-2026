import { Injectable, createSuccessResponse, createErrorResponse } from '../../common';
import { ConfigService } from '../../config';
import { Pool } from 'pg';
import { BROKERS_TABLE, BROKER_COLUMNS, BrokerRow, toBroker } from './broker.entity';
import { CreateBrokerDto } from './dto/create-broker.dto';
import { UpdateBrokerDto } from './dto/update-broker.dto';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const INT4_MAX = 2147483647;

@Injectable()
export class BrokersService {
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
      const { rows } = await this.getPool().query<BrokerRow>(
        `SELECT ${BROKER_COLUMNS} FROM ${BROKERS_TABLE} ORDER BY id`,
      );
      return createSuccessResponse(rows.map(toBroker));
    } catch (err) {
      return this.dbError(err);
    }
  }

  async findById(rawId: string) {
    const id = BrokersService.parseId(rawId);
    if (id === null) return createErrorResponse('INVALID_BROKER_ID', 'Broker id must be a positive integer');
    try {
      const { rows } = await this.getPool().query<BrokerRow>(
        `SELECT ${BROKER_COLUMNS} FROM ${BROKERS_TABLE} WHERE id = $1`,
        [id],
      );
      if (rows.length === 0) return createErrorResponse('BROKER_NOT_FOUND', `Broker ${id} not found`);
      return createSuccessResponse(toBroker(rows[0]));
    } catch (err) {
      return this.dbError(err);
    }
  }

  async create(body: CreateBrokerDto) {
    const userId = BrokersService.extractUserId(body);
    if (userId === null) return createErrorResponse('INVALID_USER_ID', 'userId must be a valid UUID');
    try {
      const { rows } = await this.getPool().query<BrokerRow>(
        `INSERT INTO ${BROKERS_TABLE} (user_id) VALUES ($1) RETURNING ${BROKER_COLUMNS}`,
        [userId],
      );
      return createSuccessResponse(toBroker(rows[0]), 'Broker created successfully');
    } catch (err) {
      return this.dbError(err);
    }
  }

  async update(rawId: string, body: UpdateBrokerDto) {
    const id = BrokersService.parseId(rawId);
    if (id === null) return createErrorResponse('INVALID_BROKER_ID', 'Broker id must be a positive integer');
    const userId = BrokersService.extractUserId(body);
    if (userId === null) return createErrorResponse('INVALID_USER_ID', 'userId must be a valid UUID');
    try {
      const { rows } = await this.getPool().query<BrokerRow>(
        `UPDATE ${BROKERS_TABLE} SET user_id = $1 WHERE id = $2 RETURNING ${BROKER_COLUMNS}`,
        [userId, id],
      );
      if (rows.length === 0) return createErrorResponse('BROKER_NOT_FOUND', `Broker ${id} not found`);
      return createSuccessResponse(toBroker(rows[0]), 'Broker updated successfully');
    } catch (err) {
      return this.dbError(err);
    }
  }

  async remove(rawId: string) {
    const id = BrokersService.parseId(rawId);
    if (id === null) return createErrorResponse('INVALID_BROKER_ID', 'Broker id must be a positive integer');
    try {
      const { rows } = await this.getPool().query<BrokerRow>(
        `DELETE FROM ${BROKERS_TABLE} WHERE id = $1 RETURNING ${BROKER_COLUMNS}`,
        [id],
      );
      if (rows.length === 0) return createErrorResponse('BROKER_NOT_FOUND', `Broker ${id} not found`);
      return createSuccessResponse(toBroker(rows[0]), 'Broker deleted successfully');
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
  private static extractUserId(body: CreateBrokerDto | UpdateBrokerDto): string | null {
    const value = body?.userId ?? body?.user_id;
    return typeof value === 'string' && UUID_REGEX.test(value) ? value : null;
  }

  /** Maps PostgreSQL error codes to API error codes; never leaks raw DB messages. */
  private dbError(err: any) {
    switch (err?.code) {
      case '23503': // foreign_key_violation
        return createErrorResponse('INVALID_USER_ID', 'userId does not match an existing user');
      case '23505': // unique_violation
        return createErrorResponse('BROKER_CONFLICT', 'A broker with this userId already exists');
      case '22P02': // invalid_text_representation (bad uuid)
        return createErrorResponse('INVALID_USER_ID', 'userId must be a valid UUID');
      default:
        console.error('[BrokersService] Database error:', err);
        return createErrorResponse('DATABASE_ERROR', 'Unable to complete the brokers request');
    }
  }
}
