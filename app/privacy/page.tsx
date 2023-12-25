import Navbar from "@/components/Navbar";



export default function PrivacyPolicyPage()
{
    return <div className="w-full min-h-screen flex flex-col items-center gap-10">
        <Navbar />
        <div className="w-full max-w-4xl flex flex-col gap-5">
            <span className="text-2xl font-bold text-primary">
                Privacy Policy
            </span>
            <p>
                Gehenna collects all the information that you supply about to it. This includes your email address, your username/name, and your password. This information is used to identify you and to allow you to log in to the site.
            </p>
            <p>
                The system collects IP addresses for security reasons, but we don't use that IP address for anything other than recording purposes.
            </p>
            <p>
                Gehenna uses cookies to store your authentication session, that's it. We do not have third-party cookies or other trackers on the site.
                If you see cookies that do not start with the name "sb-" or "sb:", please email me at <b>admin@gehenna.app</b>.
            </p>
            <p>
                We do not run ads on the site, so there is no requirement for us to adhere to any ad-related privacy policies.
            </p>
            <p>
                Gehenna reserves the right to share the content you post with any third-party provider. 
            </p>
            <p>
                <b>
                    Gehenna will not share metadata or critical information (email addresses, login times etc.) unless subpoenaed by a court
                    that will extradite from Australia.
                </b>
            </p>
        </div>
    </div>
}