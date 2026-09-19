/**
 * Body for PATCH /brokers/:id. `id` and `created_at` are immutable, so the
 * only updatable column is user_id (UUID). `userId` or `user_id` is accepted.
 */
export class UpdateBrokerDto {
  userId?: string;
  user_id?: string;
}
