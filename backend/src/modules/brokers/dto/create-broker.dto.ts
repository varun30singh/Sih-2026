/**
 * Body for POST /brokers. The only writable column is user_id (UUID).
 * Send `userId` (project convention); `user_id` is accepted as an alias.
 * Validation lives in BrokersService (class-validator is not installed in this backend).
 */
export class CreateBrokerDto {
  userId?: string;
  user_id?: string;
}
