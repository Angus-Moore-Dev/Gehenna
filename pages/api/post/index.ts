import { apiServerDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    const { limit } = req.query as { handle: string, limit: string };
    const serverClient = apiServerDb(req, res);
    
    const { data, error } = await serverClient
    .from('post')
    .select(`id, createdAt, title, tags, postImageURL, profiles ( id, username, avatar, handle ), startups ( id, name, avatar, bannerURL )`)
    .order('createdAt', { ascending: false })
    .limit(parseInt(limit) ?? 50);

    if (error)
    {
        res.status(500).json({ error });
    }
    else
    {
        res.status(200).json(data);
    }
}