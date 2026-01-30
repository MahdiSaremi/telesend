'use client'

import {ReactNode, useEffect} from 'react'
import {createContext} from "react";
import {User} from "@/configs/apis";
import {UserSingleton} from "@/modules/auth/state/auth";

export const UserContext = createContext<User | null>(null)

export function UserProvider({user, children}: {
    user: User | null
    children: ReactNode
}) {
    UserSingleton.forcePreset(user)

    useEffect(() => {
        UserSingleton.forceSet(user)
    }, [user]);

    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    )
}
