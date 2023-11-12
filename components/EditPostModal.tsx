import { useDisclosure } from "@mantine/hooks";
import CommonButton from "./CommonButton";
import { Button, Chip, Loader, Modal, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { Post, Tags } from "@/models/Post";
import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { clientDb } from "@/lib/db";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

export default function EditPostModal({ post, parentOnClose }: { post: Post, parentOnClose: () => void })
{
    const router = useRouter();
    const [tags, setTags] = useState(post.tags);
    const [content, setContent] = useState(post.content);
    const [title, setTitle] = useState(post.title);
    const [opened, { open, close }] = useDisclosure(false);
    const [tagsFilter, setTagsFilter] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
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

    const [isChanged, setIsChanged] = useState(false);
    const [alertOpened, { open: alertOpen, close: alertClose }] = useDisclosure(false);

    useEffect(() => {
        if (title !== post.title || tags !== post.tags || content !== post.content)
            setIsChanged(true);
        else
            setIsChanged(false);
    }, [title, tags, content]);
    
    return <>
    <CommonButton className="w-full" text='Edit Post' onClick={open} />
    <Modal opened={opened} onClose={() => {
        if (isChanged)
            alertOpen();
        else
        {
            close();
            parentOnClose();
            setIsChanged(false);
            alertClose();
        }
    }} size='xl' centered>
        <div className="w-full flex flex-col gap-4">
            <TextInput placeholder='Thread Title' className='w-full font-semibold' value={title} onChange={(e) => setTitle(e.target.value)} size='xl' maxLength={96} />
            <small className='-mt-2 text-gray-500 mr-auto'>{96 - title.length} characters left</small>
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
            {
                !isUpdating &&
                <CommonButton text='Save Changes' className='ml-auto text-md font-semibold mt-4' onClick={async () => {
                    setIsUpdating(true);
                    const res = await clientDb.from('post').update({
                        title,
                        content,
                        tags
                    }).eq('id', post.id);

                    if (res.error) toast.error(res.error.message);
                    else
                    {
                        toast.success('Post updated!');
                        router.reload();
                        close();
                        parentOnClose();
                    }
                    setIsUpdating(false);
                }} />
            }
            {
                isUpdating &&
                <Loader className="my-2 mr-12 ml-auto" />
            }
        </div>
    </Modal>
    <Modal opened={alertOpened} onClose={alertClose} centered size='sm' className="background-opacity-60">
        <div className="p-2">
            <h1 className="text-xl font-bold">
                Are You Sure?
            </h1>
            <p>
                You have unsaved changes that you will lose if you continue.
            </p>
            <Button onClick={() => alertClose()} className="mt-2 mr-2" variant="light">
                Cancel
            </Button>
            <Button onClick={() => {
                setIsChanged(false);
                close();
                alertClose();
            }} className="mt-2" variant='outline'>
                Continue
            </Button>
        </div>
    </Modal>
    </>;
}