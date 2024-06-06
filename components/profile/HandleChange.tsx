'use client';

import { Profile } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Input } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";



export default function HandleChange({ profile }: { profile: Profile })
{
    const supabase = createBrowserClient();
    const [newHandle, setNewHandle] = useState(profile.handle);
    const [isLoading, setIsLoading] = useState(false);

    return <div className="flex flex-col gap-2">
        <Input.Wrapper label="Update Handle (Max 32 characters)" description={`This will update the subdomain your readers use to read your posts. Please ensure your readers know.`}>
            <Input type="text" maxLength={32} placeholder="heisenberg" value={newHandle} onChange={e => setNewHandle(e.target.value)} />
        </Input.Wrapper>
        <Button color="red" onClick={async () => {
            if (isLoading) return;
            setIsLoading(true);

            const { error } = await supabase
            .from('profiles')
            .update({
                handle: newHandle
            })
            .eq('id', profile.id);

            if (error)
            {
                console.error('Failed to update handle::', error);
                notifications.show({
                    title: 'Failed to update handle',
                    message: error.message,
                    color: 'red',
                    variant: 'filled'
                });
            }
            else
            {
                notifications.show({
                    title: 'Handle updated',
                    message: 'Your handle has been updated successfully. It will update when you refresh the page.',
                    color: 'green',
                });
            }
            setIsLoading(false);
        }}>
            Confirm New Handle
        </Button>
    </div>
}