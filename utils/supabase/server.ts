import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../database.types";
import { cookies } from "next/headers";
import { CookieOptions } from "@supabase/ssr";

const cookieOptions: CookieOptions = {
    path: '/',
    domain: process.env.NODE_ENV === 'development' ? '.localhost:3000' : '.gehenna.app',
    sameSite: 'lax',
    secure: false,
};

export const createServerClient = () => createServerComponentClient<Database>({ cookies });
export const createApiClient = () => createRouteHandlerClient<Database>({ cookies }, { cookieOptions });