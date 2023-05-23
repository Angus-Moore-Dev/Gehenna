import { apiServerDb } from "@/lib/db";
import { generateSHA256Hash } from "@/utils/stringHash";
import { Session } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    if (req.method !== "POST")
    {
        res.status(405).json({ message: "Method not allowed." });
        return;
    }

    const { newPassword, session } = req.body as { newPassword: string, session: Session | null };
    const serverClient = apiServerDb(req, res);
    const user = (await serverClient.auth.getUser()).data.user;

    if (!user)
    {
        res.status(401).json({ message: "You are not authenticated." });
        return;
    }

    const hashedNewPassword = generateSHA256Hash(newPassword, user.email!);

    const updateRes = await serverClient.auth.updateUser({ password: hashedNewPassword });

    if (updateRes.error)
    {
        res.status(500).json({ message: "Failed to update password." });
        return;
    }
    else
    {
        res.status(200).json({ message: "Password updated successfully." });
        return;
    }
}