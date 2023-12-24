import { Profile } from "@/utils/global.types";
import Gehenna from "./Gehenna";
import Link from "next/link";
import { appURL } from "@/utils/appURL";


export default async function HandleFooter({ profile }: { profile?: Profile })
{
    return <footer className="w-full p-4 md:p-8 flex flex-col items-center gap-4 bg-secondary border-t-[1px] border-t-neutral-600">
        <Link href={process.env.NODE_ENV === 'development' ? 'http://dev.local' : 'https://gehenna.app'} className="w-fit" target="_blank">
            <Gehenna />
        </Link>
        <p>
            Voices of the damned.
        </p>
        <div className="flex flex-row gap-4">
            <Link href={`${appURL}/privacy`} className="w-fit underline text-blue-400 hover:text-blue-300">
                Privacy Policy
            </Link>
            <Link href={`${appURL}/tos`} className="w-fit underline text-blue-400 hover:text-blue-300">
                TOS
            </Link>
            <Link href={`${appURL}/faq`} className="w-fit underline text-blue-400 hover:text-blue-300">
                FAQ
            </Link>
            <Link href={`${appURL}/about`} className="w-fit underline text-blue-400 hover:text-blue-300">
                About
            </Link>
        </div>
        <small className="text-neutral-600 max-w-lg text-center">
            {profile && <>{profile.name}&apos;s content is their own.&nbsp;</>}
            Gehenna is not responsible for the content posted here, but will defend its
            users to express their views, no matter how controversial. We will only remove content that is inciting violence. Gehenna is a free service
            and we do not sell data, place ads or engage in any monetisation outside of donations.
            <br />
            <b>Free speech is a human right.</b>
        </small>
        <small className="text-neutral-400 max-w-lg text-center">
            admin@gehenna.app
        </small>
    </footer>
}