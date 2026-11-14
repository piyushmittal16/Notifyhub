// 1. Dangerous characters ko escape karo (XSS Protection)
export const escapeHTML = (str) => {
    if (typeof str !== 'string') {
        str = String(str);
    }

    const escapeChars = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;'
    };

    return str.replace(/[&<>"']/g, (char) => escapeChars[char]);
};

// 2. {{variable}} ko replace karo safe values ke sath
export const renderTemplate = (content, variables = {}) => {
    if (!content) return '';

    // Regex dhoondhta hai: {{ name }}, {{otp}}, etc.
    return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        if (variables[key] !== undefined && variables[key] !== null) {
            return escapeHTML(variables[key]);
        }
        return ''; // Agar variable provide nahi kiya toh khali chhod do
    });
};