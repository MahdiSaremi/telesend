import {ApiError, AuthenticationError, ForbiddenError, TooManyAttemptsError, ValidationError} from './errors';
import {ApiCallInit, ApiInit} from "@/modules/apis/types/api-target";
import apiCycle from "@/configs/api-cycle";

class ApiFetcher {
    private baseUrl: string;

    constructor() {
        this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL + "/api";
    }

    private getHeaders(init: ApiInit): Headers {
        const headers = new Headers(init.headers);
        if (!headers.has('Content-Type') && init.method !== 'GET') {
            headers.set('Content-Type', 'application/json');
        }
        if (init.token) {
            headers.set('Authorization', `Bearer ${init.token}`);
        }
        return headers;
    }

    public async request<T = any, M = any>(init: ApiInit<T, M> | ApiCallInit<T, M>): Promise<[T, M]> {
        let reqInit: ApiInit<T, M> = {...init}

        apiCycle.before(reqInit)

        if ((init as ApiCallInit).api?.data) {
            reqInit.data = {...(init as ApiCallInit).api.data, ...reqInit.data ?? {}}
        }

        if ((init as ApiCallInit).api?.path) {
            reqInit.path = (init as ApiCallInit).api.path
        }

        if (reqInit.data) {
            reqInit.method = ((init as ApiCallInit).api?.method ?? (init as ApiInit).method ?? 'GET').toUpperCase()

            if (reqInit.method !== 'GET') {
                reqInit.body = JSON.stringify(reqInit.data)
            } else if (reqInit.method === 'GET') {
                const query = new URLSearchParams()

                Object.entries(reqInit.data).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        key += '[]'
                        for (let i in value) {
                            query.append(key, value[i])
                        }
                    } else if (value !== undefined && value !== null) {
                        query.append(key, String(value))
                    }
                })

                reqInit.path += `${reqInit.path?.includes('?') ? '&' : '?'}${query.toString()}`
            }
        }

        const response = await fetch(this.getEndpoint(reqInit.path ?? ''), {
            ...reqInit,
            headers: this.getHeaders(reqInit),
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = {message: response.statusText};
            }

            if (response.status === 422) {
                throw new ValidationError(errorData.errors, errorData);
            }
            if (response.status === 401) {
                throw new AuthenticationError('ابتدا باید وارد شوید', errorData);
            }
            if (response.status === 403) {
                throw new ForbiddenError('دسترسی مجاز نمی باشد', errorData);
            }
            if (response.status === 429) {
                throw new TooManyAttemptsError('بیش از حد امتحان کردید! کمی بعد مجددا تلاش کنید.', errorData);
            }

            throw new ApiError(errorData.message ?? 'یک خطای ناشناخته رخ داد');
        }

        if (response.status === 204) {
            return [null as T, null as M];
        }

        const responseData = await response.json();
        return [responseData.data as T, responseData.meta as M];
    }

    public getEndpoint(path: string): string {
        return this.baseUrl + path;
    }
}

export const apiFetcher = new ApiFetcher();