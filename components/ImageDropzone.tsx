import { Group, Text, useMantineTheme, rem } from '@mantine/core';
import { IconUpload, IconPhoto, IconX } from '@tabler/icons-react';
import { Dropzone } from '@mantine/dropzone';
import React from 'react';
import { toast } from 'react-toastify';

interface DropzoneImageProps
{
    onUpload: (files: File[]) => void;
    isUploading: boolean;
}

export function ImageDropzone({ onUpload, isUploading }: DropzoneImageProps)
{
    const theme = useMantineTheme();
    return (
        <Dropzone
        onDrop={onUpload}
        onReject={(files) => toast.error('Rejected files! Please upload only images, video and audio files within 3mb')}
        maxSize={3 * 1024 ** 2}
        accept={['image/*', 'audio/*', 'video/*']}
        loading={isUploading}
        >
            <Group position="center" spacing="xl" style={{ minHeight: rem(100), pointerEvents: 'none' }}>
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
                    Drag images here or click to select files
                </Text>
                <Text size="sm" color="dimmed" inline mt={7}>
                    Attach as many files as you like, each file should not exceed 5mb
                </Text>
                </div>
            </Group>
        </Dropzone>
    );
}