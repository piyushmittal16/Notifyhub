/**
 * 🛡️ NoSQL Query Injection Sanitizer
 * Recursively removes any object keys starting with '$' or containing '.'
 */
const sanitize = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
        return obj.map(sanitize);
    }

    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
        // Agar key '$' se shuru hoti hai (MongoDB Operator) ya '.' contain karti hai, toh use drop kar do!
        if (key.startsWith('$') || key.includes('.')) {
            continue;
        }
        cleaned[key] = sanitize(value);
    }
    return cleaned;
};

export const mongoSanitize = (req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitize(req.body);
    }
    if (req.params && typeof req.params === 'object') {
        req.params = sanitize(req.params);
    }
    next();
};