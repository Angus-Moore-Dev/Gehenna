'use client';

import { NewPostContent, Post, PostTopic, Profile } from "@/utils/global.types";
import { Button, FileButton, Input, Select } from "@mantine/core";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import PostTextEditor from "./TextEditor";
import Image from "next/image";
import PostCreationSection from "./PostCreationSection";
import PostContent from "../posts/PostContent";


export default function CreateNewPost({ profile, topics }: { profile: Profile, topics: PostTopic[] })
{

    const [stage, setStage] = useState(0);

    const [title, setTitle] = useState('');
    const [byline, setByline] = useState('');
    const [postTopics, setPostTopics] = useState<PostTopic[]>(topics);

    const [postImage, setPostImage] = useState<File>();
    const [postImageTempURL, setPostImageTempURL] = useState('');

    const [selectedPostTopic, setSelectedPostTopic] = useState('');
    const [newPostTopicName, setNewPostTopicName] = useState('');
    const [postStructure, setPostStructure] = useState<NewPostContent[]>([]);

    async function createNewPost()
    {
        // TODO!

        for (const section of postStructure)
        {

        }

        // Now we take all of it and create the post.
    };

    return <div className="w-full flex flex-col gap-5">
        <section className={`w-full flex flex-row items-center gap-2 ${stage === 1 && '-mb-32'}`}>
            <span className="text-2xl font-bold">
                Write New Post
            </span>
            <Button disabled={stage === 0} className="ml-auto" onClick={() => setStage(stage - 1)}>
                &larr; Back Step
            </Button>
            <Button disabled={stage >= 2 || !postImage} onClick={() => setStage(stage + 1)}>
                Next Step &rarr;
            </Button>
        </section>
        {
            stage === 0 &&
            <PostCreationSection
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