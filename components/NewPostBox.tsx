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
import { AttachedFile, Tags } from '@/models/Post';
import { ImageDropzone } from './ImageDropzone';
import Placeholder from '@tiptap/extension-placeholder';
import Image from 'next/image';
import ImageCropper from './ImageCropper';
interface NewPostBoxProps
{
    user: User;
}

export default function NewPostBox({ user }: NewPostBoxProps)
{
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [tags, setTags] = useState<string[]>([]);
    const [tagsFilter, setTagsFilter] = useState('');

    const [files, setFiles] = useState<File[]>([]);
    const [coverImage, setCoverImage] = useState<File>();
    const [isCropping, setIsCropping] = useState(false);
    const [previewImageURL, setPreviewImageURL] = useState('');

    const [isFilesTooLarge, setIsFilesTooLarge] = useState(false);

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
            <span className='text-2xl font-bold mr-auto'>Start a New Thread</span>
            <TextInput placeholder='Thread Title' className='w-full font-semibold' value={title} onChange={(e) => setTitle(e.target.value)} size='xl' maxLength={96} />
            <small className='-mt-2 text-gray-500 mr-auto'>{96 - title.length} characters left</small>
            <span className='-mb-2 mr-auto font-bold text-xl'>Cover Image</span>
            <div className='w-full'>
                {
                    !coverImage &&
                    <ImageDropzone onUpload={(files: File[]) => {
                        setCoverImage(files[0]);
                        setIsCropping(true);
                    }} height={100} isUploading={isCreating} />
                }
                {
                    coverImage && isCropping &&
                    <>
                    <ImageCropper file={coverImage} setFile={(file) => {
                        setCoverImage(file);
                        setIsCropping(false);
                        setPreviewImageURL(URL.createObjectURL(file));
                    }} width={400} height={450} className='mx-auto flex flex-col items-center w-[450px]' />
                    <div className='w-full flex justify-center'>
                        <CommonButton text='Remove Image' onClick={() => setCoverImage(undefined)} className='w-[450px] mx-auto mt-4 bg-red-500 hover:bg-red-600' />
                    </div>
                    </>
                }
                {
                    coverImage && !isCropping && previewImageURL &&
                    <Image src={previewImageURL} alt='' width={400} height={450} className='mx-auto flex flex-col items-center w-[450px] rounded-md' />
                }
            </div>
            <span className='text-xl font-semibold -mb-2 mr-auto'>Thread Content</span>
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
                <ImageDropzone onUpload={(files: File[]) => {
                    setFiles(existingFiles => [...existingFiles, ...files]);
                }} isUploading={isCreating} height={50} />
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
                <div className='w-full flex flex-row gap-1 flex-wrap'>
                    {
                        Object.values(Tags).filter(x => x.toLowerCase().startsWith(tagsFilter.toLowerCase())).map(tag => <button>
                            <Chip checked={tags.some(x => x === tag)} color="yellow" onClick={() => {
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
                    <span className='text-red-500'>Files are too large. Please keep your image count below 5mb :(</span>
                }
                {
                    !isCreating && !isFilesTooLarge && coverImage && title && content &&
                    <CommonButton text='Create Thread' onClick={async () => {
                        setIsCreating(true);

                        // Upload the files first, then get their URLs and attach them to the post under the name attachedFileURLs
                        const id = v4();

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
                    }} className='ml-auto text-md font-semibold' />
                }
                {
                    isCreating && <Loader size='sm' className='w-32' />
                }
            </div>
        </div>
    </div>
}


// write a function to generate a colour for each enum type. It must be deterministc.
function generateTagColour(tag: Tags)
{
    

}