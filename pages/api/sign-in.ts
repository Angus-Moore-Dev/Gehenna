import { apiServerDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    const serverClient = apiServerDb(req, res);
    const { email, password } = req.body as { email: string, password: string };

    // Check if this user is already signed in.
    const { data: { session } } = await serverClient.auth.getSession();

    if (session)
    {
        return res.status(200).json({ session: session });
    }

    // Sign in the user.
    const { data: signInRes, error } = await serverClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error)
    {
        return res.status(500).json({ error: error.message });
    }
    else
    {
        if (!signInRes.session)
        {
            return res.status(401).json({
                error: 'Invalid Credentials!',
            });
        }
        else
        {
            return res.status(200).json({ session: signInRes.session, user: signInRes.user });
        }
    }
}