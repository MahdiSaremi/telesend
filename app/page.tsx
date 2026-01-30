'use client'
import {createContext, Fragment, useContext, useEffect, useRef, useState} from 'react'
import io, {Socket} from 'socket.io-client'
import {AuthInfo, ChatResource, UserResource} from "@/shared/resources";
import {Button} from "@/components/ui/button";
import {
    ArrowLeftIcon,
    CheckCheckIcon,
    CheckIcon, LoaderCircleIcon, LockIcon,
    MenuIcon, MicIcon,
    MoreVerticalIcon,
    SearchIcon, SendIcon,
    SmileIcon, UploadCloudIcon, XIcon
} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {AnimatePresence, LayoutGroup, motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {FaTelegram} from "react-icons/fa";
import {Input} from "@/components/ui/form/input";
import {Alert} from "@/components/bui/alert";
import {
    decryptPrivateKeyString,
    deriveKey,
    encryptPrivateKey,
    exportKey,
    generateKeyPair,
    importPrivateKey, importPublicKey
} from "@/shared/helpers";
import {ScreenContainer} from "@/app/ScreenContainer";
import {EditableBox} from "@/app/components/EditableBox";
import {Skeleton} from "@/components/ui/skeleton";
import {AppContext, PageInitial, SecurityData} from "@/app/hooks/types";
import {useOpenCall} from "@/app/hooks/useOpenCall";
import {useOnSocket} from "@/app/hooks/useOnSocket";

export default function () {
    const [unsafe, setUnsafe] = useState(false)
    const [status, setStatus] = useState<'waiting_for_network' | 'connecting' | 'connected'>('waiting_for_network')
    const [securityData, setSecurityData] = useState<SecurityData | null>(null)
    const [socket, setSocket] = useState<Socket | null>(null)
    const [socketId, setSocketId] = useState<number | null>(null)
    const [pages, setPages] = useState<PageInitial[]>([])

    const call = (name: string, message: any, {success, fail}: { success?: Function; fail?: Function }): void => {
        if (socket) {
            const disconnect = () => {
                socket.removeListener('disconnect', disconnect)
                fail?.()
            }

            socket.on('disconnect', disconnect)

            socket.emit(name, message, (ok: boolean, data: any) => {
                socket.removeListener('disconnect', disconnect);
                (ok ? success : fail)?.(data)
            })
        } else {
            fail?.()
        }
    }

    const callAsync = <T = any, E = string>(name: string, message: any): Promise<[true, T, null] | [false, null, E | null]> => {
        return new Promise((resolve, reject) => {
            if (socket) {
                const disconnect = () => {
                    socket.off('disconnect', disconnect)
                    resolve([false, null, null])
                }

                socket.on('disconnect', disconnect)

                socket.emit(name, message, (ok: boolean, data: any) => {
                    socket.off('disconnect', disconnect)
                    resolve([ok, ok ? data : null, ok ? null : data])
                })
            } else {
                resolve([false, null, null])
            }
        })
    }

    const pushPage = (layout: PageInitial['layout'], data?: any): void => {
        setPages(pages => [...pages, {layout, data}])
    }

    const popPage = (): void => {
        setPages(pages => pages.slice(0, pages.length - 1))
    }

    useEffect(() => {
        if (!window.isSecureContext || !crypto?.subtle) {
            setUnsafe(true)
        } else {
            setSocket(io())
            setSocketId(id => id == null ? 1 : id + 1)
        }
    }, [])

    useEffect(() => {
        if (!socket) return

        socket.on('connect', () => {
            if (!localStorage.getItem('username') || !localStorage.getItem('password')) {
                pushPage('login')
                return
            }

            call('login', {
                username: localStorage.getItem('username'),
                password: localStorage.getItem('password'),
            }, {
                success: async (data: AuthInfo) => {
                    if (data.public_key) {
                        try {
                            setSecurityData({
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
                            pushPage('login')
                            return
                        }

                        pushPage('home')
                    } else {
                        pushPage('login')
                    }
                },
                fail: (data: any) => {
                    if (data) {
                        pushPage('login')
                    } else {
                        // todo
                    }
                },
            })
        })

        socket.on('disconnect', () => {

        })

        socket.on('receiveMessage', (newMessage) => {
            // setMessages((prev) => [...prev, newMessage]);
        })

        return () => {
            socket.disconnect()
        }
    }, [socket])

    useEffect(() => {
        window.location.hash = pages.length.toString()
    }, [pages.length])

    useEffect(() => {
        if (pages.length <= 1) {
            return
        }

        const onPopState = (e: PopStateEvent) => {
            popPage()
        }

        const onKeyPress = (e: KeyboardEvent) => {
            if (e.key == 'Escape') {
                popPage()
                e.preventDefault()
                e.stopPropagation()
            }
        }

        window.addEventListener("popstate", onPopState)
        window.addEventListener("keydown", onKeyPress)
        return () => {
            window.removeEventListener("popstate", onPopState)
            window.removeEventListener("keydown", onKeyPress)
        }
    }, [pages.length, popPage])

    return (
        <AppContext.Provider value={{
            status,
            socket,
            socketId,
            securityData,
            setSecurityData,
            call,
            // @ts-ignore
            callAsync,
            pushPage,
            popPage,
        }}>
            {pages.length == 0 && <div className="absolute inset-0">
                <SplashPage/>
            </div>}
            {unsafe && <div className="absolute inset-0">
                <UnsafePage/>
            </div>}
            <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence>
                    {pages.map((page, i) => (
                        <motion.div
                            key={`${i}-${page.layout}`}
                            className="absolute inset-0"
                            initial={{opacity: 0, translateX: -30, scaleX: 1.05}}
                            exit={{opacity: 0, translateX: -30, scaleX: 1.05}}
                            animate={{
                                opacity: 1,
                                translateX: pages.length - 1 == i ? 0 : 30,
                                scaleX: pages.length - 1 == i ? 1 : 1.05
                            }}
                        >
                            {page.layout == 'login' && <LoginPage/>}
                            {page.layout == 'home' && <HomePage/>}
                            {page.layout == 'private_chat' && <PrivateChatPage user={page.data}/>}
                            {page.layout == 'search' && <SearchPage/>}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </AppContext.Provider>
    );
}

function SplashPage() {
    return (
        <ScreenContainer>
            <div className="h-full flex flex-col gap-4 items-center justify-center bg-primary text-white pb-8">
                <div className="w-1/2 aspect-square">
                    <FaTelegram className="size-full"/>
                </div>
                <div className="flex items-center gap-2">
                    <LoaderCircleIcon className="animate-spin"/>
                    <span>لطفا صبر کنید...</span>
                </div>
            </div>
        </ScreenContainer>
    )
}

function UnsafePage() {
    return (
        <ScreenContainer>
            <div className="h-full flex flex-col gap-4 items-center justify-center bg-rose-400 text-white pb-8">
                <div className="w-1/2 aspect-square">
                    <LockIcon className="size-full"/>
                </div>
                <div className="flex items-center gap-2">
                    <span>اتصال ایمن نیست. امکان ورود وجود ندارد.</span>
                </div>
            </div>
        </ScreenContainer>
    )
}

function LoginPage() {
    const [state, setState] = useState<'login' | 'new_password'>('login')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const app = useContext(AppContext)

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")

    const login = () => {
        setError(null)
        setLoading(true)
        app?.call('login', {
            username,
            password,
        }, {
            success: async (data: AuthInfo) => {
                setLoading(false)

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
                    app?.popPage()
                    app?.pushPage('home')
                } else {
                    setState('new_password')
                }
            },
            fail: (message: string | null) => {
                setLoading(false)
                setError(message ?? "ورود ناموفق بود. دوباره امتحان کنید.")
            },
        })
    }

    const register = async () => {
        setError(null)
        setLoading(true)

        const {publicKey, privateKey} = await generateKeyPair()

        const publicKeyStr = await exportKey(publicKey)
        const privateKeyStr = await exportKey(privateKey)

        const encrypted = await encryptPrivateKey(privateKeyStr, password)

        app?.call('login', {
            username,
            password,
            newPassword,
            publicKey: publicKeyStr,
            encryptedPrivateKey: encrypted.encryptedPrivateKey,
            iv: encrypted.iv,
            salt: encrypted.salt,
        }, {
            success: (data: AuthInfo) => {
                setLoading(false)

                if (data.public_key) {
                    localStorage.setItem('username', username)
                    localStorage.setItem('password', password)
                    app?.setSecurityData({
                        auth: data,
                        publicKey: publicKey,
                        privateKey: privateKey,
                    })
                    app?.popPage()
                    app?.pushPage('home')
                }
            },
            fail: (message: string | null) => {
                setLoading(false)
                setError(message ?? "ورود ناموفق بود. دوباره امتحان کنید.")
            },
        })
    }

    return (
        <div className="h-screen">
            <div
                className="bg-primary h-2/5 text-primary-foreground flex flex-col items-center justify-center px-2 gap-8 min-h-64">
                <FaTelegram className="size-1/2"/>
                <div className="text-xl font-bold">
                    به تلسند خوش آمدید
                </div>
            </div>
            {state == 'login' && <div className="bg-white h-3/5 flex flex-col items-center justify-center px-8 gap-4">
                <Input
                    label="نام کاربری"
                    placeholder="نام کاربری خود را وارد کنید"
                    value={username}
                    setValue={setUsername}
                />
                <Input
                    label="رمز عبور"
                    placeholder="رمز عبور خود را وارد کنید"
                    type="password"
                    value={password}
                    setValue={setPassword}
                />
                {error && <p className="text-red-500">{error}</p>}
                <Button variant="primary" className="self-end mt-8" isLoading={loading} onClick={login}>
                    تایید و ورود
                </Button>
            </div>}
            {state == 'new_password' &&
                <div className="bg-white h-3/5 flex flex-col items-center justify-center px-8 gap-4">
                    <Alert
                        title="برای افتتاح حساب خود، رمز عبور خود را تغییر دهید. توجه کنید که تنها یکبار می توانید این رمز را تنظیم کنید."
                        variant="primary"
                        className="mb-4"
                    />
                    <Input
                        label="رمز عبور جدید"
                        placeholder="رمز عبور جدید خود را وارد کنید"
                        type="password"
                        value={newPassword}
                        setValue={setNewPassword}
                    />
                    <Input
                        label="تکرار رمز عبور جدید"
                        placeholder="رمز عبور جدید خود را تکرار کنید"
                        type="password"
                        value={newPasswordConfirmation}
                        setValue={setNewPasswordConfirmation}
                    />
                    {error && <p className="text-red-500">{error}</p>}
                    <Button variant="primary" className="self-end mt-8" isLoading={loading} onClick={register}>
                        تایید و ثبت نام
                    </Button>
                </div>}
        </div>
    )
}

function HomePage() {
    const app = useContext(AppContext)

    return (
        <ScreenContainer>
            <div className="h-full flex flex-col">
                <div>
                    <div
                        className="bg-primary dark:bg-slate-700 h-16 text-primary-foreground flex items-center px-2 gap-1">
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all" onClick={() => app?.pushPage('search')}>
                            <SearchIcon className="size-6 mx-2"/>
                        </button>
                        <div className="grow text-lg">
                            <span>در حال اتصال...</span>
                            {/*<span>تلسند</span>*/}
                        </div>
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all">
                            <MenuIcon className="size-6 mx-2"/>
                        </button>
                    </div>
                </div>
                {/*<div>*/}
                {/*    <div className="bg-primary h-10 text-primary-foreground overflow-x-auto px-2 gap-1">*/}
                {/*        <div className="flex h-full gap-2">*/}
                {/*            <button*/}
                {/*                className="flex items-center relative h-full pb-1 active:bg-white/10 rounded-t-lg transition-all">*/}
                {/*        <span className="text-sm px-2">*/}
                {/*            <span className="text-xs rounded-xl px-1 py-0.5 bg-white text-primary me-1">374</span>*/}
                {/*            همه*/}
                {/*        </span>*/}
                {/*                <div className="absolute bottom-0 w-full h-0.5 bg-white"></div>*/}
                {/*            </button>*/}

                {/*            {[1, 2, 3, 4, 5].map(i => <button key={i}*/}
                {/*                                              className="flex items-center relative h-full pb-1 active:bg-white/10 rounded-t-lg transition-all">*/}
                {/*        <span className="text-sm px-2">*/}
                {/*            <span className="text-xs rounded-xl px-1 py-0.5 bg-white/70 text-primary me-1">243</span>*/}
                {/*            خصوصی*/}
                {/*        </span>*/}
                {/*            </button>)}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="overflow-y-auto grow bg-white dark:bg-slate-800 dark:text-white">
                    <div className="flex flex-col">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => <button
                            key={i}
                            className="flex items-center active:bg-black/5 dark:active:bg-white/5 transition-all"
                            onClick={() => app?.pushPage('private_chat')}
                        >
                            <img
                                src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"
                                alt=""
                                className="size-14 object-cover rounded-full"
                            />
                            <div
                                className="h-18 flex flex-col items-start justify-center ms-2 gap-1 grow border-b border-primary/5 dark:border-white/5 min-w-0">
                                <div className="h-6 flex items-center w-full gap-2">
                                    <div className="overflow-hidden grow text-start">
                                        <div>محمد احمدی</div>
                                    </div>
                                    <div>
                                        {i % 3 == 0 && <CheckCheckIcon className="size-4 text-primary"/>}
                                        {i % 3 == 1 && <CheckIcon className="size-4 text-slate-500/50"/>}
                                    </div>
                                    <div className="text-sm me-2 text-muted-foreground">23:16</div>
                                </div>
                                <div className="h-4 flex items-center w-full gap-4 min-w-0 pe-2">
                                    <div className="overflow-hidden grow text-start min-w-0">
                                        <div
                                            className="text-xs text-muted-foreground max-w-full truncate">{"سلام داداش خوبی؟".repeat(4)}</div>
                                    </div>
                                    {i % 3 == 2 && <span
                                        className="bg-primary text-primary-foreground rounded-xl px-1.5 text-sm">2</span>}
                                </div>
                            </div>
                        </button>)}
                    </div>
                </div>
            </div>
        </ScreenContainer>
    )
}

function SearchPage() {
    const app = useContext(AppContext)
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<UserResource[]>([])
    const inputRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (searchInput == '') {
            setLoading(false)
            return
        }

        setLoading(true)

        const id = setTimeout(async () => {
            const [ok, data, err] = await app!.callAsync<UserResource[]>('globalSearch', {query: searchInput})
            setLoading(false)

            if (ok) setResult(data)
        }, 1200)

        return () => clearTimeout(id)
    }, [searchInput])

    useEffect(() => {
        inputRef.current!.focus()
    }, []);

    return (
        <ScreenContainer>
            <div className="h-full flex flex-col">
                <div>
                    <div
                        className="bg-primary dark:bg-slate-700 h-16 text-primary-foreground flex items-center px-2 gap-1">
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all" onMouseDown={e => {
                            setSearchInput('')
                            e.preventDefault()
                        }}>
                            <XIcon className="size-6 mx-2"/>
                        </button>
                        <div className="grow overflow-hidden relative ms-2">
                            <EditableBox
                                inputRef={inputRef}
                                value={searchInput}
                                setValue={setSearchInput}
                                placeholder="جستجو کنید..."
                                inputClassName="truncate"
                                placeholderClassName="text-white/60"
                            />
                            {/*<div*/}
                            {/*    contentEditable*/}
                            {/*    className="truncate"*/}
                            {/*    onInput={e => setSearchInput(e.currentTarget.textContent ?? "")}*/}
                            {/*/>*/}
                            {/*{searchInput == '' && <div className="absolute top-0 h-full start-0 pointer-events-none text-slate-300">جستجو کنید...</div>}*/}
                        </div>
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all">
                            <ArrowLeftIcon className="size-6 mx-2" onClick={app?.popPage}/>
                        </button>
                    </div>
                </div>
                {/*<div>*/}
                {/*    <div className="bg-primary h-10 text-primary-foreground overflow-x-auto px-2 gap-1">*/}
                {/*        <div className="flex h-full gap-2">*/}
                {/*            <button*/}
                {/*                className="flex items-center relative h-full pb-1 active:bg-white/10 rounded-t-lg transition-all">*/}
                {/*        <span className="text-sm px-2">*/}
                {/*            <span className="text-xs rounded-xl px-1 py-0.5 bg-white text-primary me-1">374</span>*/}
                {/*            همه*/}
                {/*        </span>*/}
                {/*                <div className="absolute bottom-0 w-full h-0.5 bg-white"></div>*/}
                {/*            </button>*/}

                {/*            {[1, 2, 3, 4, 5].map(i => <button key={i}*/}
                {/*                                              className="flex items-center relative h-full pb-1 active:bg-white/10 rounded-t-lg transition-all">*/}
                {/*        <span className="text-sm px-2">*/}
                {/*            <span className="text-xs rounded-xl px-1 py-0.5 bg-white/70 text-primary me-1">243</span>*/}
                {/*            خصوصی*/}
                {/*        </span>*/}
                {/*            </button>)}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}
                <div className="overflow-y-auto grow bg-white dark:bg-slate-800 dark:text-white">
                    <div className="flex flex-col">
                        {loading && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => <div
                            key={i}
                            className="flex items-center transition-all px-2"
                        >
                            <Skeleton
                                className="size-14 object-cover rounded-full dark:bg-slate-600"
                            />
                            <div
                                className="h-18 flex flex-col items-start justify-center ms-2 gap-1 grow border-b border-primary/5 dark:border-white/5 min-w-0">
                                <div className="h-6 flex items-center w-full gap-2">
                                    <Skeleton
                                        className="h-3 w-24 dark:bg-slate-600"
                                    />
                                </div>
                                <div className="h-4 flex items-center w-full gap-4 min-w-0 pe-2">
                                    <Skeleton
                                        className="h-2 w-48 dark:bg-slate-600"
                                    />
                                </div>
                            </div>
                        </div>)}
                        {!loading && result.length == 0 && <div className="my-8 flex items-center justify-center text-muted-foreground">
                            نتیجه ای یافت نشد
                        </div>}
                        {!loading && result.map(user => <button
                            key={user.username}
                            className="flex items-center active:bg-black/5 dark:active:bg-white/5 transition-all px-2"
                            onClick={() => app?.pushPage('private_chat', user)}
                        >
                            <img
                                src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"
                                alt=""
                                className="size-14 object-cover rounded-full"
                            />
                            <div
                                className="h-18 flex flex-col items-start justify-center ms-2 gap-1 grow border-b border-primary/5 dark:border-white/5 min-w-0">
                                <div className="h-6 flex items-center w-full gap-2">
                                    <div className="overflow-hidden grow text-start">
                                        <div>{user.name}</div>
                                    </div>
                                </div>
                                <div className="h-4 flex items-center w-full gap-4 min-w-0 pe-2">
                                    <div className="overflow-hidden grow text-start min-w-0">
                                        <div
                                            className="text-xs text-muted-foreground max-w-full truncate">@{user.username}</div>
                                    </div>
                                </div>
                            </div>
                            {/*{i % 3 == 2 && <span*/}
                            {/*    className="bg-primary text-primary-foreground rounded-xl px-1.5 text-sm">2</span>}*/}
                        </button>)}
                        {/*{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => <button*/}
                        {/*    key={i}*/}
                        {/*    className="flex items-center active:bg-black/5 dark:active:bg-white/5 transition-all"*/}
                        {/*    onClick={() => app?.pushPage('private_chat')}*/}
                        {/*>*/}
                        {/*    <img*/}
                        {/*        src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"*/}
                        {/*        alt=""*/}
                        {/*        className="size-14 object-cover rounded-full"*/}
                        {/*    />*/}
                        {/*    <div*/}
                        {/*        className="h-18 flex flex-col items-start justify-center ms-2 gap-1 grow border-b border-primary/5 dark:border-white/5 min-w-0">*/}
                        {/*        <div className="h-6 flex items-center w-full gap-2">*/}
                        {/*            <div className="overflow-hidden grow text-start">*/}
                        {/*                <div>محمد احمدی</div>*/}
                        {/*            </div>*/}
                        {/*            <div>*/}
                        {/*                {i % 3 == 0 && <CheckCheckIcon className="size-4 text-primary"/>}*/}
                        {/*                {i % 3 == 1 && <CheckIcon className="size-4 text-slate-500/50"/>}*/}
                        {/*            </div>*/}
                        {/*            <div className="text-sm me-2 text-muted-foreground">23:16</div>*/}
                        {/*        </div>*/}
                        {/*        <div className="h-4 flex items-center w-full gap-4 min-w-0 pe-2">*/}
                        {/*            <div className="overflow-hidden grow text-start min-w-0">*/}
                        {/*                <div*/}
                        {/*                    className="text-xs text-muted-foreground max-w-full truncate">{"سلام داداش خوبی؟".repeat(4)}</div>*/}
                        {/*            </div>*/}
                        {/*            {i % 3 == 2 && <span*/}
                        {/*                className="bg-primary text-primary-foreground rounded-xl px-1.5 text-sm">2</span>}*/}
                        {/*        </div>*/}
                        {/*    </div>*/}
                        {/*</button>)}*/}
                    </div>
                </div>
            </div>
        </ScreenContainer>
    )
}

function PrivateChatPage({user}: {
    user: UserResource;
}) {
    const app = useContext(AppContext)
    const [typingText, setTypingText] = useState("")
    const chatContentElement = useRef<HTMLDivElement | null>(null)
    const inputElement = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!inputElement.current || !chatContentElement.current) return;

        const observer = new ResizeObserver(entries => {
            const {height} = entries[0].contentRect;
            chatContentElement.current!.style.paddingBottom = height.toString() + "px"
        });

        const {height} = inputElement.current.getBoundingClientRect();
        chatContentElement.current!.style.paddingBottom = height.toString() + "px"

        observer.observe(inputElement.current);

        return () => observer.disconnect();
    }, [inputElement, chatContentElement])

    const [chat, setChat] = useState<ChatResource | null>(null)
    useOpenCall({
        open: call => {
            call('openChat', {user_id: user.id}, {
                success: (data: ChatResource) => {
                    setChat(data)
                    console.log(data)
                },
            })
        },
        close: call => {
            call('closeChat', {id: chat?.id, user_id: user.id}, {
                success: () => {
                    setChat(null)
                },
            })
        },
    })

    const receiveUpdate = (data: any) => {
        console.log(data)
    }

    useOnSocket(`update:chats.${chat?.id}`, receiveUpdate)
    useOnSocket(`update:chats.create-with-user.${user.id}`, receiveUpdate)

    const sendMessage = async () => {
        if (typingText.trim() == '') return
        const text = typingText.trim()

        setTypingText(text)
        const [ok, data, err] = await app!.callAsync('sendMessage', {
            chat_id: chat?.id,
            user_id: user.id,
            text: text,
        })
    }

    return (
        <ScreenContainer>
            <div className="h-full flex flex-col bg-emerald-200 dark:bg-slate-800 dark:text-white relative">
                <div>
                    <div
                        className="bg-primary dark:bg-slate-700 h-16 text-primary-foreground flex items-center px-2 gap-1 min-w-0">
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all">
                            <MoreVerticalIcon className="size-6 mx-2"/>
                        </button>
                        <div className="flex flex-row-reverse grow gap-2 min-w-0">
                            <img
                                src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"
                                alt=""
                                className="size-12 object-cover rounded-full"
                            />
                            <div className="flex flex-col text-left justify-center grow min-w-0">
                                <div className="font-bold truncate max-w-full">{user.name}</div>
                                <div className="text-xs">آخرین بازدید به تازگی</div>
                            </div>
                        </div>
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all"
                                onClick={() => app?.popPage()}>
                            <ArrowLeftIcon className="size-6 mx-2"/>
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto grow"
                     ref={chatContentElement}>
                    <div className="flex flex-col py-2">
                        <PrivateChatMessage isSelf={true} isChained={true}/>
                        <PrivateChatMessage isSelf={true} isChained={false}/>
                        <PrivateChatMessage isSelf={true} isChained={false}/>
                        <PrivateChatMessage isSelf={false} isChained={true}/>
                        <PrivateChatMessage isSelf={false} isChained={false}/>
                        <PrivateChatMessage isSelf={false} isChained={false}/>
                        <PrivateChatMessage isSelf={false} isChained={false}/>
                        <PrivateChatMessage isSelf={false} isChained={false}/>
                        <PrivateChatMessage isSelf={false} isChained={false}/>
                    </div>
                </div>
                <div
                    className="absolute bottom-0 w-full bg-gradient-to-b from-white/0 to-white dark:from-slate-700/0 dark:to-slate-700"
                    ref={inputElement}>
                    <div
                        className="min-h-10 flex bg-slate-50 dark:bg-slate-800 items-end py-1 px-1 mx-2 mb-2 rounded-4xl shadow-sm shadow-slate-900/20 dark:shadow-white/20">
                        <AnimatePresence>
                            {typingText == "" && <motion.div
                                initial={{scale: 0, position: 'absolute'}}
                                exit={{scale: 0, position: 'absolute'}}
                                animate={{scale: 1, position: 'static'}}
                            >
                                <div
                                    className="rounded-full aspect-square bg-transparent active:bg-black/10 transition-all flex items-center justify-center cursor-pointer">
                                    <MicIcon className="size-6 mx-2 text-muted-foreground"/>
                                </div>
                            </motion.div>}
                        </AnimatePresence>
                        <AnimatePresence>
                            {typingText == "" && <motion.div
                                initial={{scale: 0, position: 'absolute'}}
                                exit={{scale: 0, position: 'absolute'}}
                                animate={{scale: 1, position: 'static'}}
                            >
                                <div
                                    className="rounded-full aspect-square bg-transparent active:bg-black/10 transition-all flex items-center justify-center cursor-pointer">
                                    <UploadCloudIcon className="size-6 mx-2 text-muted-foreground"/>
                                </div>
                            </motion.div>}
                        </AnimatePresence>
                        <AnimatePresence>
                            {typingText != "" && <motion.div
                                initial={{scale: 0, position: 'absolute'}}
                                exit={{scale: 0, position: 'absolute'}}
                                animate={{scale: 1, position: 'static'}}
                            >
                                <div
                                    className="rounded-full aspect-square bg-primary active:bg-primary/80 transition-all flex items-center justify-center cursor-pointer">
                                    <SendIcon className="size-6 mx-2 text-muted -translate-x-[1px] translate-y-[1px]"/>
                                </div>
                            </motion.div>}
                        </AnimatePresence>
                        <div className="grow overflow-y-auto min-w-0 max-h-48">
                            <div
                                contentEditable
                                className="min-w-0 focus:outline-none! min-h-10 h-auto p-2"
                                onInput={e => {
                                    setTypingText(e.currentTarget.textContent ?? '')
                                }}
                            ></div>
                        </div>
                        <div
                            className="rounded-full aspect-square bg-transparent active:bg-black/10 transition-all flex items-center justify-center cursor-pointer">
                            <SmileIcon className="size-6 mx-2 text-muted-foreground"/>
                        </div>
                    </div>
                </div>
            </div>
        </ScreenContainer>
    )
}

function PrivateChatMessage({isSelf, isChained}: {
    isSelf: boolean;
    isChained: boolean;
}) {
    return (
        <div className={cn("px-2 flex", isSelf ? "justify-start" : "justify-end", isChained ? "mb-0.5" : "mb-1.5")}>
            <div className={cn(
                "w-max max-w-3/4 px-2 py-2 rounded-xl shadow relative",
                !isChained ? (isSelf ? "rounded-br-none" : "rounded-bl-none") : (isSelf ? "rounded-br-sm" : "rounded-bl-sm"),
                isSelf ? "bg-sky-100 text-slate-800 dark:bg-sky-600 dark:text-white" : "bg-white text-slate-800 dark:bg-slate-700 dark:text-white",
            )}>
                <div
                    className={cn(
                        "flex flex-col relative min-w-0 px-2 py-1 rounded-md gap-1 overflow-hidden mb-1 select-none transition-all",
                        isSelf ? "bg-primary/10 active:bg-primary/20 dark:bg-white/10 dark:active:bg-white/20" : "bg-primary/10 active:bg-primary/20",
                    )}>
                    <p className={cn(
                        "text-xs text-primary",
                        isSelf ? "dark:text-white" : "",
                    )}>محمد احمدی</p>
                    <p className="text-xs truncate text-slate-500 dark:text-slate-300">سلام خوبی راستش میخواستم یه چیزیو
                        بهت بگم... نمیدونم
                        از کجا باید شروع کنم حقیقتا</p>
                    <div className={cn(
                        "absolute left-0 top-0 h-full w-[3px]",
                        isSelf ? "bg-primary dark:bg-white" : "bg-primary",
                    )}/>
                </div>

                <div className={cn(
                    "flex flex-wrap flex-row-reverse gap-x-2",
                )}>
                    <div
                        className="text-wrap wrap-anywhere whitespace-break-spaces self-start me-auto">{isChained ? "سلام خوبی؟\nحقیقتش می خواستم یه چیزیو میخواستم بگم..." : "سلام خوبی؟"}</div>
                    <div
                        className="self-end justify-self-end flex flex-row-reverse flex-wrap gap-1 items-end me-auto grow">
                        <div className="ms-auto flex flex-wrap gap-2 ps-1">
                            <button
                                className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">
                                <img
                                    className="size-4 rounded-full scale-120 me-1 pointer-events-none"
                                    src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"
                                    alt=""
                                />
                                🥰
                            </button>
                            <button
                                className="bg-primary flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">
                                <div className="me-1 flex">
                                    <img
                                        className="size-4 rounded-full scale-120 pointer-events-none"
                                        src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"
                                        alt=""
                                    />
                                    <img
                                        className="size-4 rounded-full scale-120 -ms-1 pointer-events-none"
                                        src="https://statics.basalam.com/public-132/users/nABPwW/09-23/42fXAIaVjk8SAKbGczwG7f6F6Zuc76nXeLmUyFiF67drkNCYWp.jpg_800X800X70.jpg"
                                        alt=""
                                    />
                                </div>
                                🥰
                            </button>
                            {/*<button className="bg-primary/80 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                            {/*    <div className="me-1 flex">*/}
                            {/*        <img*/}
                            {/*            className="size-4 rounded-full scale-120"*/}
                            {/*            src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"*/}
                            {/*            alt=""*/}
                            {/*        />*/}
                            {/*        <img*/}
                            {/*            className="size-4 rounded-full scale-120 -ms-1"*/}
                            {/*            src="https://statics.basalam.com/public-132/users/nABPwW/09-23/42fXAIaVjk8SAKbGczwG7f6F6Zuc76nXeLmUyFiF67drkNCYWp.jpg_800X800X70.jpg"*/}
                            {/*            alt=""*/}
                            {/*        />*/}
                            {/*        <img*/}
                            {/*            className="size-4 rounded-full scale-120 -ms-1"*/}
                            {/*            src="https://statics.basalam.com/public-132/users/nABPwW/09-23/42fXAIaVjk8SAKbGczwG7f6F6Zuc76nXeLmUyFiF67drkNCYWp.jpg_800X800X70.jpg"*/}
                            {/*            alt=""*/}
                            {/*        />*/}
                            {/*    </div>*/}
                            {/*    🥰*/}
                            {/*</button>*/}
                            {/*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                            {/*    <span className="text-xs me-1 text-primary">352</span>*/}
                            {/*    ♥️*/}
                            {/*</button>*/}
                            {/*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                            {/*    <span className="text-xs me-1 text-primary">25</span>*/}
                            {/*    😁*/}
                            {/*</button>*/}
                            {/*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                            {/*    <span className="text-xs me-1 text-primary">2.4K</span>*/}
                            {/*    😂*/}
                            {/*</button>*/}
                            {/*<button className="bg-primary flex items-center justify-center px-1.5 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                            {/*    <span className="text-xs me-1 text-white">9.1K</span>*/}
                            {/*    😂*/}
                            {/*</button>*/}
                            {/*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                            {/*    <span className="text-xs me-1 text-primary">12</span>*/}
                            {/*    😂*/}
                            {/*</button>*/}
                        </div>
                        <div className="flex items-end gap-1 self-end me-auto select-none">
                            {isSelf && <span className="text-[0.6rem] opacity-80 w-max">
                                {isChained ? <CheckCheckIcon className="size-3.5 text-primary"/> :
                                    <CheckIcon className="size-3.5 text-slate-500/50"/>}
                            </span>}
                            <span className="text-[0.6rem] opacity-80 w-max">ویرایش شده</span>
                            <span className="text-xs opacity-80">18:32</span>
                        </div>
                    </div>
                </div>

                <div className={cn(
                    "absolute size-0 border-t-6 border-t-transparent",
                    !isChained && (isSelf ? "border-l-6 border-l-sky-100 dark:border-l-sky-600 -right-1.5 bottom-0" : "border-r-6 border-r-white dark:border-r-slate-700 -left-1.5 bottom-0"),
                )}></div>
            </div>
        </div>
    )
}