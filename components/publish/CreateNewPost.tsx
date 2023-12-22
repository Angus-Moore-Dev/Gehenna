'use client';

import { NewPostContent, Post, PostTopic, Profile } from "@/utils/global.types";
import { Button } from "@mantine/core";
import { useState } from "react";
import PostCreationSection from "./PostCreationSection";
import PostContent from "../posts/PostContent";
import { createBrowserClient } from "@/utils/supabase/client";
import PostFinaliseSection from "./PostFinaliseSection";
import { UploadIcon } from "lucide-react";
import { v4 } from "uuid";


export default function CreateNewPost({ profile, topics }: { profile: Profile, topics: PostTopic[] })
{
    const supabase = createBrowserClient();
    const [stage, setStage] = useState(0);

    const [title, setTitle] = useState('');
    const [byline, setByline] = useState('');
    const [postTopics, setPostTopics] = useState<PostTopic[]>(topics);

    const [postImage, setPostImage] = useState<File>();
    const [postImageTempURL, setPostImageTempURL] = useState('');

    const [selectedPostTopic, setSelectedPostTopic] = useState('');
    const [newPostTopicName, setNewPostTopicName] = useState('');
    const [postStructure, setPostStructure] = useState<NewPostContent[]>([{ type: 'text', content: '', mediaTempURL: '', index: 0 }]);

    const [isPublic, setIsPublic] = useState(true);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [uploadedStage, setUploadedStage] = useState(0);

    const [filesUploaded, setFilesUploaded] = useState(false);
    const [contentUploaded, setContentUploaded] = useState(false);

    const [completedPostId, setCompletedPostId] = useState('');

    async function createNewPost()
    {
        if (!postImage || isUploading) return;

        setUploadedStage(1);
        setIsUploading(true);
        setFilesUploaded(false);
        setContentUploaded(false);
        
        // First, we create the new topic
        let topicId = '';
        const id = `${title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '-')}-${v4().split('-')[4]}`;
        if (selectedPostTopic === 'new')
        {
            const { data: newTopic, error } = await supabase
            .from('postTopics')
            .insert({  title: newPostTopicName, userId: profile.id })
            .select('*')
            .single();

            if (error && !newTopic)
                return console.error(error);

            topicId = newTopic.id;
        }
        else
            topicId = selectedPostTopic;

        let postStructureData = [...postStructure];

        for (const section of postStructureData.filter(x => x.type !== 'text'))
        {
            const { error } = await supabase.storage.from('post_files')
            .upload(`${id}/${(section.content as File).name}`, section.content as File);

            if (error)
            {
                console.error(error);
                return console.error(error);
            }
            else
            {
                setUploadedFiles([...uploadedFiles, `${(section.content as File).name}`]);
                const url = supabase.storage.from('post_files').getPublicUrl(`${id}/${(section.content as File).name}`);
                postStructureData[postStructureData.indexOf(section)].content = url.data.publicUrl;
                postStructureData[postStructureData.indexOf(section)].mediaTempURL = url.data.publicUrl;
            }
        }

        const { error: coverImageError } = await supabase.storage.from('post_files')
        .upload(`${id}/${postImage.name}`, postImage);

        if (coverImageError)
        {
            console.error(coverImageError);
            return console.error(coverImageError);
        }

        setUploadedStage(2);
        setFilesUploaded(true);

        const { error } = await supabase
        .from('post')
        .insert({
            id,
            title,
            byline,
            topicId,
            userId: profile.id,
            content: generatePostContentPreview(postStructureData),
            attachedFileURLs: [],
            postImageURL: {
                url: supabase.storage.from('post_files').getPublicUrl(`${id}/${postImage.name}`).data.publicUrl, 
                mimeType: postImage.type, 
                byteSize: postImage.size 
            },
        });

        if (error)
        {
            console.error(error);
            return console.error(error);
        }

        setContentUploaded(true);
        setUploadedStage(3);
        setIsUploading(false);
        setCompletedPostId(id);
    }

    return <div className="w-full flex flex-col gap-5">
        <section className={`w-full flex flex-row items-center gap-2 ${stage >= 1 && '-mb-32'} p-4 bg-tertiary rounded-md`}>
            <span className="text-2xl font-bold">
                Write New Post | {stage === 0 ? 'Details' : stage === 1 ? 'Preview' : 'Finalise'}
            </span>
            <Button disabled={stage === 0 || isUploading} className="ml-auto" onClick={() => setStage(stage - 1)}>
                &larr; Back Step
            </Button>
            {
                stage !== 2 &&
                <Button disabled={stage >= 2 || !postImage} onClick={() => setStage(stage + 1)}>
                    Next Step &rarr;
                </Button>
            }
            {
                stage === 2 &&
                <Button color="blue" loading={isUploading} onClick={createNewPost}>
                    <UploadIcon className="mr-2" />
                    Publish New Post
                </Button>
            }
        </section>
        {
            stage === 0 &&
            <PostCreationSection
            isPublic={isPublic}
            setIsPublic={setIsPublic}
            byline={byline}
            title={title}
            postImage={postImage}
            setPostImage={setPostImage}
            postImageTempURL={postImageTempURL}
            setPostImageTempURL={setPostImageTempURL}
            setTitle={setTitle}
            setByline={setByline}
            postTopics={postTopics}
            setPostTopics={setPostTopics}
            selectedPostTopic={selectedPostTopic}
            setSelectedPostTopic={setSelectedPostTopic}
            newPostTopicName={newPostTopicName}
            setNewPostTopicName={setNewPostTopicName}
            postStructure={postStructure}
            setPostStructure={setPostStructure}
            />
        }
        {
            stage === 1 && postImage &&
            <div className="w-full flex flex-col items-center mt-6">
                <PostContent
                post={{
                    id: '',
                    title,
                    content: generatePostContentPreview(postStructure),
                    postImageURL: { url: URL.createObjectURL(postImage), mimeType: 'image/png', byteSize: 1 },
                    attachedFileURLs: [],
                    userId: profile.id,
                    createdAt: new Date().toISOString(),
                    byline,
                    public: true,
                    topicId: selectedPostTopic === 'new' ? null : selectedPostTopic,
                }}
                profile={profile}
                postTopicTitle={selectedPostTopic === 'new' ? newPostTopicName : postTopics.find(x => x.id === selectedPostTopic)?.title ?? ''}
                />
            </div>
        }
        {
            stage === 2 &&
            <PostFinaliseSection
            post={{
                id: '',
                title,
                content: generatePostContentPreview(postStructure),
                postImageURL: { url: postImageTempURL, mimeType: 'image/png', byteSize: 1 },
                attachedFileURLs: [],
                userId: profile.id,
                createdAt: new Date().toISOString(),
                byline,
                public: true,
                topicId: selectedPostTopic === 'new' ? null : selectedPostTopic,
            }}
            profile={profile}
            postTopic={selectedPostTopic === 'new' ? newPostTopicName : postTopics.find(x => x.id === selectedPostTopic)?.title ?? ''}
            allFiles={postStructure.filter(x => x.type !== 'text').map(x => x.content as File)}
            isUploading={isUploading}
            uploadedFiles={uploadedFiles}
            uploadedStage={uploadedStage}
            filesUploaded={filesUploaded}
            contentUploaded={contentUploaded}
            completedPostId={completedPostId}
            />
        }
    </div>
}


function generatePostContentPreview(postStructure: NewPostContent[]): string
{
    let totalPostHTML = '';

    for (const section of postStructure)
    {
        if (section.type === 'text')
            totalPostHTML += section.content;
        else if (section.type === 'video')
            totalPostHTML += `<br /><video src="${section.mediaTempURL}" controls style='margin-left:auto;margin-right:auto;'></video>`;
        else if (section.type === 'image')
            totalPostHTML += `<br /><img src="${section.mediaTempURL}" style='margin-left:auto;margin-right:auto;' />`;
        else if (section.type === 'audio')
            totalPostHTML += `<br /><audio src="${section.mediaTempURL}" controls style='margin-left:auto;margin-right:auto;'></audio>`;
    }

    return totalPostHTML;
}