'use client';

import { createBrowserClient } from "@/utils/supabase/client";
import { Loader, Text } from "@mantine/core";
import { useEffect, useState } from "react";



export default function TotalUsersCount()
{
    const supabase = createBrowserClient();
    const [totalUsers, setTotalUsers] = useState<number>();

    useEffect(() => {
        supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .then(({ count }) => {
            if (count !== null)
                setTotalUsers(count);
        });
    }, [supabase]);

    return <div className="text-sm text-neutral-300 flex flex-row items-center gap-1">
        We currently have <Text c='green'>{ totalUsers === undefined ? <Loader size={12} /> : totalUsers }</Text> author{totalUsers && totalUsers !== 1 ? 's' : ''}.
    </div>
}