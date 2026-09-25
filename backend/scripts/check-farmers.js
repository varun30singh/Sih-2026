const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres.umydaqwlkpgomtjbmvxj:%40Aditya1611@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function check() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const users = await client.query("SELECT id, phone, role, created_at FROM users WHERE role = 'farmer' ORDER BY id");
  console.log('=== FARMER USERS in users table ===');
  console.table(users.rows);
  const farmers = await client.query('SELECT id, user_id, name, phone, village FROM farmers ORDER BY id');
  console.log('=== FARMERS in farmers table ===');
  console.table(farmers.rows);
  const unlinked = await client.query("SELECT u.id, u.phone, u.role FROM users u LEFT JOIN farmers f ON u.id = f.user_id WHERE u.role = 'farmer' AND f.id IS NULL");
  console.log('=== UNLINKED FARMER USERS ===');
  console.table(unlinked.rows);
  await client.end();
}
check().catch(console.error);
