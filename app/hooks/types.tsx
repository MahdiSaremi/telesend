import {AuthInfo} from "@/shared/resources";
import {createContext} from "react";
import {Socket} from "socket.io-client";

export interface SecurityData {
    auth: AuthInfo;
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}

export type PageInitial = { layout: 'login' | 'home' | 'search' | 'private_chat'; data?: any }

export const AppContext = createContext<null | {
    socket: Socket | null;
    socketId: number | null;
    status: 'waiting_for_network' | 'connecting' | 'connected';
    securityData: SecurityData | null;
    setSecurityData(value: SecurityData | null): void;
    call(name: string, message: any, {success, fail}: { success?: Function; fail?: Function }): void;
    callAsync<T = any, E = string>(name: string, message: any): Promise<[true, T, null] | [false, null, E | null]>;
    pushPage(layout: PageInitial['layout'], data?: any): void;
    popPage(): void;
}>(null)
