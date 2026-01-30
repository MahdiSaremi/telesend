import {ApiCallInit, ApiInit} from "@/modules/apis/types/api-target";

export default {
    before: <T, M>(init: ApiInit<T, M> | ApiCallInit<T, M>) => {
        init.headers ??= {}
        // @ts-ignore
        init.headers['target-domain'] = 'a.localhost:3000'
    },
}
