import {MediaFile} from "@/modules/media-file/types/media-types";
import {ApiTarget} from "@/modules/apis/types/api-target";
import {formatPhoneNumber} from "@/modules/core/utils/formats";

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: MediaFile | null;
    is_verified: boolean;
    balance: number;
}

export type ApiResult<T> = T extends (...args: any[]) => ApiTarget<infer R> ? R : never

export default {
    auth: {
        send: (username: string): ApiTarget<{expires_at: string}> => ({
            path: '/v1/auth/send',
            method: 'POST',
            data: {
                username: formatPhoneNumber(username),
            },
        }),
        verify: (username: string, code: string): ApiTarget<{token: string, expires_at: string}> => ({
            path: '/v1/auth/verify',
            method: 'POST',
            data: {
                username: formatPhoneNumber(username),
                code,
            },
        }),
        user: (): ApiTarget<User> => ({
            path: '/v1/auth/user',
            method: 'GET',
        }),
    },
    shop: {
        products: {
            index: (): ApiTarget<{
                id: number;
                title: string;
                image: MediaFile | null;
                price: number;
                sell_count: number;
            }[]> => ({
                path: '/v1/@shop/services',
                method: 'GET',
            }),
            storeShow: (): ApiTarget<null> => ({
                path: '/v1/@shop/services/store',
                method: 'GET',
            }),
            store: (): ApiTarget<null> => ({
                path: '/v1/@shop/services/store',
                method: 'POST',
            }),
            show: (id: number): ApiTarget<{
                id: number;
                title: string;
                image: MediaFile | null;
                price: number;
            }> => ({
                path: '/v1/@shop/services/' + id,
                method: 'GET',
            }),
            update: (id: number): ApiTarget<null> => ({
                path: '/v1/@shop/services/' + id + '/update',
                method: 'POST',
            }),
            destroy: (id: number): ApiTarget<null> => ({
                path: '/v1/@shop/services/' + id + '/destroy',
                method: 'POST',
            }),
        },

        services: {
            index: (): ApiTarget<{
                id: number;
                title: string;
                description: string;
                image: MediaFile | null;
            }[]> => ({
                path: '/v1/@shop/services',
                method: 'GET',
            }),
            storeShow: (): ApiTarget<null> => ({
                path: '/v1/@shop/services/store',
                method: 'GET',
            }),
            store: (): ApiTarget<null> => ({
                path: '/v1/@shop/services/store',
                method: 'POST',
            }),
            show: (id: number): ApiTarget<{
                id: number;
                title: string;
                description: string;
                image: MediaFile | null;
            }> => ({
                path: '/v1/@shop/services/' + id,
                method: 'GET',
            }),
            update: (id: number): ApiTarget<null> => ({
                path: '/v1/@shop/services/' + id + '/update',
                method: 'POST',
            }),
            destroy: (id: number): ApiTarget<null> => ({
                path: '/v1/@shop/services/' + id + '/destroy',
                method: 'POST',
            }),
        },

        employees: {
            index: (): ApiTarget<{
                id: number;
                name: string;
                position: string;
                bio: string;
                image: MediaFile | null;
                phone: string;
                permissions: string[];
                services: number[];
            }[]> => ({
                path: '/v1/@shop/employees',
                method: 'GET',
            }),
            storeShow: (): ApiTarget<null> => ({
                path: '/v1/@shop/employees/store',
                method: 'GET',
            }),
            store: (): ApiTarget<null> => ({
                path: '/v1/@shop/employees/store',
                method: 'POST',
            }),
            show: (id: number): ApiTarget<{
                id: number;
                name: string;
                position: string;
                bio: string;
                image: MediaFile | null;
                phone: string;
                permissions: string[];
                services: number[];
            }> => ({
                path: '/v1/@shop/employees/' + id,
                method: 'GET',
            }),
            update: (id: number): ApiTarget<null> => ({
                path: '/v1/@shop/employees/' + id + '/update',
                method: 'POST',
            }),
            destroy: (id: number): ApiTarget<null> => ({
                path: '/v1/@shop/employees/' + id + '/destroy',
                method: 'POST',
            }),
        },
    },
}
