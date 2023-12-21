'use client';

import { Skeleton } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";


export default function PostImage({ src }: { src: string })
{
    const [reveal, setReveal] = useState(false);

    return <>
    <Image
    src={src}
    alt=''
    quality={100}
    priority={true}
    width={1000}
    height={450}
    onLoad={() => setReveal(true)}
    style={{ visibility: reveal ? 'visible' : 'hidden', display: reveal ? 'block' : 'none' }}
    className="w-full h-[450px] object-cover mx-auto rounded-md"
    />
    <Skeleton hidden={reveal} height={450} className="w-full rounded-md" />
    </>
}