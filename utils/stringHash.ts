import crypto from 'crypto';

export function generateSHA256Hash(text: string, id: string): string
{
    return crypto.createHmac('sha256', id).update(text).digest('hex');
}