'use client';

import { Skeleton } from "@mantine/core";
import Image from "next/image";
import { useState } from "react";

interface PostImageProps
{
    src: string;
    width?: number;
    height?: number;
}

export default function PostImage({ src, width, height }: PostImageProps)
{
    const [reveal, setReveal] = useState(false);

    return <>
    <Image
    src={src}
    alt=''
    quality={100}
    priority={true}
    width={width ?? 1000}
    height={height ?? 450}
    onLoad={() => setReveal(true)}
    style={{ visibility: reveal ? 'visible' : 'hidden', display: reveal ? 'block' : 'none' }}
    className={`w-[${width ?? 1000}] h-[${height}px] object-cover mx-auto rounded-md`}
    />
    <Skeleton hidden={reveal} height={height} className="w-full rounded-md" />
    </>
}