'use client'

import {router} from "next/client";
import {toast} from "sonner";
import {FetchCallInit, FetchInit} from "@/modules/apis/types/fetch-init";
import {Auth} from "@/modules/auth/state/auth";
import {routes} from "@/configs/routes";
import {apiFetcher} from "@/modules/apis/utils/api-fetcher";
import {ApiError, AuthenticationError, ForbiddenError, ValidationError} from "@/modules/apis/utils/errors";

export async function fetchData<T = any, M = any>(
    path: string | FetchInit<T, M> | FetchCallInit<T, M>,
    init?: FetchInit<T, M> | FetchCallInit<T, M>,
): Promise<[T, M]> {
    if (typeof path === 'object') {
        init = {...path}
    } else {
        init = {path: path, ...init ?? {}}
    }

    if (init.guest !== false) {
        init.token = Auth.getToken()
    }

    init.setLoading?.(true)

    let responseData = null
    let responseMeta = null
    try {
        [responseData, responseMeta] = await apiFetcher.request<T, M>(init)
    } catch (error) {
        if (!init?.onError?.(error)) {
            if (error instanceof ValidationError) {
                init.form?.clearErrors()

                const errors = error.errors
                let alertMessage = null
                const validationErrorsIsObject = typeof init.validationErrors == 'object'

                for (let key in errors) {
                    if (!init.form || (!init.validationErrors && !init.validationNames)) {
                        alertMessage = errors[key][0]
                        break
                    }

                    // @ts-ignore
                    let replace = init.validationNames?.includes(key) ? key : init.validationErrors && (validationErrorsIsObject ? init.validationErrors[key] : init.validationErrors(key))

                    if (!replace) {
                        alertMessage ??= errors[key][0]
                    } else {
                        init.form.setError(replace, {message: errors[key][0]})
                    }
                }

                alertMessage && toast(alertMessage)
            } else if (error instanceof AuthenticationError) {
                if (init.ignoreAuth) {
                    init.form?.clearErrors()
                    init.onSuccess?.(responseData as T, responseMeta as M)
                } else {
                    toast("ابتدا باید وارد شوید")
                    if (typeof window === 'undefined') {
                        await router.push(routes.login)
                    } else {
                        window.location.replace(routes.login)
                    }
                }
            } else if (error instanceof ForbiddenError) {
                toast(error.message ?? "دسترسی مجاز نمی باشد")

                if (error.data?.redirect) {
                    if (typeof window === 'undefined') {
                        await router.push(error.data?.redirect)
                    } else {
                        window.location.replace(error.data?.redirect)
                    }
                }
            } else if (error instanceof ApiError) {
                toast(error.message)
            } else {
                console.log(error)
                toast("ارتباط با سرور برقرار نشد")
            }
        }

        return [responseData as T, responseMeta as M]
    } finally {
        init.setLoading?.(false)
    }

    init.form?.clearErrors()
    init.onSuccess?.(responseData, responseMeta)

    return [responseData, responseMeta]
}
