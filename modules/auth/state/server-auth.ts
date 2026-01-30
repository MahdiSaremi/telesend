import { cookies } from 'next/headers'
import { cache } from 'react'
import {fetchServerData} from "@/modules/apis/utils/server-requests";
import apis, {User} from "@/configs/apis";

const TOKEN_KEY = "access_token"

export const getServerAuthToken = cache(async (): Promise<string | undefined> => {
    const cookieStore = await cookies()
    return cookieStore.get(TOKEN_KEY)?.value
})

export const getServerUser = cache(async (): Promise<User | null> => {
    const token = await getServerAuthToken()

    if (!token) {
        return null
    }

    try {
        const [user] = await fetchServerData({
            api: apis.auth.user(),
        })

        return user
    } catch (AuthenticationError) {
        return null
    }
})
