'use client'

import {DependencyList, useContext, useEffect, useMemo} from "react";
import {AppContext} from "@/app/hooks/types";
import {AuthInfo} from "@/shared/resources";
import {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    decryptPrivateKeyString,
    decryptUsingCustomKey,
    decryptUsingPrivateKey, encryptPrivateKey, encryptUsingCustomKey, exportKey, generateKeyPair,
    importPrivateKey,
    importPublicKey, stringToUint8Array, uint8ArrayToString
} from "@/shared/helpers";

export function useCore() {
    const app = useContext(AppContext)!

    return useMemo(() => {
        return {
            connection: app.connection,
            app,

            auth: {
                async loginUsingStorage() {
                    if (!localStorage.getItem('username') || !localStorage.getItem('password')) {
                        return false
                    }

                    const [ok, data, err] = await app.connection.call<AuthInfo>('login', {
                        username: localStorage.getItem('username'),
                        password: localStorage.getItem('password'),
                    }, {
                        alsoInLogin: true,
                    })

                    if (ok && data.public_key) {
                        try {
                            app.setSecurityData({
                                auth: data,
                                publicKey: await importPublicKey(data.public_key),
                                privateKey: await importPrivateKey(await decryptPrivateKeyString(
                                    data.encrypted_private_key!,
                                    localStorage.getItem('password')!,
                                    data.iv!,
                                    data.key_salt!,
                                )),
                            })
                        } catch (e) {
                            return false
                        }

                        app.connection.setStatus('connected')
                        return true
                    } else {
                        return false
                    }
                },

                async login({username, password}: {
                    username: string;
                    password: string
                }): Promise<[false, string] | [true, 'done' | 'new_password']> {
                    const [ok, data, err] = await app.connection.call<AuthInfo>('login', {
                        username,
                        password,
                    })

                    if (ok) {
                        if (data.public_key) {
                            app?.setSecurityData({
                                auth: data,
                                publicKey: await importPublicKey(data.public_key),
                                privateKey: await importPrivateKey(await decryptPrivateKeyString(
                                    data.encrypted_private_key!,
                                    password,
                                    data.iv!,
                                    data.key_salt!,
                                )),
                            })

                            return [true, 'done']
                        } else {
                            return [true, 'new_password']
                        }
                    } else {
                        return [false, err ?? "ورود ناموفق بود. دوباره امتحان کنید."]
                    }
                },

                async register({username, password, newPassword}: {
                    username: string;
                    password: string;
                    newPassword: string
                }): Promise<[false, string] | [true, null]> {
                    const {publicKey, privateKey} = await generateKeyPair()

                    const publicKeyStr = await exportKey(publicKey)
                    const privateKeyStr = await exportKey(privateKey)

                    const encrypted = await encryptPrivateKey(privateKeyStr, password)

                    const [ok, data, err] = await app.connection.call<AuthInfo>('login', {
                        username,
                        password,
                        newPassword,
                        publicKey: publicKeyStr,
                        encryptedPrivateKey: encrypted.encryptedPrivateKey,
                        iv: encrypted.iv,
                        salt: encrypted.salt,
                    })

                    if (ok) {
                        if (data.public_key) {
                            localStorage.setItem('username', username)
                            localStorage.setItem('password', password)
                            app?.setSecurityData({
                                auth: data,
                                publicKey: publicKey,
                                privateKey: privateKey,
                            })

                            return [true, null]
                        } else {
                            return [false, "خطای ناشناخته ای رخ داد"]
                        }
                    } else {
                        return [false, err ?? "ورود ناموفق بود. دوباره امتحان کنید."]
                    }
                }
            },

            encryption: {
                async decryptMessage(key: Uint8Array, text: string, iv: number[]) {
                    try {
                        return uint8ArrayToString(await decryptUsingCustomKey(
                            key,
                            base64ToArrayBuffer(text),
                            iv,
                        ))
                    } catch (e) {
                        return null
                    }
                },
                async decryptChatKey(key: string) {
                    return new Uint8Array(
                        await decryptUsingPrivateKey(app.securityData!.privateKey, base64ToArrayBuffer(key))
                    )
                },
                async encryptMessage(key: Uint8Array, text: string) {
                    const en = await encryptUsingCustomKey(key, stringToUint8Array(text))

                    return {
                        iv: en.iv,
                        text: arrayBufferToBase64(en.ciphertext),
                    }
                },
            },

            useConnected(fn: () => Promise<void> | (() => void) | void, deps?: DependencyList) {
                useEffect(() => {
                    if (app.connection.status == 'connected') {
                        const ret = fn()

                        if (typeof ret == 'function') {
                            return ret
                        }
                    }
                }, [app.connection.status, ...deps ?? []]);
            },
        }
    }, [app]);
}
