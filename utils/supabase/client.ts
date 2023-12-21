
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '../database.types'
import { appDomain, appHttp } from '../appURL';

export const createBrowserClient = () => createClientComponentClient<Database>({
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    // cookieOptions: {
    //     domain: `${appHttp}://${appDomain}`,
    //     secure: true,
    //     sameSite: 'none',
    //     path: '/',
    // }
});
