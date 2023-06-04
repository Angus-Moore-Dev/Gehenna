export default function Footer()
{
    return <footer className="hidden lg:w-full md:flex flex-row items-center px-16 bg-tertiary">
        <div className="flex-grow py-2">
            <span className="text-neutral-600 font-semibold">Copyright Angus Moore, 2023</span>
        </div>
        <div className="flex flex-row gap-2">
            <span className="text-neutral-600 font-semibold">angusmoore.dev@gmail.com</span>
            <span className="text-amber-600 font-semibold">Gehenna is a personal project and should not have sensitive information posted here.</span>
        </div>
    </footer>
}