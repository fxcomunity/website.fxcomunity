import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export interface JWTPayload { id: number; username: string; email: string; role: string }

const getSecret = () => new TextEncoder().encode(
    process.env.JWT_SECRET || 'fxcomunity-dev-secret'
)

export async function signToken(p: JWTPayload): Promise<string> {
    return new SignJWT({ ...p })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('7d')
        .sign(getSecret())
}

export async function verifyToken(t: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(t, getSecret())
        return payload as unknown as JWTPayload
    } catch { return null }
}

export function getToken(req: NextRequest) {
    return req.cookies.get('token')?.value || req.headers.get('authorization')?.replace('Bearer ', '') || null
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
    const t = (await cookies()).get('token')?.value
    return t ? verifyToken(t) : null
}
