'use client';

import { Profile } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Input } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";



export default function NameChange({ profile }: { profile: Profile })
{
    const supabase = createBrowserClient();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    return <div className="flex flex-col gap-2">
        <Input.Wrapper label="Update Name (Max 64 Characters)" description={`Change your display name here. Please use a name that you want your readers to use (personal or pseudonym).`}>
            <Input type="text" maxLength={64} placeholder="Walter White" value={name} onChange={e => setName(e.target.value)} />
        </Input.Wrapper>
        <Button loading={isLoading} onClick={async () => {
            if (isLoading) return;
            setIsLoading(true);

            const { error } = await supabase
            .from('profiles')
            .update({
                name
            })
            .eq('id', profile.id);

            if (error)
            {
                console.error('Failed to update name::', error);
                notifications.show({
                    title: 'Failed to update name',
                    message: error.message,
                    color: 'red',
                    variant: 'filled'
                });
            }
            else
            {
                notifications.show({
                    title: 'Name updated',
                    message: 'Your name has been updated successfully. It will update when you refresh the page.',
                    color: 'green',
                });
            }
            setIsLoading(false);
        }}>
            Confirm New Name
        </Button>
    </div>
}