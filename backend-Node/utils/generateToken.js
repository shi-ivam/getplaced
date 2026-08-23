import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || "supersecretjwtkey_getplaced_2026", {
        expiresIn: '30d'
    })

    const isProduction = process.env.NODE_ENV === 'production';

    if (res && res.cookie) {
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: isProduction,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: isProduction ? 'none' : 'lax'
        })
    }

    return token;
}

export default generateToken
