# Backend Conventions — MandiSetu (SIH 26032)

All backend modules must follow this doc. If your code doesn't match, align it before merging into `main`.

---

## 1. Response Format

**Success:**
```json
{
  "success": true,
  "data": { },
  "message": "User created successfully"
}
```

**Error:**
```json
{
  "success": false,
  "message": "User not found",
  "error": "NOT_FOUND"
}
```

Use a shared response interceptor/wrapper — don't hand-format responses inside every controller method.

---

## 2. Naming Conventions

| Context              | Style           | Example                  |
|-----------------------|-----------------|---------------------------|
| Database columns       | snake_case      | `user_id`, `created_at`   |
| TS variables / DTOs    | camelCase       | `userId`, `createdAt`     |
| Route paths            | kebab-case, plural | `/users`, `/audit-logs` |
| Module/Class names      | PascalCase      | `UsersModule`, `AuditLogService` |
| Files                  | kebab-case      | `users.controller.ts`     |

---

## 3. Module Folder Structure

backend/src/<module-name>/
├── <module>.controller.ts
├── <module>.service.ts
├── <module>.module.ts
├── dto/
│ ├── create-<module>.dto.ts
│ └── update-<module>.dto.ts
└── entities/
└── <module>.entity.ts


---

## 4. Shared Code — always reuse, never duplicate

Located in `backend/src/common/`:
- `guards/jwt-auth.guard.ts` — authentication
- `dto/pagination.dto.ts` — `{ page, limit }`
- `interceptors/response.interceptor.ts` — wraps all responses in the format above
- `filters/http-exception.filter.ts` — standard error formatting

If a module needs auth, pagination, or error handling — import from `common/`, don't write a new one.

---

## 5. Error Handling

Use NestJS built-in exceptions:
```ts
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid slot ID');
```
Don't return raw `try/catch` error objects from controllers.

---

## 6. Database / ORM

- ORM: **Prisma**
- Source of truth: raw SQL migrations in `database/migrations/` and `database/schema/`, applied to Supabase manually (SQL Editor or `psql`)
- After any SQL migration is applied to Supabase, run `npx prisma db pull` inside `backend/` to regenerate `backend/prisma/schema.prisma`
- Run `npx prisma generate` after every `db pull` to update the typed client
- **Do not hand-edit `schema.prisma`** — it is regenerated from the real database via `db pull` and will be overwritten
- New tables/columns must go through a new numbered file in `database/migrations/` first (e.g. `02_add_users_and_audit_log.sql`), applied to Supabase, then pulled into Prisma
- Every table must include `created_at` and `updated_at`

---

## 7. Git Workflow

- No direct commits to `main` for code — docs and DB migrations may go straight to `main` after a quick heads-up to the team, since they affect everyone
- Branch naming: `feat/<module-name>`, `fix/<description>`, `chore/<description>`
- Every merge into `main` goes through a Pull Request, reviewed by the repo owner
- Pull `main` and merge into your branch daily before continuing work

---

## 8. Audit Logging

Any module that creates/updates/deletes a record should call the shared audit service once it exists:
```ts
this.auditLogService.log(userId, 'CREATE', 'Stockist', stockistId, details);
```
(Module in progress — check `backend/src/audit-log/` once merged.)