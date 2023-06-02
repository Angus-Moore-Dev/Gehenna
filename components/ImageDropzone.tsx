import { Group, Text, useMantineTheme, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import React from 'react';
import { toast } from 'react-toastify';

interface DropzoneImageProps
{
    onUpload: (files: File[]) => void;
    isUploading: boolean;
    height: number;
    accept: string[];
    multiple?: boolean; // false by default.
}

export function ImageDropzone({ onUpload, isUploading, height, accept, multiple = false }: DropzoneImageProps)
{
    const theme = useMantineTheme();
    return (
        <Dropzone
        onDrop={onUpload}
        onReject={(files) => toast.error('Rejected files! Please upload only images, video and audio files within 3mb')}
        maxSize={3 * 1024 ** 2}
        accept={accept}
        loading={isUploading}
        >
            <Group position="center" spacing="xl" style={{ minHeight: rem(height), pointerEvents: 'none' }}>
                <Dropzone.Accept>
                <IconUpload
                    size="3.2rem"
                    stroke={1.5}
                    color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
                />
                </Dropzone.Accept>
                <Dropzone.Reject>
                <IconX
                    size="3.2rem"
                    stroke={1.5}
                    color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
                />
                </Dropzone.Reject>
                <Dropzone.Idle>
                <IconPhoto size="3.2rem" stroke={1.5} />
                </Dropzone.Idle>

                <div>
                <Text size="xl" inline>
                    Drag {accept.map(type => (type === 'image/*' ? 'images' : type === 'video/*' ? 'videos' : type === 'audio/*' ? 'audio' : 'files')).join(' / ')} here
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                    {
                        multiple && 'Attach as many files as you like, the total must not exceed 3mb.'
                    }
                    {
                        !multiple && 'Attach a single file, the total must not exceed 3mb.'
                    }
                </Text>
                </div>
            </Group>
        </Dropzone>
    );
}