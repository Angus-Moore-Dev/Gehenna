'use client';
import { Gehenna } from "@/components/Navbar";
import PostImage from "@/components/posts/PostImage";
import { appDomain, appHttp } from "@/utils/appURL";
import { createBrowserClient } from "@/utils/supabase/client";
import { Button, Checkbox, Input } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AuthenticationPage()
{
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get('redirectTo');
    const supabase = createBrowserClient();

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgotPassword' | 'code'>('signIn');

    const signIn = async () =>
    {
        if (isLoading) return;
        setIsLoading(true);

        const { error } = mode === 'signIn' ? 
        await supabase
        .auth
        .signInWithPassword({ email, password })
        :
        await supabase
        .auth
        .verifyOtp({
            type: 'email',
            email,
            token: code
        });

        if (error)
        {
            console.error(error);
            notifications.show({
                title: 'Error Signing In',
                message: error.message,
                color: 'red',
                variant: 'filled'
            });
            setIsLoading(false);
        }
        else
        {
            router.push(`${appHttp}://${redirectTo ?? ''}${redirectTo ? '.' : ''}${appDomain}/`);
        }
    }

    const forgotPassword = async () =>
    {
        if (isLoading) return;
        setIsLoading(true);

        const { error } = await supabase
        .auth
        .signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${appHttp}://${redirectTo ?? ''}${redirectTo ? '.' : ''}${appDomain}/`
            }
        });

        if (error)
        {
            console.error(error);
            notifications.show({
                title: 'Error Sending Reset Email',
                message: error.message,
                color: 'red',
                variant: 'filled'
            });
        }
        else
        {
            notifications.show({
                title: 'Reset Email Sent',
                message: 'Check your email for a link to reset your password.',
                color: 'green',
                variant: 'filled'
            });
            setMode('signIn');
        }

        setIsLoading(false);
    };

    return <div className="w-full min-h-screen flex flex-col items-center justify-center">
        <div className="w-full min-h-[500px] md:max-w-6xl grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 rounded-md border-[1px] border-neutral-600">
            <Image src='/servers.png' alt="Servers" width={1000} height={1000} className="rounded-l-md" quality={100} priority />
            <div className="w-full bg-tertiary rounded-r-md p-8 flex flex-col gap-4 items-center">
                <Gehenna />
                <p>
                    Voices of the Damned.
                </p>
                <section className="w-full md:w-80 flex flex-col gap-2">
                    <Input.Wrapper label="Email" className="w-full">
                        <Input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    </Input.Wrapper>
                    {
                        mode === 'signIn' &&
                        <Input.Wrapper label="Password" className="w-full">
                            <Input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}  />
                        </Input.Wrapper>
                    }
                    {
                        mode === 'code' &&
                        <Input.Wrapper label="One-Time Code" className="w-full">
                            <Input placeholder="123456" type="text" value={code} onChange={e => setCode(e.target.value)}  />
                        </Input.Wrapper>
                    }
                    {
                        (mode === 'signIn' || mode === 'code') &&
                        <Checkbox label="I Have A Code" className="ml-auto" checked={mode === 'code'} onChange={() => setMode(mode === 'code' ? 'signIn' : 'code')} />
                    }
                    {
                        mode === 'signIn' &&
                        <Button className="w-full mt-2" onClick={signIn} loading={isLoading}>
                            Login to Gehenna
                        </Button>
                    }
                    {
                        mode === 'code' &&
                        <Button className="w-full mt-2" onClick={signIn} loading={isLoading}>
                            Login with OTP
                        </Button>
                    }
                    {
                        mode === 'forgotPassword' &&
                        <Button className="w-full mt-2" onClick={forgotPassword} loading={isLoading}>
                            Send Reset Email
                        </Button>
                    }
                    {
                        mode !== 'forgotPassword' && mode !== 'signUp' &&
                        <div className="flex flex-col items-end gap-2">
                            <button className="w-fit text-sm underline text-blue-400 hover:text-blue-300" onClick={() => setMode('forgotPassword')}>
                                Forgot Password?
                            </button>
                            <button className="w-fit text-sm underline text-blue-400 hover:text-blue-300" onClick={() => setMode('signUp')}>
                                Join Gehenna
                            </button>
                        </div>
                    }
                    {
                        (mode === 'signUp' || mode === 'forgotPassword') &&
                        <div className="flex flex-col items-end gap-2">
                            <button className="w-fit text-sm underline text-blue-400 hover:text-blue-300" onClick={() => setMode('signIn')}>
                                Back to Login
                            </button>
                        </div>
                    }
                </section>
            </div>
        </div>
    </div>
}