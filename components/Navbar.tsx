import { Button } from "@mantine/core";
import Link from "next/link";

export default function Navbar()
{
    return <nav className="w-full flex items-center justify-between bg-secondary px-8 md:px-16 border-b-[1px] border-b-neutral-600">
        <div className="w-full flex flex-col items-center">
            <Link href='/' className="w-fit transition duration-150 hover:drop-shadow-lg hover:text-primary">
                <Gehenna />
            </Link>
        </div>
    </nav>
}

export function Gehenna()
{
    return <pre className='text-xs scale-75 lg:text-md leading-3'>

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
}