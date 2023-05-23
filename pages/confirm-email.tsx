import { LoadingOverlay } from "@mantine/core";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";


export default function ConfirmEmailPage()
{
    const router = useRouter();
    const { token } = router.query as { token: string };

    useEffect(() => {
        if (token)
        {
            // Now we check if the token is valid.
            fetch('/api/confirm-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: token })
            }).then(async res => {
                if (res.status === 200)
                {
                    router.push('/');
                }
                else
                {
                    alert((await res.json()).error);
                }
            });
        }
    }, [token]);
    return <div className="w-full h-full flex flex-col items-center justify-center">
        <Head>
            <title>Gehenna - Confirm Your Email</title>
        </Head>
        <LoadingOverlay visible={true} overlayBlur={2} />
    </div>
}