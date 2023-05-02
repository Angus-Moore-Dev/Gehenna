import { apiServerDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import * as jwt from 'jsonwebtoken';

export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    const serverClient = apiServerDb(req, res);
    const { data: { user }} = await serverClient.auth.getUser();

    if (!user)
    {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const { token } = req.body as { token: string };
    const signingKey = process.env.JWT_SIGNING_KEY!;
    const { email } = jwt.verify(token, signingKey, { algorithms: ['HS256'] }) as { email: string };

    // If the email is not the same as the user's email, then we return an error.
    if (email !== user.email)
    {
        console.error('invalid token for::', email, user.email);
        return res.status(401).json({ message: "Not authenticated" });
    }
    else
    {
        console.log('email verified for::', email);
        // Otherwise, we update the user's emailVerified field to true.
        await serverClient.from('profiles').update({ emailVerified: true }).eq('id', user.id);
        return res.status(200).json({ message: "Email verified!" });
    }
}