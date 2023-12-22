import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../database.types";
import { cookies } from "next/headers";
import { CookieOptions } from "@supabase/ssr";

const cookieOptions: CookieOptions = {
    path: '/',
    domain: process.env.NODE_ENV === 'development' ? '.dev.local' : '.gehenna.dev',
    sameSite: 'lax',
    secure: false,
};

export const createServerClient = () => createServerComponentClient<Database>({ cookies }, { cookieOptions });
export const createApiClient = () => createRouteHandlerClient<Database>({ cookies }, { cookieOptions });