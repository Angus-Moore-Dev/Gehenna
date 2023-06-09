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

    if (!email)
    {
        return res.status(400).json({ error: 'Please provide an email!' });
    }

    // Check if the user exists in the database before sending an email
    const adminClient = superClient(process.env.POSTGRES_SERVICE_ROLE_KEY!);
    const user = (await adminClient.from('profiles').select('id').eq('email', email).single()).data;

    if (!user)
    {
        res.status(404).json({
            error: 'User with this email does not exist!'
        });
    }

    // Generate the URL that the user will click. This is a PostgREST function to generate a JWT token that will be used to verify the user's identity.
    const link = await adminClient.auth.admin.generateLink({ email: email, type: 'recovery', options: { redirectTo: `${checkEnvironment()}/reset-password` } });
    const url = link.data.properties?.action_link;

    if (!url)
    {
        return res.status(500).json({ error: 'Your invite code was unable to be generated, please ensure you have an account or try again!' });
    }

    await sgMail.send({
        from: {
            name: 'Gehenna Forum',
            email: 'angusmoore.dev@gmail.com'
        },
        to: email,
        subject: 'Password Reset For Gehenna Forum',
        templateId: 'd-f8d816cc490045c0a73577c0b720ce39',
        dynamicTemplateData: {
            'titleText': "Here Is Your Reset Password Link!",
            'descriptionText': "Please click the link below to reset your password to Gehenna!",
            'url': url,
            'subject': 'Password Reset For Gehenna Forum',
        }
    });

    return res.status(201).json({ message: 'Email sent!' });
}


const checkEnvironment = () => {
    let base_url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://www.gehenna.dev";
    return base_url;
};