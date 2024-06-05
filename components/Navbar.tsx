import { createServerClient } from "@/utils/supabase/server";
import { Button } from "@mantine/core";
import { PersonIcon } from "@radix-ui/react-icons";
import { LogIn, PlusIcon } from "lucide-react";
import Link from "next/link";
import Gehenna from "./Gehenna";

export default async function Navbar()
{
    const supabase = createServerClient();
    const user = (await supabase.auth.getUser()).data.user;
    const profile = (await supabase.from('profiles').select().eq('id', user?.id ?? '').single()).data;

    return <nav className="w-full grid grid-cols-3 bg-tertiary px-8 border-b-[1px] border-b-neutral-600">
        {
            !user &&
            <div />
        }
        {
            user && profile && user.id === profile.id &&
            <Link href={`/${profile.handle}/publish`} className="w-fit my-auto">
                <Button>
                    <PlusIcon className="mr-2" />
                    Write New Post
                </Button>
            </Link>
        }
        <div className="w-full flex flex-col items-center">
            <Link href='/' className="w-fit scale-50 -my-5 transition duration-150 hover:drop-shadow-lg hover:text-primary">
                <pre className='text-xs scale-100 lg:text-md leading-3'>

                &nbsp;▄████ ▓█████  ██░ ██ ▓█████  ███▄    █  ███▄    █  ▄▄▄      <br />
                &nbsp;██▒ ▀█▒▓█   ▀ ▓██░ ██▒▓█   ▀  ██ ▀█   █  ██ ▀█   █ ▒████▄    <br />
                ▒██░▄▄▄░▒███   ▒██▀▀██░▒███   ▓██  ▀█ ██▒▓██  ▀█ ██▒▒██  ▀█▄  <br />
                ░▓█  ██▓▒▓█  ▄ ░▓█ ░██ ▒▓█  ▄ ▓██▒  ▐▌██▒▓██▒  ▐▌██▒░██▄▄▄▄██ <br />
                ░▒▓███▀▒░▒████▒░▓█▒░██▓░▒████▒▒██░   ▓██░▒██░   ▓██░ ▓█   ▓██▒<br />
                ░▒   ▒ ░░ ▒░ ░ ▒ ░░▒░▒░░ ▒░ ░░ ▒░   ▒ ▒ ░ ▒░   ▒ ▒  ▒▒   ▓▒█░<br />
                ░   ░  ░ ░  ░ ▒ ░▒░ ░ ░ ░  ░░ ░░   ░ ▒░░ ░░   ░ ▒░  ▒   ▒▒ ░<br />
                ░ ░   ░    ░    ░  ░░ ░   ░      ░   ░ ░    ░   ░ ░   ░   ▒   <br />
                    ░    ░  ░ ░  ░  ░   ░  ░         ░          ░       ░  ░<br />

                </pre>
            </Link>
        </div>
        <div className="flex flex-row items-center gap-2 justify-end">
            {
                !user &&
                <Link href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000/auth' : 'https://gehenna.app/auth'} className="w-fit">
                    <Button>
                        <LogIn className="mr-2" />
                        Sign In
                    </Button>
                </Link>
            }
            {
                user &&
                <Link href={process.env.NODE_ENV === 'development' ? 'http://localhost:3000/profile' : 'https://gehenna.app/profile'} className="w-fit">
                    <Button>
                        <PersonIcon className="mr-2" />
                        My Account
                    </Button>
                </Link>
            }
        </div>
    </nav>
}