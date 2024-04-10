
import { create } from "zustand";
import { persist, devtools } from "zustand/middleware";

import { request } from 'utils/clientRequest';


interface ISystemConfig {
    autoReply: string,
    beServiceDomain: string,
    beFunctionName: string

}
interface OverviewStore {
    qrCode: string,
    loading: boolean,
    user: string,
    qrCodeOpen: boolean,
    isLogin: boolean,
    messageLimit: number,
    userMessageTab: any;
    systemConfig: ISystemConfig;
    userMessages: { message: string; }[],
    setSystemConfig: (systemConfig: ISystemConfig) => void,
    setUser: (user: string) => void,
    setMessageLimit: (messageLimit: number) => void,
    setQrCodeOpen: (qrCodeOpen: boolean) => void,
    setIsLogin: (isLogin: boolean) => void,
    setLoading: (loading: boolean) => void,
    setQrCode: (qrCode: string) => void,
    setUserMessages: (data: any) => void,
    setUserMessageTab: (data: any) => void,
}

// const AGENTCRAFT_CLIENTACCESS_WECHAT = 'AGENTCRAFT_CLIENTACCESS_WECHAT';

export const useOverviewStore = create<OverviewStore>()(devtools((set) => ({
    qrCode: '',
    user: '',
    qrCodeOpen: true,
    isLogin: false,
    userMessages: [],
    loading: false,
    messageLimit: 100,
    autoReply: 'true',
    systemConfig: {
        autoReply: 'true',
        beFunctionName: '',
        beServiceDomain: ''
    },
    userMessageTab: { system: [], user: [], public: [], robot: [], group: [] },
    setSystemConfig: (systemConfig: ISystemConfig) => set(() => {
        return ({ systemConfig })
    }),
    setUserMessageTab: (data: any) => set((state) => {
        const userMessageTab = state.userMessageTab;
        const type = data.type;
        if (userMessageTab[type]) {
            userMessageTab[type] = [...userMessageTab[type], data];
        }
        return ({ userMessageTab })
    }),
    // se
    setUser: (user: string) => set(() => {
        return ({ user })
    }),
    setMessageLimit: (messageLimit: number) => set(() => {
        return ({ messageLimit })
    }),
    setQrCodeOpen: (qrCodeOpen: boolean) => set(() => {
        return ({ qrCodeOpen })
    }),
    setIsLogin: (isLogin: boolean) => set(() => {
        return ({ isLogin })
    }),
    setUserMessages: (data: any) => set((state) => {
        let currentUserMessages = state.userMessages;
        const messageLimit = state.messageLimit;
        if (currentUserMessages.length > messageLimit) {
            currentUserMessages = currentUserMessages.slice(currentUserMessages.length - messageLimit);
        }

        return ({ userMessages: [...currentUserMessages, data] })
    }),
    setLoading: (status: boolean) => set(() => {
        return ({ loading: status })
    }),
    setQrCode: (qrCode: string) => set(() => {
        return ({ qrCode })
    }),

})))

// export const useOverviewStore = create<OverviewStore>()(devtools(persist((set) => ({
//     qrCode: '',
//     user: '',
//     qrCodeOpen: true,
//     isLogin: false,
//     userMessages: [],
//     loading: false,
//     messageLimit: 100,
//     autoReply: 'true',
//     systemConfig: {
//         autoReply: 'true',
//         beFunctionName: '',
//         beServiceDomain: ''
//     },
//     userMessageTab: { system: [], user: [], public: [], robot: [], group: [] },
//     setSystemConfig: (systemConfig: ISystemConfig) => set(() => {
//         return ({ systemConfig })
//     }),
//     setUserMessageTab: (data: any) => set((state) => {
//         const userMessageTab = state.userMessageTab;
//         const type = data.type;
//         if (userMessageTab[type]) {
//             userMessageTab[type] = [...userMessageTab[type], data];
//         }
//         return ({ userMessageTab })
//     }),
//     // se
//     setUser: (user: string) => set(() => {
//         return ({ user })
//     }),
//     setMessageLimit: (messageLimit: number) => set(() => {
//         return ({ messageLimit })
//     }),
//     setQrCodeOpen: (qrCodeOpen: boolean) => set(() => {
//         return ({ qrCodeOpen })
//     }),
//     setIsLogin: (isLogin: boolean) => set(() => {
//         return ({ isLogin })
//     }),
//     setUserMessages: (data: any) => set((state) => {
//         let currentUserMessages = state.userMessages;
//         const messageLimit = state.messageLimit;
//         if (currentUserMessages.length > messageLimit) {
//             currentUserMessages = currentUserMessages.slice(currentUserMessages.length - messageLimit);
//         }

//         return ({ userMessages: [...currentUserMessages, data] })
//     }),
//     setLoading: (status: boolean) => set(() => {
//         return ({ loading: status })
//     }),
//     setQrCode: (qrCode: string) => set(() => {
//         return ({ qrCode })
//     }),
// }),
//     {
//         name: AGENTCRAFT_CLIENTACCESS_WECHAT,
//     }
// )))


export async function getSystemConfig() {
    const result: any = await request(`/api/systemConfig/init`);
    const state: any = useOverviewStore.getState();
    const setSystemConfig = state.setSystemConfig;
    const data = result.data;
    setSystemConfig(data);

}


export async function updateSystemConfig(payload: any) {
    return await request("/api/systemConfig/update", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
        },
    });
}


// getSystemConfig();

