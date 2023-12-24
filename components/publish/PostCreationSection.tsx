'use client';

import { NewPostContent, PostTopic } from "@/utils/global.types";
import { Select, Button, FileButton, Input, Textarea, Checkbox } from "@mantine/core";
import { PlusIcon } from "lucide-react";
import PostTextEditor from "./TextEditor";
import Image from "next/image";

interface PostCreationSectionProps
{
    isPublic: boolean;
    setIsPublic: (isPublic: boolean) => void;

    title: string;
    setTitle: (title: string) => void;

    byline: string;
    setByline: (byline: string) => void;

    postImage: File | undefined;
    setPostImage: (postImage: File) => void;

    postImageTempURL: string;
    setPostImageTempURL: (postImageTempURL: string) => void;

    postTopics: PostTopic[];
    setPostTopics: (postTopics: PostTopic[]) => void;

    selectedPostTopic: string;
    setSelectedPostTopic: (selectedPostTopic: string) => void;

    newPostTopicName: string;
    setNewPostTopicName: (newPostTopicName: string) => void;

    postStructure: NewPostContent[];
    setPostStructure: (postStructure: NewPostContent[]) => void;
}

export default function PostCreationSection({ 
    title,
    byline,
    setTitle,
    setByline,
    isPublic,
    postImage,
    postTopics,
    setIsPublic,
    setPostImage,
    postStructure,
    setPostTopics,
    postImageTempURL,
    setPostStructure,
    newPostTopicName,
    selectedPostTopic,
    setPostImageTempURL,
    setNewPostTopicName,
    setSelectedPostTopic,
}: PostCreationSectionProps)
{
    return <>
    <Input.Wrapper label="Title" description='Title your post in 96 characters or less.' withAsterisk>
        <Input type="text" maxLength={96} required placeholder="Story Example Name" size="xl" className="font-bold" value={title} onChange={e => setTitle(e.target.value)} />
    </Input.Wrapper>
    <Input.Wrapper label="Byline" withAsterisk description="Summarise your post in 150 characters or less.">
        <Input type='text' required placeholder="Daft Punk are the greatest producers to ever exist and here's why." maxLength={150} value={byline} onChange={e => setByline(e.target.value)} />
    </Input.Wrapper>
    <div className="w-full flex flex-row gap-5">
        <Select
        data={[...postTopics.map(x => ({ value: x.id, label: x.title })), { value: 'new', label: '+ Create New Topic' }]}
        value={selectedPostTopic}
        onChange={e => setSelectedPostTopic(e ?? '')}
        className="w-full md:w-64"
        label="Post Topic"
        description="This helps categorise your post."
        comboboxProps={{ transitionProps: { transition: 'pop', duration: 200 }}}
        />
        {
            selectedPostTopic === 'new' &&
            <Input.Wrapper label="New Topic Name" description="This will be added when you complete your post.">
                <Input type='text' value={newPostTopicName} onChange={e => setNewPostTopicName(e.currentTarget.value)} placeholder="Chemistry Rants" />
            </Input.Wrapper>
        }
    </div>
    <Checkbox checked={isPublic} onChange={e => setIsPublic(e.currentTarget.checked)} label="Is This A Public Post?" />
    <div className="w-full flex flex-col gap-1">
        <span className="text-sm">
            Post Cover Image<span className="text-red-500">*</span>
        </span>
        <FileButton accept="image/png,image/jpeg,image/webp,image/gif,image/tiff,image/avif/image/svg+xml" onChange={e => {
            if (!e) return;
            if (postImageTempURL)
                URL.revokeObjectURL(postImageTempURL);
            setPostImage(e);
            setPostImageTempURL(URL.createObjectURL(e));
        }}>
            {(props) => <Button {...props} style={{ width: 256 }}>
                {!postImage ? 'Select' : 'Change'} Post Cover Image <span className="text-red-500">&nbsp;*</span>
            </Button>}
        </FileButton>
        <span className="text-sm">
            This is required before you can preview your post.
        </span>
    </div>
    {
        postImageTempURL &&
        <Image src={postImageTempURL} alt="image" width={500} height={500} className="rounded-md" />
    }
    <div className="border-b-[1px] border-b-neutral-600 my-4" />
    <span className="text-sm -mb-4 font-bold">
        Post Content <span className="text-red-500">*</span>
    </span>
    {
        postStructure.map((section, index) => 
        <div key={index} className="w-full flex flex-col gap-2 p-4 rounded-md border-[1px] border-neutral-600">
            <section className={`w-full flex flex-row items-start gap-2`}>
                <h2 className="font-semibold text-lg">
                    Section {index + 1}
                </h2>
                <Select value={section.type} data={['text', 'image', 'video', 'audio']} onChange={e => {
                    const newPostStructure = [...postStructure];
                    newPostStructure[index].type = (e as 'text' | 'audio' | 'video' | 'image');
                    newPostStructure[index].content = '';
                    setPostStructure(newPostStructure);
                }} className="ml-auto" />
                <Button color='red' onClick={() => {
                    const newPostStructure = [...postStructure];
                    newPostStructure.splice(index, 1);
                    setPostStructure(newPostStructure);
                }}>
                    Delete
                </Button>
            </section>
            {
                section.type === 'text' &&
                <PostTextEditor content={section.content as string} setContent={content => {
                    const newPostStructure = [...postStructure];
                    newPostStructure[index].content = content;
                    setPostStructure(newPostStructure);
                }} />
            }
            {
                section.type === 'image' &&
                <>
                <FileButton accept="image/*" onChange={e => {
                    if (!e) return;
                    const newPostStructure = [...postStructure];
                    newPostStructure[index].content = e;
                    if (newPostStructure[index].mediaTempURL)
                        URL.revokeObjectURL(newPostStructure[index].mediaTempURL);
                    newPostStructure[index].mediaTempURL = URL.createObjectURL(e);
                    setPostStructure(newPostStructure);    
                }}>
                    {(props) => 
                    <Button {...props} style={{ width: 256 }}>
                        <PlusIcon className="mr-2" />
                        {
                            postStructure[index].content ?
                            'Change' :
                            'Add'
                        } Image
                    </Button>
                    }
                </FileButton>
                {
                    !section.mediaTempURL &&
                    <span>
                        No Image Selected.
                    </span>
                }
                {
                    section.mediaTempURL &&
                    <Image src={section.mediaTempURL} alt="image" width={500} height={500} className="rounded-md" />
                }
                </>
            }
            {
                section.type === 'video' &&
                <>
                <FileButton accept="video/*" onChange={e => {
                    if (!e) return;
                    const newPostStructure = [...postStructure];
                    newPostStructure[index].content = e;
                    if (newPostStructure[index].mediaTempURL)
                        URL.revokeObjectURL(newPostStructure[index].mediaTempURL);
                    newPostStructure[index].mediaTempURL = URL.createObjectURL(e);
                    setPostStructure(newPostStructure);    
                }}>
                    {(props) => 
                    <Button {...props} style={{ width: 256 }}>
                        <PlusIcon className="mr-2" />
                        {
                            postStructure[index].content ?
                            'Change' :
                            'Add'
                        } Video
                    </Button>
                    }
                </FileButton>
                {
                    !section.mediaTempURL &&
                    <span>
                        No Video Selected.
                    </span>
                }
                {
                    section.mediaTempURL &&
                    <video src={section.mediaTempURL} controls className="rounded-md" width={500} height={500} />
                
                }
                </>
            }
            {
                section.type === 'audio' &&
                <>
                <FileButton accept="audio/mp3,audio/x-wav,audio/x-aiff,application/ogg" onChange={e => {
                    if (!e) return;
                    const newPostStructure = [...postStructure];
                    newPostStructure[index].content = e;
                    if (newPostStructure[index].mediaTempURL)
                        URL.revokeObjectURL(newPostStructure[index].mediaTempURL);
                    newPostStructure[index].mediaTempURL = URL.createObjectURL(e);
                    setPostStructure(newPostStructure);    
                }}>
                    {(props) => 
                    <Button {...props} style={{ width: 256 }}>
                        <PlusIcon className="mr-2" />
                        {
                            postStructure[index].content ?
                            'Change' :
                            'Add'
                        } Audio
                    </Button>
                    }
                </FileButton>
                {
                    !section.mediaTempURL &&
                    <span>
                        No Audio Selected.
                    </span>
                }
                {
                    section.mediaTempURL &&
                    <audio src={section.mediaTempURL} controls className="rounded-md max-w-[500px]" />
                }
                </>
            }
        </div>)
    }
    <Button onClick={() => {
        setPostStructure([...postStructure, { type: 'text', content: '', index: postStructure.length, mediaTempURL: '' }]);
    }} className="mt-10">
        <PlusIcon className="mr-2" />
        Add New Section
    </Button>
    </>
}