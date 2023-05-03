import { NextApiRequest, NextApiResponse } from "next";
import * as sgMail from "@sendgrid/mail";
import * as jwt from "jsonwebtoken";
import { superClient } from "@/lib/db";
import { Profile } from "@/models/Profile";
sgMail.setApiKey(process.env.SENDGRID_MAIL_KEY!);
export default async function handle(req: NextApiRequest, res: NextApiResponse)
{
    console.log('processing password reset request.');
    if (req.method !== 'POST')
    {
        return res.status(405).json({ error: 'Method not allowed, please use POST!' });
    }

    const { email } = req.body as { email: string };
    const tempSignIn = 'TempSignInForTheUserToHave';
    const confirmEmaiLToken = jwt.sign({
        email: email,
        password: tempSignIn,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7), // 7 days.
    }, process.env.JWT_SIGNING_KEY!, { algorithm: 'HS256' });

    // We update the user's password to a random password using the superClient, then we send the email with the temp email built in.
    const serverSuperClient = superClient(process.env.POSTGRES_SERVICE_ROLE_KEY!);

    const profile = (await serverSuperClient.from('profiles').select('id').eq('email', email).single()).data as Profile;

    await sgMail.send({
        from: {
            name: 'Gehenna Forum',
            email: 'nubytube@gmail.com'
        },
        to: email,
        subject: 'Password Reset For Gehenna Forum',
        templateId: 'd-f8d816cc490045c0a73577c0b720ce39',
        dynamicTemplateData: {
            'titleText': "Here Is Your Reset Password Link!",
            'descriptionText': "Please click the link below to reset your password to Gehenna!",
            'url': `${checkEnvironment()}/forgot-password?token=${confirmEmaiLToken}`,
            'subject': 'Password Reset For Gehenna Forum',
        }
    });

    return res.status(201).json({ message: 'Email sent!' });
}


const checkEnvironment = () => {
    let base_url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://gehenna.vercel.app"; 
    return base_url;
};