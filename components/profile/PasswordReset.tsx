'use client';

import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Input } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";

export default function PasswordReset()
{
    const supabase = createBrowserClient();
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    return <div className="flex flex-col gap-2">
        <Input.Wrapper label="Change Password" description="Update your password here. Must be at least 8 characters, no special characters/nums needed.">
            <Input type="password" placeholder="**********" value={password} onChange={e => setPassword(e.target.value)} />
        </Input.Wrapper>
        <Button loading={isLoading} color="blue" onClick={async () => {
            if (isLoading) return;
            setIsLoading(true);

            const { error } = await supabase.auth.updateUser({ password });
            if (error)
            {
                console.error('Failed to update password::', error);
                notifications.show({
                    title: 'Failed to update password',
                    message: error.message,
                    color: 'red',
                    variant: 'filled'
                });
            }
            else
            {
                notifications.show({
                    title: 'Password updated',
                    message: 'Your password has been updated successfully.',
                    color: 'green',
                });
            }
            setIsLoading(false);
        }}>
            Confirm New Password
        </Button>
    </div>
}