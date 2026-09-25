# Mock Accounts

These accounts are fake test data for local or shared-environment verification. The shared password is `Test@12345`.

| Phone | Password | Role | Label |
| --- | --- | --- | --- |
| `9999900001` | `Test@12345` | `farmer` | MOCK Farmer |
| `9999900002` | `Test@12345` | `retail_user` | MOCK Retail User |
| `9999900003` | `Test@12345` | `stockist` | MOCK Stockist |
| `9999900004` | `Test@12345` | `broker` | MOCK Broker |
| `9999900005` | `Test@12345` | `buyer` | MOCK Buyer |
| `9999900006` | `Test@12345` | `operator` | MOCK Centre Staff |
| `9999900007` | `Test@12345` | `admin` | MOCK Government Authority |

## Seed

Build the backend first, then run:

```powershell
npm run build:backend
node backend/scripts/seed-mock-users.js
```

The seed script skips any account whose fixed phone already exists.

## Remove

```powershell
node backend/scripts/remove-mock-users.js
```

The remove script targets only the seven fixed mock phone numbers and deletes their profile rows before deleting those users.