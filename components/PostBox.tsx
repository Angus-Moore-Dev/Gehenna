import Image from "next/image";

export default function PostBox()
{
    const text = `Lorem ipsum dolor sit \n\namet consectetur adipisicing\n elit. Repellat, alias dolor\n\n\n\n\! Necessitatibus error fuga facilis, laboriosam voluptates temporibus ut idquibusdam libero aut quia velit quaerat ullam blanditiis modi culpa consequuntur quod commodi, incidunt, possimus quidem nobis. Quo excepturi sit quam accusantium delectus. Nihil, aliquam soluta. Iste quam, quibusdam rem in iusto voluptate ipsum aspernatur amet soluta, ratione quos ipsa voluptatum magni a dolores, eius doloremque ut obcaecati ad blanditiis quas. Cum voluptatibus rem, ipsum in eos maxime ut.`
    return <div className="w-full bg-secondary rounded p-4 flex flex-col gap-4 max-h-[256px] transition hover:bg-primary hover:text-black hover:cursor-pointer">
        <div className="flex flex-row w-full gap-2 flex-wrap">
            <div className="flex flex-row gap-4 w-64">
                <div className="flex flex-col gap-1 h-full justify-start">
                    <p className="text-xl font-bold">#1</p>
                </div>
                <div className="flex flex-row items-start gap-4 w-48">
                    <Image src='/favicon.png' alt='awawa' width='80' height='80' className="object-cover rounded" />
                    <span><span className="font-semibold">AngusMoore</span> asked:</span>
                </div>
            </div>
            <div id='text-box' className="w-full bg-transparent focus-none lg:w-[70%] max-h-[100px] lg:max-h-[200px] scrollbar">
                {
                    text
                    .replaceAll(/\n+/g, '\n')
                }
            </div>
        </div>
    </div>
}