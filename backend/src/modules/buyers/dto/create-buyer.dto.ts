/**
 * Body for POST /buyers. The only writable column is user_id (UUID).
 * Send `userId` (project convention); `user_id` is accepted as an alias.
 * Validation lives in BuyersService (class-validator is not installed in this backend).
 */
export class CreateBuyerDto {
  userId?: string;
  user_id?: string;
}
