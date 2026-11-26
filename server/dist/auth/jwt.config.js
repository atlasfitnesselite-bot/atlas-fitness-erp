"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = getJwtSecret;
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET environment variable must be set in production');
        }
        return 'dev-only-insecure-jwt-secret-change-in-env';
    }
    return secret;
}
//# sourceMappingURL=jwt.config.js.map