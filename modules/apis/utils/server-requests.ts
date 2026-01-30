import {apiFetcher} from "@/modules/apis/utils/api-fetcher";
import {ApiCallInit, ApiInit} from "@/modules/apis/types/api-target";
import {getServerAuthToken} from "@/modules/auth/state/server-auth";

export async function fetchServerData<T = any, M = any>(init: ApiInit<T, M> | ApiCallInit<T, M>) {
    return apiFetcher.request<T>({
        token: await getServerAuthToken(),
        ...init,
    })
}
