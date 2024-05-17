
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../database.types'
import { CookieOptions } from '@supabase/ssr';

// const cookieOptions: CookieOptions = {
//     path: '/',
//     domain: process.env.NODE_ENV === 'development' ? '.localhost:3000' : '.gehenna.app',
//     sameSite: 'none',
//     secure: false,
// };

export const createBrowserClient = () => createClientComponentClient<Database>({
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
});
