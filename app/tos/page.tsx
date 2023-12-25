import Navbar from "@/components/Navbar";



export default function TermsOfServicePage()
{
    return <div className="w-full min-h-screen flex flex-col items-center gap-10">
        <Navbar />
        <div className="w-full max-w-4xl flex flex-col gap-5">
            <span className="text-2xl font-bold text-primary">
                Terms Of Service
            </span>
            <p>
                By using Gehenna, you agree to the Terms of Service. If you don't agree, then please cease using the site.
            </p>
            <p>
                I am ok with controversial topics and will defend your right to post them, but we will not tolerate any of the following:
            </p>
            <ul className="pl-10">
                <li>Pornography</li>
                <li>Terrorism</li>
                <li>Evidence of Criminal Activity</li>
                <li>Intent to harm another individual/group</li>
            </ul>
            <small>
                This list isn't final. If you're unsure of a given topic, please contact me at <b>admin@gehenna.app</b>.
            </small>
            <p>
                If you are found to be posting such content, your account will be banned and all content removed. You will still be able to view the site,
                but the email account associated with your account will be banned indefinitely.
            </p>
            <p>
                If you are suspected to be evading this ban, your new account will be banned also.
            </p>
        </div>
    </div>
}