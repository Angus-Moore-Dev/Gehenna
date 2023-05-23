import CommonButton from "@/components/CommonButton";
import { clientDb, serverDb } from "@/lib/db";
import { Loader, TextInput } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ResetPasswordPageProps
{
    user: User | null;
}

export default function ResetPasswordPage({ user }: ResetPasswordPageProps)
{
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        clientDb.auth.onAuthStateChange(async (event, session) => 
        {
            if (event === 'PASSWORD_RECOVERY')
            {
                if (session)
                {
                    clientDb.auth.setSession(session);
                }
                window.location.reload();
            }
            window.location.reload();
        });
    }, []);

    return <div className="w-full h-full flex items-center justify-center">
        {
            (!user || isResetting) &&
            <Loader color="yellow" />
        }
        {
            (user && !isResetting) &&
            <div className="flex flex-col gap-4 p-4 border-2 border-primary rounded-xl">
                <Image src="/logo.png" alt='Gehennea' width={500} height={400} />
                <span className="text-lg font-semibold">Reset Your Password</span>
                <div className="flex flex-col gap-2 w-full">
                    <TextInput label='New Password' value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" type='password' />
                    <TextInput label='Confirm New Password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full" type='password' />
                    {
                        password &&
                        <div className='flex flex-col'>
                            <small className={`${password.length > 8 ? 'text-green-500' : 'text-red-500'}`}>Password must be at least 8 characters long.</small>
                            <small className={`${password && confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>Passwords must match.</small>
                        </div>
                    }
                    {
                        password && password.length >= 8 && password === confirmPassword && !isResetting &&
                        <CommonButton text='Update Password' onClick={async () => {
                            setIsResetting(true);
                            const res = await fetch('/api/reset-password', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    newPassword: password
                                })
                            });

                            if (res.status !== 200)
                            {
                                toast.error((await res.json()).message);
                                setIsResetting(false);
                            }
                            else
                            {
                                toast.success('Password updated!');
                                setPassword('');
                                setConfirmPassword('');
                                await router.push('/');
                            }
                        }} />
                    }
                    {
                        isResetting &&
                        <Loader color="yellow" />
                    }
                </div>
            </div>
        }
    </div>
}

export const getServerSideProps = async (context: GetServerSidePropsContext) =>
{
    const serverClient = serverDb(context);
    const { data: { user }} = await serverClient.auth.getUser();

    return {
        props: {
            user
        }
    }
}