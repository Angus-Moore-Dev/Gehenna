import { clientDb } from "@/lib/db";
import { TextInput, Button } from "@mantine/core";
import SignUpModal from "./SignUpModal";
import Image from "next/image";
import { useState } from "react";


export default function SignInForm()
{
    const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
        <div className='w-1/2 border-b-4 border-x-4 border-b-secondary border-x-secondary rounded-2xl p-8 flex flex-col items-center'>
            <Image src='/logo.png' width={1000} height={450} className='w-full' alt='Gehenna' />
            <p className='font-semibold'>Those who travel the fastest, travel alone.</p>
            <p className='font-semibold text-primary'>Those who travel the furthest, travel together.</p>
            <TextInput label="Email" className='w-full mt-4' value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextInput label="Password" className='w-full mt-4' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className='mr-auto text-blue-600 underline transition hover:text-blue-500 text-xs mt-2'
            onClick={() => {
                alert('This feature is not yet implemented.');
            }}>
                Forgot Password?
            </button>
            <Button className='w-full mt-4 bg-primary text-secondary transition hover:bg-amber-400'
            onClick={async () => {
                const res = await fetch('/api/sign-in', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });

                if (res.status === 200)
                {
                    // valid sign in.
                    const data = await res.json();
                    const session = data.session;
                    const user = data.user;
                    await clientDb.auth.setSession(session);
                    window.location.reload();
                }
                else
                {
                    alert((await res.json()).error);
                }
            }}>
                Login
            </Button>
            <SignUpModal />
        </div>
    </div>
}