'use client';

import { createBrowserClient } from "@/utils/supabase/client";
import { Loader } from "@mantine/core";
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

    return <span className="text-sm text-neutral-500 font-light">
        We currently have { totalUsers === undefined ? <Loader size={12} /> : totalUsers } author{totalUsers && totalUsers !== 1 ? 's' : ''}.
    </span>
}