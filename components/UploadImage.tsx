import { ImageDropzone } from "./ImageDropzone";

interface UploadImageProps
{
    multiple?: boolean;
    onUpload: (files: File[] | File) => void;
    isUploading: boolean;
    height: number;
    accept: string[];
    width: number;
}

export default function UploadImage()
{
    return <>
        <ImageDropzone onUpload={function (files: File[]): void {
            throw new Error("Function not implemented.");
        }} isUploading={false} height={0} accept={[]} />    
    </>
}