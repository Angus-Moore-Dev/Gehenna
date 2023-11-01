import { clientDb } from "@/lib/db";
import { TextInput, Button } from "@mantine/core";
import { useState } from "react";
import CommonButton from "./CommonButton";
import { toast } from "react-toastify";
import { Gehenna } from "./Gehenna";


export default function SignInForm()
{
    const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
    const [passwordReset, setPasswordReset] = useState(false);

    return <div className='w-full h-full flex flex-col items-center justify-center gap-4'>
        {
            passwordReset &&
            <div className="w-full flex flex-col items-center gap-4">
                <CommonButton text='&#x2190; Back' onClick={() => setPasswordReset(false)} className='mr-auto bg-transparent hover:bg-primary text-primary hover:text-white' />
                <Gehenna />
                <span className="font-semibold">Please enter your email for your account and you will receive an email to reset your password.</span>
                <TextInput label="Email" className='w-full mt-4' value={email} onChange={(e) => setEmail(e.target.value)} />
                <CommonButton text="Send Email To Reset Password" onClick={async () => {
                    const res = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            email
                        })
                    });

                    if (res.status === 201)
                    {
                        toast.success('Please check your emails, you will have received an email to reset your password.')
                        setPasswordReset(false);
                    }
                    else
                    {
                        toast.error('An error occurred while trying to reset your password, please try again later.')
                    }
                }} />
            </div>
        }
        {
            !passwordReset &&
            <div className='w-full flex flex-col items-center'>
                <Gehenna />
                <TextInput label="Email" className='w-full mt-4' value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextInput label="Password" className='w-full mt-4' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <CommonButton text='Login' className='w-full mt-4'
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
                        await clientDb.auth.setSession(session);
                        window.location.reload();
                    }
                    else
                    {
                        alert((await res.json()).error);
                    }
                }} />
            </div>
        }
    </div>
}