export interface TokenPayload {
    userId: string,
    email: string,
    firstname?: string | null
    lastname?: string | null
    role: string
}