'use client'

import Cookies from "js-cookie";
import {singleton} from "@/modules/core/utils/singleton";
import {fetchData} from "@/modules/apis/utils/requests";
import apis, {User} from "@/configs/apis";

const TOKEN_KEY = "access_token"

export const Auth = {
    setToken: (token: string, expiresAt: Date) => {
        Cookies.set(TOKEN_KEY, token, {expires: expiresAt})
        UserSingleton.forceLoad()
    },

    getToken: () => {
        return Cookies.get(TOKEN_KEY)
    },

    removeToken: () => {
        Cookies.remove(TOKEN_KEY)
    },
}

export const UserSingleton = singleton<User>({
    using: async callback => {
        await fetchData({
            api: apis.auth.user(),
            onSuccess: data => {
                callback(data as (User | null))
            },
        })
    },
})
