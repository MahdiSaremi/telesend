import {AuthInfo} from "@/shared/resources";
import {createContext} from "react";
import {Socket} from "socket.io-client";
import {useConnection} from "@/app/hooks/useConnection";

export interface SecurityData {
    auth: AuthInfo;
    publicKey: CryptoKey;
    privateKey: CryptoKey;
}

export type PageInitial = { layout: 'login' | 'home' | 'search' | 'private_chat'; data?: any }

export const AppContext = createContext<null | {
    connection: ReturnType<typeof useConnection>;
    securityData: SecurityData | null;
    setSecurityData(value: SecurityData | null): void;
    pages: PageInitial[];
    pushPage(layout: PageInitial['layout'], data?: any): void;
    popPage(): void;
}>(null)
