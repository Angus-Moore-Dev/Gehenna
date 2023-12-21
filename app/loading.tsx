import { Loader } from "@mantine/core";


export default async function Loading()
{
    return <div className="flex-grow flex items-center justify-center">
        <Loader size={24} className="m-auto" />
    </div>
}