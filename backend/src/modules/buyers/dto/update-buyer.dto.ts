/**
 * Body for PATCH /buyers/:id. `id` and `created_at` are immutable, so the
 * only updatable column is user_id (UUID). `userId` or `user_id` is accepted.
 */
export class UpdateBuyerDto {
  userId?: string;
  user_id?: string;
}
