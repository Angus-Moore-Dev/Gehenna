import formatFileSize from "@/utils/formatFileSize";
import { ContentSection } from "@/utils/global.types";
import { FileIcon } from "lucide-react";
import Link from "next/link";



export default function FileBox({ content }: { content: ContentSection })
{
    return <Link
    href={content.content}
    target="_blank"
    className="w-full bg-tertiary transition hover:bg-quaternary rounded-md p-8 flex gap-4 flex-row items-start">
        <div className="min-w-[50px]">
            <FileIcon size={32} className="text-primary" />
        </div>
        <div className="flex-grow font-bold">
            {content.mimeType}
        </div>
        <div>
            <span className="font-bold text-primary">
                {formatFileSize(content.byteSize)}
            </span>
        </div>
    </Link>
}