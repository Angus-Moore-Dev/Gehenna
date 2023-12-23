'use client';

import { createBrowserClient } from "@/utils/supabase/client";
import { Button } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";


export default function SignOut()
{
    const router = useRouter();
    const supabase = createBrowserClient();

    return <Button color="red" onClick={async () => {
        const { error } = await supabase.auth
        .signOut();

        if (error)
        {
            console.error('signing out error::', error);
            notifications.show({
                title: 'Error Signing Out',
                message: error.message,
                color: 'red',
                variant: 'filled'
            });
        }
        else
            router.push('/');
    }}>
        <LogOutIcon size={24} className="mr-2" />
        Log out of Gehenna
    </Button>
}