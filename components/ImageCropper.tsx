import { Slider } from "@mantine/core";
import { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";
import CommonButton from "./CommonButton";
import { v4 } from "uuid";

interface ImageCropper
{
    file: File;
    setFile: (file: File) => void;
    width: number;
    height: number;
    className?: string;
}

export default function ImageCropper({ file, setFile, width, height, className }: ImageCropper)
{
    const ref = useRef<AvatarEditor>(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    return <div className={`${className}`}>
        <AvatarEditor
            ref={ref}
            image={file}
            width={width}
            height={height}
            border={15}
            color={[0, 0, 0, 0.69]} // RGBA
            scale={scale}
            rotate={rotate}
            className="rounded-md"
        />
        <div className={`w-full`}>
            <span>Scale</span>
            <Slider value={scale} onChange={(e) => setScale(e)} min={0} max={15} step={0.1} label={scale} />
            <span>Rotate</span>
            <Slider value={rotate} onChange={(e) => setRotate(e)} min={0} max={360} step={1} label={rotate} />
        </div>
        <CommonButton text='Accept' onClick={() => {
            ref.current?.getImage().toBlob(async (blob: Blob | null) => {
                if (blob)
                {
                    const file = new File([blob], `${v4()}.${blob.type.split('/')[1]}`, { type: blob.type });
                    setFile(file);
                }
            });
        }} className="bg-green-500 hover:bg-green-400 w-full mt-4" />
    </div>
}