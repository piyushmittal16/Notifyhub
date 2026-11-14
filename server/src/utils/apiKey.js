import crypto from 'crypto';

export const generateApiKey = () => {
    const randomBytes = crypto.randomBytes(24).toString('hex');
    return `sk_live_${randomBytes}`;
};

export const hashApiKey = (apiKey) => {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
};
