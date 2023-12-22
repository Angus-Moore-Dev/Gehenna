'use client';
import { MediaInfo, Post, Profile } from "@/utils/global.types";
import { CheckIcon, Loader } from "@mantine/core";
import { ActivityIcon, AlertCircleIcon, DatabaseIcon, PackageOpenIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PostFinaliseSectionProps
{
    post: Post;
    profile: Profile;
    allFiles: File[];
    postTopic: string;

    uploadedFiles: string[];

    isUploading: boolean;
    uploadedStage: number;
    filesUploaded: boolean;
    contentUploaded: boolean;

    completedPostId: string;
}

export default function PostFinaliseSection({
    post,
    profile,
    allFiles,
    postTopic,
    isUploading,
    uploadedFiles,
    filesUploaded,
    uploadedStage,
    completedPostId,
    contentUploaded,
}: PostFinaliseSectionProps)
{
    return <div className="w-full flex flex-col gap-5">
        <div className="w-full max-w-4xl grid grid-cols-2 mt-32">
            <Image src={(post.postImageURL as MediaInfo).url} alt="" width={500} height={225} className="max-h-[300px] object-cover rounded-l-md " />
            <div className="flex flex-col gap-4 bg-tertiary rounded-r-md flex-grow p-8 items-center text-center">
                <span className="text-2xl font-bold text-center">
                    {post.title}
                </span>
                <p className="text-neutral-400">
                    {post.byline}
                </p>
                <small className="mt-auto">
                    {
                        postTopic ?
                        <>{postTopic}&nbsp;&middot;&nbsp;</> :
                        ''
                    }{new Date(post.createdAt).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
                </small>
            </div>
        </div>
        <section className="flex flex-col gap-2 pt-4 border-t-[1px] border-t-neutral-600">
            <span>
                Post Upload Progress
            </span>
            <div className="w-full bg-tertiary p-4 flex flex-row items-center gap-2 rounded-md">
                <PackageOpenIcon className="text-blue-600 mr-2" size={32} />
                <span>
                    Upload Files To Storage CDN
                </span>
                <div className="ml-auto flex items-center">
                    {
                        !isUploading && uploadedStage === 0 &&
                        <ActivityIcon className="text-neutral-800" size={24} />
                    }
                    {
                        isUploading &&
                        uploadedStage === 1 && !filesUploaded &&
                        <Loader size={24} />
                    }
                    {
                        uploadedStage > 1 && filesUploaded &&
                        <CheckIcon className="text-green-500" size={24} />
                    }
                    {
                        uploadedStage > 1 && !filesUploaded &&
                        <AlertCircleIcon className="text-white fill-red-500" size={24} />
                    }
                </div>
            </div>
            <div className="w-full bg-tertiary p-4 flex flex-row items-center gap-2 rounded-md">
                <DatabaseIcon className="text-primary mr-2" size={32} />
                {/* <CheckCircle2Icon className="text-white fill-green-500 mr-2" /> */}
                <span>
                    Step 2. Upload Content To Database
                </span>
                <div className="ml-auto flex items-center">
                    {
                        !isUploading && uploadedStage === 0 &&
                        <ActivityIcon className="text-neutral-800" size={24} />
                    }
                    {
                        isUploading &&
                        uploadedStage <= 2 && !contentUploaded &&
                        <Loader size={24} />
                    }
                    {
                        uploadedStage > 2 && contentUploaded &&
                        <CheckIcon className="text-green-500" size={24} />
                    }
                    {
                        uploadedStage > 2 && !contentUploaded &&
                        <AlertCircleIcon className="text-white fill-red-500" size={24} />
                    }
                </div>
            </div>
            {
                uploadedStage === 3 && !isUploading &&
                <Link href={`/${completedPostId}`}
                className="bg-tertiary text-primary flex items-center justify-center font-semibold p-4 rounded-md mt-4">
                    <p className="text-center">
                        Your post has been successfully created!
                        <br />
                        <small>
                            <b>CLICK HERE TO VIEW IT</b>
                        </small>
                    </p>
                </Link>
            }
        </section>
    </div>
}