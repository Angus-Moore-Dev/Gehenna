import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { useEffect, useRef, useState } from 'react';
import { Chip, List, Loader, TextInput } from '@mantine/core';
import CommonButton from './CommonButton';
import { clientDb } from '@/lib/db';
import { User } from '@supabase/supabase-js';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import { useRouter } from 'next/router';
import { AttachedFile, Post, Tags } from '@/models/Post';
import { ImageDropzone } from './ImageDropzone';
import Placeholder from '@tiptap/extension-placeholder';
import Image from 'next/image';
import ImageCropper from './ImageCropper';
import { Startup } from '@/models/Startup';
interface NewPostBoxProps
{
    user: User;
    startup?: Startup;
    handleClose: () => void;
    draftPost?: Post;
    setDraftPost?: (post: Post) => void;
    setIsChanged: (isChanged: boolean) => void;
}

export default function NewPostBox({ user, startup, handleClose, draftPost, setDraftPost, setIsChanged }: NewPostBoxProps)
{
    const router = useRouter();
    const [title, setTitle] = useState(draftPost ? draftPost.title : '');
    const [content, setContent] = useState(draftPost ? draftPost.content : '');
    const [isCreating, setIsCreating] = useState(false);
    const [tags, setTags] = useState<string[]>(draftPost ? draftPost.tags : []);
    const [tagsFilter, setTagsFilter] = useState('');

    const [files, setFiles] = useState<File[]>([]);
    const [coverImage, setCoverImage] = useState<File>();
    const [isCropping, setIsCropping] = useState(false);
    const [previewImageURL, setPreviewImageURL] = useState('');

    const [isFilesTooLarge, setIsFilesTooLarge] = useState(false);

    useEffect(() => {
        // If the content and/or title have been changed, set isChanged to true
        if (draftPost)
        {
            if (title !== draftPost.title || content !== draftPost.content || tags !== draftPost.tags)
            {
                setIsChanged(true);
            }
            else
            {
                setIsChanged(false);
            }
        }
        else
        {
            if (title !== '' || content !== '' || tags.length > 0)
            {
                setIsChanged(true);
            }
            else
            {
                setIsChanged(false);
            }
        }
    }, [content, title, tags]);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({ placeholder: "What do you want to say?" }),
		],
		content,
        onUpdate({ editor }) {
            setContent(editor.getHTML());
        },
	});

    useEffect(() => {
        // If the sum total of all the files are greater than 5mb, set isFilesTooLarge to true
        files.reduce((acc, file) => acc + file.size, 0) >= 5242880 ? setIsFilesTooLarge(true) : setIsFilesTooLarge(false);
    }, [files]);

    useEffect(() => {
        return () => {
            URL.revokeObjectURL(previewImageURL);
        }
    })

    return <div className='w-full flex flex-col items-center scrollbar'>
        <div className='w-full flex flex-col items-center gap-4'>
            <span className='text-2xl font-bold mr-auto'>Create A New Post</span>
            <TextInput placeholder='Thread Title' className='w-full font-semibold' value={title} onChange={(e) => setTitle(e.target.value)} size='xl' maxLength={96} />
            <small className='-mt-2 text-gray-500 mr-auto'>{96 - title.length} characters left</small>
            <span className='-mb-2 mr-auto font-bold text-xl'>Cover Image</span>
            <small className='mr-auto -mt-1'>This will not be saved if you save a draft</small>
            <div className='w-full'>
                {
                    !coverImage &&
                    <ImageDropzone onUpload={(files: File[]) => {
                        setCoverImage(files[0]);
                        setIsCropping(true);
                    }} height={100} isUploading={isCreating} accept={['image/*']} />
                }
                {
                    coverImage && isCropping &&
                    <>
                    <ImageCropper file={coverImage} setFile={(file) => {
                        setCoverImage(file);
                        setIsCropping(false);
                        setPreviewImageURL(URL.createObjectURL(file));
                    }} width={666} height={450} className='mx-auto flex flex-col items-center w-[333px]' />
                    <div className='w-full flex justify-center'>
                        <CommonButton text='Remove Image' onClick={() => setCoverImage(undefined)} className='w-[333px] mx-auto mt-4 bg-red-500 hover:bg-red-600' />
                    </div>
                    </>
                }
                {
                    coverImage && !isCropping && previewImageURL &&
                    <Image src={previewImageURL} alt='' width={400} height={450} className='mx-auto flex flex-col items-center w-[450px] rounded-md' />
                }
            </div>
            <span className='text-xl font-semibold -mb-2 mr-auto'>Post Content</span>
            <RichTextEditor editor={editor} style={{
                width: '100%'
            }}>
                <RichTextEditor.Toolbar sticky stickyOffset={60}>
                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Bold />
                        <RichTextEditor.Italic />
                        <RichTextEditor.Underline />
                        <RichTextEditor.Strikethrough />
                        <RichTextEditor.ClearFormatting />
                        <RichTextEditor.Highlight />
                        <RichTextEditor.Code />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.H1 />
                        <RichTextEditor.H2 />
                        <RichTextEditor.H3 />
                        <RichTextEditor.H4 />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Blockquote />
                        <RichTextEditor.Hr />
                        <RichTextEditor.BulletList />
                        <RichTextEditor.OrderedList />
                        <RichTextEditor.Subscript />
                        <RichTextEditor.Superscript />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.Link />
                        <RichTextEditor.Unlink />
                    </RichTextEditor.ControlsGroup>

                    <RichTextEditor.ControlsGroup>
                        <RichTextEditor.AlignLeft />
                        <RichTextEditor.AlignCenter />
                        <RichTextEditor.AlignJustify />
                        <RichTextEditor.AlignRight />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
            </RichTextEditor>
            <div className='w-full flex flex-col gap-2'>
                <span className='text-xl font-semibold'>Any Extra Files (Optional)</span>
                <small className='mr-auto -mt-1'>These will not be saved if you save a draft</small>
                <ImageDropzone onUpload={(files: File[]) => {
                    setFiles(existingFiles => [...existingFiles, ...files]);
                }} isUploading={isCreating} height={50} accept={['image/*', 'audio/*', 'video/*']} multiple={true} />
                {
                    files.length > 0 &&
                    <span>Files Included</span>
                }
                <List size='sm' withPadding className='flex flex-col gap-4'>
                    {
                        files.map((file, index) => (
                            <List.Item key={index} className='flex flex-row gap-4 items-center'>
                                <span className='text-lg font-semibold'>- {file.name}</span> <button className='text-red-500 ml-2 transition hover:bg-red-500 rounded border-[1px] border-red-500 p-1 hover:text-white' onClick={() => setFiles(files.filter(x => x !== file))}>Remove</button>
                            </List.Item>
                        ))
                    }
                </List>
            </div>
            <div className='w-full flex flex-col gap-2'>
                <span className='text-xl font-semibold'>Add Tags To Your Post (Optional)</span>
                <TextInput placeholder='Search Tags' className='w-full' value={tagsFilter} onChange={(e) => setTagsFilter(e.target.value)} />
                <div className='w-full flex flex-row gap-1 flex-wrap justify-center'>
                    {
                        Object.values(Tags).filter(x => x.toLowerCase().startsWith(tagsFilter.toLowerCase())).map(tag => <button>
                            <Chip checked={tags.some(x => x === tag)} onClick={() => {
                                if (tags.some(x => x === tag))
                                {
                                    setTags(tags.filter(x => x !== tag));
                                }
                                else
                                {
                                    setTags([...tags, tag]);
                                }
                            }}>{tag}</Chip>
                        </button>)
                    }
                </div>
            </div>
            <div className='flex flex-row gap-2 ml-auto items-center'>
                {
                    isFilesTooLarge &&
                    <span className='text-red-500'>Files are too large. Please keep your image count below 50MB :(</span>
                }
                {
                    !isCreating &&
                    <CommonButton text='Save Draft' onClick={async () => {
                        setIsCreating(true);
                        if (draftPost)
                        {
                            // Update call here with the existing ID, no need to create a new one
                            const id = draftPost.id;
                            const res = await clientDb.from('draftPost').update({
                                id,
                                title,
                                content,
                                userId: user.id,
                                tags: tags,
                                attachedFileURLs: [],
                                postImageURL: {},
                                startupId: startup ? startup.id : null,
                            }).eq('id', id);

                            res.error && toast.error('Failed to save draft');
                            if (!res.error)
                            {
                                toast.success('Saved draft');
                                if (setDraftPost)
                                {
                                    setDraftPost({
                                        id,
                                        title,
                                        createdAt: draftPost.createdAt,
                                        content,
                                        userId: user.id,
                                        tags: tags,
                                        attachedFileURLs: [],
                                        postImageURL: {
                                            url: '',
                                            mimeType: '',
                                            byteSize: 0,
                                        },
                                        startupId: startup ? startup.id : null,
                                    });
                                }
                                setTags([]);
                                setTitle('');
                                setContent('');
                                handleClose();
                            }
                        }
                        else
                        {
                            const id = v4();
                            const res = await clientDb.from('draftPost').insert({
                                id,
                                title,
                                content,
                                userId: user.id,
                                tags: tags,
                                attachedFileURLs: [],
                                postImageURL: {},
                                startupId: startup ? startup.id : null,
                            });
        
                            if (res.error)
                            {
                                toast.error('Failed to save draft');
                            }
                            else
                            {
                                setTags([]);
                                setTitle('');
                                setContent('');
                                toast.success('Saved draft');
                                handleClose();
                            }
                        }
                        setIsCreating(false);
                    }} className='bg-blue-700 hover:bg-blue-500 mt-4' />
                }
                {
                    !isCreating && !isFilesTooLarge && coverImage && title && content &&
                    <CommonButton text='Create Thread' onClick={async () => {
                        setIsCreating(true);

                        // Upload the files first, then get their URLs and attach them to the post under the name attachedFileURLs
                        // create id being the alphanumerics (with - replacing spaces) from the title (no special characters and it cannot start with a number) and the end of the uuid
                        const id = `${title.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '-')}-${v4().split('-')[4]}`;

                        // Upload the post cover image
                        const coverImageRes = await clientDb.storage.from('post_files').upload(`${id}/${coverImage.name}`, coverImage, {
                            cacheControl: '3600',
                            upsert: true
                        });
                        const postImageURL = clientDb.storage.from('post_files').getPublicUrl(`${id}/${coverImage.name}`).data.publicUrl as string;
                        const postImage: AttachedFile = {
                            url: postImageURL,
                            mimeType: coverImage.type,
                            byteSize: coverImage.size,
                        };

                        const fileURLs: AttachedFile[] = [];
                        for (const file of files)
                        {
                            const res = await clientDb.storage.from('post_files').upload(`${id}/${file.name}`, file, {
                                cacheControl: '3600',
                                upsert: true
                            });

                            if (res.error)
                            {
                                toast.error(res.error.message);
                            }
                            else
                            {
                                // Get the url
                                const url = clientDb.storage.from('post_files').getPublicUrl(`${id}/${file.name}`).data.publicUrl as string;
                                fileURLs.push({
                                    url: url,
                                    mimeType: file.type,
                                    byteSize: file.size,
                                });
                            }
                        }

                        const res = await clientDb.from('post').insert({
                            id,
                            title,
                            content,
                            userId: user.id,
                            tags: tags,
                            attachedFileURLs: fileURLs,
                            postImageURL: postImage,
                            startupId: startup ? startup.id : null,
                        });
                        if (res.error)
                        {
                            toast.error(res.error.message);
                        }
                        else
                        {
                            await router.push(`/${id}`);
                            toast.success('Thread created successfully!');
                            setTitle('');
                            setContent('');
                        }
                        setIsCreating(false);
                    }} className='ml-auto text-md font-semibold mt-4' />
                }
                {
                    isCreating && <Loader size='sm' className='w-32' />
                }
            </div>
        </div>
    </div>
}