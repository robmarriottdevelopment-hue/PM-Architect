const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Testing connection to:', supabaseUrl);
  console.log('Using Key:', supabaseAnonKey ? (supabaseAnonKey.substring(0, 10) + '...') : 'MISSING');

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: Missing environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data, error } = await supabase.from('projects').select('*').limit(1);

    if (error) {
      console.log('Server Error Object:', JSON.stringify(error, null, 2));
      if (error.code === '42P01') {
        console.log('✅ Connection Successful! (Note: Table "projects" not found - make sure to run the SQL script).');
      } else {
        console.error('❌ Supabase Error:', error.message || error.code);
      }
    } else {
      console.log('✅ Connection Successful! Data fetched:', data);
    }
  } catch (err) {
    console.error('❌ Network/Fetch Error:', err);
  }
}

testConnection();
