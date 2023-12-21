'use client';

import { MediaInfo } from "@/utils/global.types";
import Image from "next/image";



export default function AdditionalMedia({ files }: { files: MediaInfo[] })
{
    return <div className="w-full flex flex-wrap gap-2">
        {
            files.map(file => {
                if (file.mimeType.includes('image'))
                    return <Image key={file.url} src={file.url} alt={file.url} quality={100} width='1000' height='1000' className={`object-cover min-w-[45%] flex-1 rounded-md ${files.length > 1 && 'h-[350px]'}`} />
                else if (file.mimeType.includes('audio'))
                    return <audio key={file.url} className="min-w-[45%] flex-1" controls>
                        <source src={file.url} type={file.mimeType} />
                    </audio>
                else if (file.mimeType.includes('video'))
                    return <video key={file.url} className="min-w-[45%] flex-1 rounded-md" controls>
                        <source src={file.url} type={file.mimeType} />
                    </video>
            })
        }
    </div>
}