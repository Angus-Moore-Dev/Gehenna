'use client';

import { CopyButton, Tooltip, ActionIcon } from "@mantine/core";
import { ShareIcon } from "lucide-react";
import { useEffect, useState } from "react";


export default function ShareButton()
{
    const [url, setUrl] = useState('');

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    return <CopyButton value={url} timeout={25000}>
    {({ copied, copy }) => (
        <>
        <Tooltip label={copied ? 'Copied!' : 'Copy Post URL'} position="bottom">
            <ActionIcon onClick={copy} size={'36'} variant='subtle'>
                <ShareIcon size={20} />
            </ActionIcon>
        </Tooltip>
        </>
    )}
    </CopyButton>
}