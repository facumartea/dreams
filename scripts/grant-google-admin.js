// Run only in a trusted server environment with credentials from its secret manager.
// UUID is public identity, never a password/token. No account is created here.
require('dotenv').config({ quiet: true });
const { createClient } = require('@supabase/supabase-js');
async function main() {
    const id = process.argv[2];
    if (!/^[0-9a-f-]{36}$/i.test(id || '') || process.env.SUPABASE_URL !== 'https://nwsmbemwtexmrtpkgxrz.supabase.co' || !process.env.SUPABASE_SECRET_KEY) throw new Error('Invalid secure project/identity configuration');
    const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.auth.admin.getUserById(id);
    const user = data?.user;
    if (error || !user?.email_confirmed_at || user.email?.toLowerCase() !== 'admindreams@gmail.com' || !user.identities?.some(identity => identity.provider === 'google' && identity.identity_data?.email?.toLowerCase() === 'admindreams@gmail.com')) throw new Error('Verified Google administrator identity is required');
    const updated = await db.from('profiles').update({ role: 'admin' }).eq('id', user.id).eq('role', 'customer').select('id,role').maybeSingle();
    if (updated.error || updated.data?.role !== 'admin') throw new Error('Profile not promoted; inspect existing role safely');
    console.log('Verified Google profile promoted. Existing administrator access preserved.');
}
if (require.main === module) main().catch(() => { console.error('Administrator assignment blocked: verify project, identity and permissions.'); process.exitCode = 1; });
module.exports = { main };
