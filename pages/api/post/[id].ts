import { apiServerDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    const serverClient = apiServerDb(req, res);
    const postId = req.query.id as string;
    const { data, error } = await serverClient.from('post').select('*').eq('id', postId).single();

    if (error)
    {
        res.status(500).json({ error });
    }
    else
    {
        res.status(200).json(data);
    }
}