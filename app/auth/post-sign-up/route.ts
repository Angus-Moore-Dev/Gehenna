import { Database } from "@/utils/database.types";
import { createApiClient } from "@/utils/supabase/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest)
{
    const supabase = createApiClient();
    const adminSupabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    
    const { email, handle, firstName, lastName } = await request.json() as { email: string; handle: string, firstName: string, lastName: string };
    
    // check if this user exists already.
    const { data, error } = await adminSupabase.auth.admin.listUsers({ });

    if (data && !error)
    {
        const user = data.users.find(u => u.email === email);

        if (user)
        {
            // This user exists, so we can now insert the new row into the profiles table.
            const { error } = await adminSupabase
            .from('profiles')
            .insert({
                id: user.id,
                handle,
                name: `${firstName}${lastName ? ` ${lastName}` : ''}`,
            });

            if (error)
            {
                console.log(`Error creating user ${user.id}: ${error.message}`);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }
            else
            {
                console.log(`User ${user.id} created successfully.`);
                return NextResponse.json({ message: 'User created successfully.' });
            }
        }
        else
        {
            console.error(`User not found: ${email}`);
            return NextResponse.json({ error: 'User not found.' }, { status: 404 });
        }
    }
    else if (error)
    {
        console.error(`Error fetching users: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}