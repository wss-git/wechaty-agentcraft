
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from 'utils/clientRequest';




export const useAuthenticationStore = create<any>(persist(
    (set) => ({
        token: '',
        setToken: (token: string) => set({ token }),
    }),
    {
        name: 'aigc',
    }
))





export async function login(mobile: string, smscode: string) {
    const res: any = await request("/api/authentication/login", {
        method: 'POST',
        body: JSON.stringify({ mobile, smscode }),
        headers: {
            "Content-Type": "application/json",
        }
    });
    return res;
}

export async function getSmsCode(mobile: string) {
    const res: any = await request("/api/authentication/sms", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ mobile }),
    });
    return res;
}

export async function register(username: string, password: string) {
    const res: any = await request("/api/authentication/register", {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            "Content-Type": "application/json",
        }
    });
    return res;
}