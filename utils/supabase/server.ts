import { createRouteHandlerClient, createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "../database.types";
import { cookies } from "next/headers";

export const createServerClient = () => createServerComponentClient<Database>({ cookies: cookies });

export const createApiClient = () => createRouteHandlerClient<Database>({ cookies });