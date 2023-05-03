import { superClient } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";
import * as sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_MAIL_KEY!);
import * as jwt from 'jsonwebtoken';

/**
 * Handles the request to create a new user.
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @returns 
 */
export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    const serverSuperClient = superClient(process.env.POSTGRES_SERVICE_ROLE_KEY!)
    const { username, password, email } = JSON.parse(req.body);
    console.log(req.body, username, email);
    // Check if user already exists guard clause.
    const userExistsAlready = await serverSuperClient.from('profiles').select('id').eq('email', email).single();
    if (userExistsAlready.data)
    {
        return res.status(409).json({ error: 'User with this email account already exists!' });
    }
    console.log(serverSuperClient);

    // Create the new user in postgres.
    const createUserRes = await serverSuperClient.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
    });

    console.log(createUserRes);

    if (createUserRes.error)
    {
        return res.status(500).json({ error: createUserRes.error.message });
    }

    const confirmEmaiLToken = jwt.sign({
        email: email,
        username: username,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days.
    }, process.env.JWT_SIGNING_KEY!, { algorithm: 'HS256' });

    // TODO: Send email for email confirmation.
    await sgMail.send({
        from: {
            name: 'Gehenna Forum',
            email: 'nubytube@gmail.com'
        },
        to: email,
        subject: 'Confirm Your Email For Gehenna Forum',
        templateId: 'd-f8d816cc490045c0a73577c0b720ce39',
        dynamicTemplateData: {
            'titleText': "Please Confirm Your Email To Gain Full Access To Gehenna Forum!",
            'descriptionText': "Please click the button below to confirm your email address and gain full access to Gehenna Forum! You will be able to gain access to the forum, but you will only be able to read posts until you verify your email.",
            'url': `${checkEnvironment()}/confirm-email?token=${confirmEmaiLToken}`,
            'subject': 'Confirm Your Email For Gehenna Forum',
        }
    });

    // insert the other data about the user into the postgres database for profiles.
    const { data: profile, error } = await serverSuperClient.from('profiles').insert({ 
        id: createUserRes.data.user?.id,
        username: username,
        email: createUserRes.data.user?.email,
    }).single();

    if (error)
    {
        return res.status(500).json({ error: error.message });
    }
    else
    {
        return res.status(201).end();
    }
}


const checkEnvironment = () => {
    let base_url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://gehenna.vercel.app"; 
    return base_url;
};