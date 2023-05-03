import { useDisclosure } from '@mantine/hooks';
import { Modal, Button, Group, TextInput } from '@mantine/core';
import { useState } from 'react';
import CommonButton from './CommonButton';
import { Session, User } from '@supabase/supabase-js';
import { clientDb } from '@/lib/db';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function SignUpModal() 
{
    const router = useRouter();
    const [opened, { open, close }] = useDisclosure(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const signUpNewAccount = async () => {
        if (password.length < 8)
        {
            toast.error('Your password must be longer than 8 characters.');
            return;
        }

        if (password !== confirmPassword)
        {
            toast.error('Your passwords do not match.');
            return;
        }

        const res = await fetch('/api/sign-up', {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        if (res.status === 201)
        {
            // Now we need to sign in.
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
                // valid sign in for the very first time!.
                const data = await res.json();
                const session = data.session;
                const user = data.user;
                await clientDb.auth.setSession(session);
                window.location.reload();
            }
            else
            {
                toast.error((await res.json()).error);
            }
        }
        else
        {
            toast.error((await res.json()).error);
        }
    }

    return (
        <>
        <Modal opened={opened} onClose={close} title="Sign Up To Gehenna" centered>
            <div className='flex flex-col'>
                <span className='text-primary'>Join a community that centres itself around learning!</span>
                <TextInput label="Username" className='w-full mt-4' value={username} onChange={(e) => setUsername(e.target.value)} />
                <TextInput label="Email" className='w-full mt-4' value={email} onChange={(e) => setEmail(e.target.value)} />
                <TextInput label="Password" className='w-full mt-4' type='password' value={password} onChange={(e) => setPassword(e.target.value)} />
                <TextInput label="Confirm Password" className='w-full mt-4' type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <div className='mt-4 flex flex-col'>
                    <small className={`${password.length > 8 ? 'text-green-500' : 'text-red-500'}`}>Password must be at least 8 characters long.</small>
                    <small className={`${password && confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-red-500'}`}>Passwords must match.</small>
                </div>
                <Group position="center" className='mt-4 flex flex-row w-full'>
                    <Button onClick={close} className='flex-1 transition hover:text-primary hover:bg-transparent'>Cancel</Button>
                    <CommonButton text={'Sign Up'} onClick={signUpNewAccount} className='flex-1' />
                </Group>
            </div>
        </Modal>
        <button className='mr-auto text-blue-600 underline transition hover:text-blue-500 text-xs mt-2'
        onClick={open}>
            Don't have an account? Sign up!
        </button>
        </>
    );
}