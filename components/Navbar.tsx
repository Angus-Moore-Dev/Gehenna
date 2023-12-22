import { createServerClient } from "@/utils/supabase/server";
import { Button } from "@mantine/core";
import { PersonIcon } from "@radix-ui/react-icons";
import { LogIn } from "lucide-react";
import Link from "next/link";
import Gehenna from "./Gehenna";

export default async function Navbar()
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;

    return <nav className="w-full grid grid-cols-3 bg-secondary px-8 border-b-[1px] border-b-neutral-600">
        <div />
        <div className="w-full flex flex-col items-center">
            <Link href='/' className="w-fit scale-75 transition duration-150 hover:drop-shadow-lg hover:text-primary">
                <Gehenna />
            </Link>
        </div>
        <div className="flex flex-row items-center gap-2 justify-end">
            {
                !user &&
                <Link href={process.env.NODE_ENV === 'development' ? 'http://dev.local/auth' : 'https://gehenna.dev/auth'} className="w-fit">
                    <Button>
                        <LogIn className="mr-2" />
                        Sign In
                    </Button>
                </Link>
            }
            {
                user &&
                <Link href={process.env.NODE_ENV === 'development' ? 'http://dev.local/profile' : 'https://gehenna.dev/profile'} className="w-fit">
                    <Button>
                        <PersonIcon className="mr-2" />
                        My Account
                    </Button>
                </Link>
            }
        </div>
    </nav>
}