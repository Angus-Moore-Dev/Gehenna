'use client';

import { Profile } from "@/utils/global.types";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Input, Textarea } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";



export default function BioChange({ profile }: { profile: Profile })
{
    const supabase = createBrowserClient();
    const [newBio, setNewBio] = useState(profile.bio);
    const [isLoading, setIsLoading] = useState(false);

    return <div className="flex flex-col gap-2">
        <Textarea label='Change Bio (Max 144 Characters)' description={`Your bio is a short summary about yourself. Use a quote or a description about who you are here.`} resize="vertical" minRows={5} maxLength={144} placeholder="Short description about yourself." value={newBio} onChange={e => setNewBio(e.target.value)} />
        <Button color="red" onClick={async () => 
        {
            if (isLoading) return;
            setIsLoading(true);

            const { error } = await supabase
            .from('profiles')
            .update({
                bio: newBio
            })
            .eq('id', profile.id);

            if (error)
            {
                console.error('Failed to update bio::', error);
                notifications.show({
                    title: 'Failed to update bio',
                    message: error.message,
                    color: 'red',
                    variant: 'filled'
                });
            }
            else
            {
                notifications.show({
                    title: 'Bio updated',
                    message: 'Your bio has been updated successfully. It will update when you refresh the page.',
                    color: 'green',
                });
            }
            setIsLoading(false);
        }}>
            Confirm New Bio
        </Button>
    </div>
}