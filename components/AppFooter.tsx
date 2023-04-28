import Link from "next/link";

export default function AppFooter()
{
    return <div className="w-full min-h-fit h-14 bg-secondary text-zinc-100 flex flex-row px-[4%]">
        <section className="w-1/4 h-full px-4 flex items-center justify-start">
            <Link href='https://github.com/Angus-Moore-Dev'>
                Created by Angus Moore
            </Link>
        </section>
    </div>
}