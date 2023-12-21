'use client';

import { CopyButton, Tooltip, ActionIcon } from "@mantine/core";
import { IconLink } from "@tabler/icons-react";
import { useEffect, useState } from "react";


export default function SharePost()
{
    const [url, setUrl] = useState('');

    useEffect(() => {
        setUrl(window.location.href);
    }, []);

    return <CopyButton value={url} timeout={25000}>
    {({ copied, copy }) => (
        <>
        <Tooltip label={copied ? 'Copied!' : 'Copy Post URL'} position="top">
            <ActionIcon onClick={copy} size="xl">
                <IconLink size={20} />
            </ActionIcon>
        </Tooltip>
        </>
    )}
    </CopyButton>
}