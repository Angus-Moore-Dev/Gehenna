import { createBrowserSupabaseClient, createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { GetServerSidePropsContext, NextApiRequest, NextApiResponse } from "next";

export const virginDb = createBrowserSupabaseClient();
export const clientDb = createBrowserSupabaseClient({
    supabaseUrl: process.env.NEXT_PUBLIC_POSTGRES_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_POSTGRES_ANON_KEY!
});

export const serverDb = (context: GetServerSidePropsContext) => createServerSupabaseClient(context);
export const apiServerDb = (req: NextApiRequest, res: NextApiResponse) => createServerSupabaseClient({ req, res });
export const superClient = (serviceRoleKey: string) => createClient(process.env.NEXT_PUBLIC_POSTGRES_URL!, serviceRoleKey);