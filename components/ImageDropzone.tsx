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
        onReject={(files) => toast.error('Rejected files! Please upload only images, video and audio files within 50mb')}
        maxSize={50 * 1024 ** 2}
        accept={accept}
        multiple={multiple}
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
                        {
                            multiple &&
                            <span>
                                Drag {accept.map(type => (type === 'image/*' ? 'images' : type === 'video/*' ? 'videos' : type === 'audio/*' ? 'audio' : 'files')).join(' / ')} here    
                            </span>
                        }
                        {
                            !multiple &&
                            <span>
                                Drag {accept.map(type => (type === 'image/*' ? 'an image' : type === 'video/*' ? 'a video' : type === 'audio/*' ? 'an audio' : 'a file')).join(' / ')} here
                            </span>
                        }
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={7}>
                        {
                            multiple && 'Attach as many files as you like, the total must not exceed 2mb.'
                        }
                        {
                            !multiple && 'Attach a single file, the total must not exceed 2mb.'
                        }
                    </Text>
                </div>
            </Group>
        </Dropzone>
    );
}