import { RichTextEditor, Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Color } from '@tiptap/extension-color';
import { useEffect, useState } from 'react';
import { Button, Loader, TextInput } from '@mantine/core';
import CommonButton from './CommonButton';
import { clientDb } from '@/lib/db';
import { User } from '@supabase/supabase-js';
import { toast } from 'react-toastify';

interface NewPostBoxProps
{
    user: User;
}

export default function NewPostBox({ user }: NewPostBoxProps)
{
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isCreating, setIsCreating] = useState(false);
	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			Link,
			Superscript,
			SubScript,
			Highlight,
			TextAlign.configure({ types: ['heading', 'paragraph'] }),
		],
		content,
        onUpdate({ editor }) {
            setContent(editor.getHTML());
        }
	});

    return <div className='w-full flex flex-col items-center'>
        <div className='w-full max-w-3xl flex flex-col items-center gap-4'>
            <span className='text-2xl font-bold mr-auto'>Start a New Thread</span>
            <TextInput placeholder='Thread Title' className='w-full' value={title} onChange={(e) => setTitle(e.target.value)} />
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
                        <RichTextEditor.ColorPicker
                            colors={[
                                '#25262b',
                                '#868e96',
                                '#fa5252',
                                '#e64980',
                                '#be4bdb',
                                '#7950f2',
                                '#4c6ef5',
                                '#228be6',
                                '#15aabf',
                                '#12b886',
                                '#40c057',
                                '#82c91e',
                                '#fab005',
                                '#fd7e14',
                            ]}
                        />
                    </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
            </RichTextEditor>
            <div className='flex flex-row gap-2 ml-auto items-center'>
                {
                    !isCreating &&
                    <CommonButton text='Create Thread' onClick={async () => {
                        setIsCreating(true);
                        const res = await clientDb.from('post').insert({
                            title,
                            content,
                            userId: user.id
                        });
                        if (res.error)
                        {
                            toast.error(res.error.message);
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