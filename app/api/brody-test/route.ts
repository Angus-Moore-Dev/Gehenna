import { NextResponse } from "next/server";



export async function GET()
{
    return NextResponse.json({ message: 'Welcome to Gehenna' });
}

export async function POST(request: Request)
{
    const body = await request.json();
    if (body)
        return NextResponse.json(body);
    else
        return NextResponse.json({ message: 'No body provided, but that\'s kewl' });
}

export async function PUT(request: Request)
{
    const body = await request.json();
    if (body)
        return NextResponse.json(body);
    else
        return NextResponse.json({ message: 'No body provided, but that\'s kewl' });
}

export async function DELETE(request: Request)
{
    const body = await request.json();
    if (body)
        return NextResponse.json(body);
    else
        return NextResponse.json({ message: 'No body provided, but that\'s kewl' });
}

export async function PATCH(request: Request)
{
    const body = await request.json();
    if (body)
        return NextResponse.json(body);
    else
        return NextResponse.json({ message: 'No body provided, but that\'s kewl' });
}

export async function OPTIONS()
{
    return NextResponse.json({ message: 'Welcome to Gehenna' });
}