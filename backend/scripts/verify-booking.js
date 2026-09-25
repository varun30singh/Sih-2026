const { Client } = require('pg');
const DATABASE_URL = 'postgresql://postgres.umydaqwlkpgomtjbmvxj:%40Aditya1611@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres';

async function testBooking() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Connected to DB. Testing farmer booking...');

  // 1. Get farmer with user_id = 42
  const farmerRes = await client.query('SELECT * FROM farmers WHERE user_id = 42');
  const farmer = farmerRes.rows[0];
  console.log('Farmer for user 42:', farmer);

  // 2. Get an available slot
  const slotRes = await client.query('SELECT * FROM slots WHERE id = 33');
  const slot = slotRes.rows[0];
  console.log('Target slot:', slot);

  // 3. Create booking
  const token = 'T-TEST' + Date.now().toString(36).slice(-4).toUpperCase();
  const bookingRes = await client.query(
    'INSERT INTO bookings (farmer_id, slot_id, crop_id, quantity_estimate, token_number, status, booked_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [farmer.id, slot.id, slot.crop_id, 25, token, 'booked', 'self']
  );
  const booking = bookingRes.rows[0];
  console.log('Created booking:', booking);

  // 4. Create queue entry
  const queueRes = await client.query(
    'INSERT INTO queue (booking_id, centre_id, status, entered_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [booking.id, slot.centre_id, 'waiting', new Date()]
  );
  console.log('Created queue entry:', queueRes.rows[0]);

  // 5. Update slot booked_count
  await client.query('UPDATE slots SET booked_count = booked_count + 1 WHERE id = $1', [slot.id]);

  console.log('\nBooking test SUCCEEDED! Booking ID:', booking.id, 'Token:', booking.token_number);

  await client.end();
}

testBooking().catch(console.error);
