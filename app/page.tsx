'use client'
import {createContext, Fragment, useContext, useEffect, useLayoutEffect, useRef, useState} from 'react'
import io, {Socket} from 'socket.io-client'
import {AuthInfo, ChatResource, HomeChatResource, MessageResource, UserResource} from "@/shared/resources";
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
    arrayBufferToBase64,
    base64ToArrayBuffer,
    decryptPrivateKeyString, decryptUsingCustomKey, decryptUsingPrivateKey,
    deriveKey,
    encryptPrivateKey, encryptUsingCustomKey,
    exportKey,
    generateKeyPair,
    importPrivateKey, importPublicKey, stringToUint8Array, uint8ArrayToString
} from "@/shared/helpers";
import {ScreenContainer} from "@/components/ScreenContainer";
import {EditableBox} from "@/components/EditableBox";
import {Skeleton} from "@/components/ui/skeleton";
import {AppContext, PageInitial, SecurityData} from "@/hooks/types";
import {useOpenCall} from "@/hooks/useOpenCall";
import {useOnSocket} from "@/hooks/useOnSocket";
import {useConnection} from "@/hooks/useConnection";
import {useCore} from "@/hooks/useCore";
import {useChatKeys} from "@/hooks/useChatKeys";

type DecryptedMessage = {
    decrypted_text: string | null;
}

export default function () {
    const [unsafe, setUnsafe] = useState(false)
    const [securityData, setSecurityData] = useState<SecurityData | null>(null)
    const [pages, setPages] = useState<PageInitial[]>([])

    const connection = useConnection()

    useEffect(() => {
        if (!window.isSecureContext || !crypto?.subtle) {
            setUnsafe(true)
        }
    }, [])

    const pushPage = (layout: PageInitial['layout'], data?: any): void => {
        setPages(pages => [...pages, {layout, data}])
    }

    const popPage = (): void => {
        setPages(pages => pages.slice(0, pages.length - 1))
    }

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
            connection,
            securityData,
            setSecurityData,
            pages,
            pushPage,
            popPage,
        }}>
            <Root/>
            {unsafe && <div className="absolute inset-0">
                <UnsafePage/>
            </div>}
        </AppContext.Provider>
    );
}

function Root() {
    const core = useCore()

    useEffect(() => {
        if (core.connection.status == 'logging') {
            core.auth.loginUsingStorage().then(ok => {
                if (ok && core.app.pages.length == 0) {
                    core.app.pushPage('home')
                } else if (!ok) {
                    core.app.pushPage('login')
                }
            })
        }
    }, [core.connection.status])

    return (
        <>
            {core.app.pages.length == 0 && <div className="absolute inset-0">
                <SplashPage/>
            </div>}
            <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence>
                    {core.app.pages.map((page, i) => (
                        <motion.div
                            key={`${i}-${page.layout}`}
                            className="absolute inset-0"
                            initial={{opacity: 0, translateX: -30, scaleX: 1.05}}
                            exit={{opacity: 0, translateX: -30, scaleX: 1.05}}
                            animate={{
                                opacity: 1,
                                translateX: core.app.pages.length - 1 == i ? 0 : 30,
                                scaleX: core.app.pages.length - 1 == i ? 1 : 1.05
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
        </>
    )
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
    const core = useCore()
    const [state, setState] = useState<'login' | 'new_password'>('login')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("")

    const login = async () => {
        setError(null)
        setLoading(true)

        const [ok, msg] = await core.auth.login({username, password})

        setLoading(false)

        if (ok) {
            if (msg == 'done') {
                core.app.popPage()
                core.app.pushPage('home')
            } else {
                setState('new_password')
            }
        } else {
            setError(msg)
        }
    }

    const register = async () => {
        if (newPassword != newPasswordConfirmation) {
            setError("تکرار رمز عبور صحیح نیست")
            return
        }

        setError(null)
        setLoading(true)

        const [ok, msg] = await core.auth.register({username, password, newPassword})

        setLoading(false)

        if (ok) {
            core.app.popPage()
            core.app.pushPage('home')
        } else {
            setError(msg)
        }
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
    const core = useCore()
    const [loading, setLoading] = useState(true)
    const [chats, setChats] = useState<(HomeChatResource & DecryptedMessage)[]>([])

    core.useConnected(async () => {
        const [ok, data, err] = await core.connection.call<HomeChatResource[]>('getHome', {}, {
            queue: true,
        })
        setLoading(false)

        if (ok) {
            setChats(await Promise.all(data.map(async chat => {
                const decrypted_text = chat.encrypted_key
                    ? await core.encryption.decryptMessage(await core.encryption.decryptChatKey(chat.encrypted_key), chat.text!, chat.iv!)
                    : null

                return {
                    ...chat,
                    decrypted_text,
                }
            })))
        }
    })

    return (
        <ScreenContainer>
            <div className="h-full flex flex-col">
                <div>
                    <div
                        className="bg-primary dark:bg-slate-700 h-16 text-primary-foreground flex items-center px-2 gap-1">
                        <button className="rounded-full aspect-square bg-transparent active:bg-white/10 transition-all" onClick={() => core.app.pushPage('search')}>
                            <SearchIcon className="size-6 mx-2"/>
                        </button>
                        <div className="grow text-lg">
                            {core.connection.status == 'connecting' && "در حال اتصال..."}
                            {core.connection.status == 'logging' && "در حال ورود..."}
                            {core.connection.status == 'connected' && (loading ? "در حال بروزرسانی..." : "تلسند")}
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
                        {loading && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(i => <div
                            key={i}
                            className="flex items-center transition-all ps-2"
                        >
                            <Skeleton
                                className="size-14 object-cover rounded-full dark:bg-slate-500"
                            />
                            <div
                                className="h-18 flex flex-col items-start justify-center ms-2 gap-1 grow border-b border-primary/5 dark:border-white/5 min-w-0">
                                <div className="h-6 flex items-center w-full gap-2">
                                    <Skeleton
                                        className="w-24 h-3 dark:bg-slate-500"
                                    />
                                </div>
                                <div className="h-4 flex items-center w-full gap-4 min-w-0 pe-2">
                                    <Skeleton
                                        className="w-48 h-2 dark:bg-slate-500"
                                    />
                                </div>
                            </div>
                        </div>)}
                        {!loading && chats.map(chat => <button
                            key={chat.id}
                            className="flex items-center active:bg-black/5 dark:active:bg-white/5 transition-all ps-2"
                            onClick={() => core.app.pushPage('private_chat', chat.user)}
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
                                        <div>{chat.title}</div>
                                    </div>
                                    <div>
                                        {/*{i % 3 == 0 && <CheckCheckIcon className="size-4 text-primary"/>}*/}
                                        {/*{i % 3 == 1 && <CheckIcon className="size-4 text-slate-500/50"/>}*/}
                                    </div>
                                    <div className="text-sm me-2 text-muted-foreground">23:16</div>
                                </div>
                                <div className="h-4 flex items-center w-full gap-4 min-w-0 pe-2">
                                    <div className="overflow-hidden grow text-start min-w-0">
                                        <div
                                            className="text-xs text-muted-foreground max-w-full truncate">{chat.decrypted_text}</div>
                                    </div>
                                    {/*{i % 3 == 2 && <span*/}
                                    {/*    className="bg-primary text-primary-foreground rounded-xl px-1.5 text-sm">2</span>}*/}
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
    const core = useCore()
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
            const [ok, data, err] = await core.connection.call<UserResource[]>('globalSearch', {query: searchInput})
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
                            <ArrowLeftIcon className="size-6 mx-2" onClick={core.app.popPage}/>
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
                            onClick={() => core.app.pushPage('private_chat', user)}
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
    const core = useCore()
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
    const [messages, setMessages] = useState<(MessageResource & DecryptedMessage)[]>([])

    useOpenCall({
        open: call => {
            call('openChat', {user_id: user.id}, {
                success: async (data: ChatResource | null) => {
                    if (data) {
                        setChat(data)
                        await keys.addEncrypted(data!.version, data!.encrypted_chat_key)
                        currentKeyVersion.current = data!.version

                        await core.connection.call<MessageResource[]>('getChatMessages', {chat_id: data.id}).then(async ([ok, data, err]) => {
                            if (ok) {
                                const newMessages = (await Promise.all(data!.map(async message => {
                                    const key = await keys.get(message.chat_key_version)

                                    if (!key) {
                                        return null
                                    }

                                    return {
                                        ...message,
                                        decrypted_text: await core.encryption.decryptMessage(key, message.text, message.iv),
                                    } satisfies MessageResource & DecryptedMessage
                                }))).filter(v => v !== null)

                                setMessages(messages => [...messages, ...newMessages])
                                scrollToEndInNextRender(true)
                            }
                        })
                    }
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

    const keys = useChatKeys(chat?.id)
    const currentKeyVersion = useRef<string | null>(null)

    const receiveUpdate = async (data: any) => {
        console.log(data)

        const key = await keys.get(currentKeyVersion.current!)

        if (key) {
            const newMessage = {
                ...data,
                decrypted_text: await core.encryption.decryptMessage(key, data.text, data.iv),
            } satisfies MessageResource & DecryptedMessage

            setMessages(messages => [...messages, newMessage])

            if (scrollIsEnd()) {
                scrollToEndInNextRender()
            }
        }
    }

    useOnSocket(`update:chats.${chat?.id}`, receiveUpdate)
    useOnSocket(`update:chats.create-with-user.${user.id}`, receiveUpdate)

    const sendMessage = async () => {
        if (typingText.trim() == '') return
        const text = typingText.trim()
        let chatId = chat?.id

        setTypingText('')

        if (!currentKeyVersion.current) {
            const [ok, data, err] = await core.connection.call<ChatResource>('createPrivateChat', {user_id: user.id}, {
                queue: true,
            })

            if (ok) {
                chatId = data!.id
                setChat(data)
                await keys.addEncrypted(data!.version, data!.encrypted_chat_key)
                currentKeyVersion.current = data!.version
            } else {
                return
            }
        }

        const key = await keys.get(currentKeyVersion.current)

        if (key) {
            const encrypted = await core.encryption.encryptMessage(key, text)

            const [ok, data, err] = await core.connection.call('sendMessage', {
                chat_id: chatId,
                version: currentKeyVersion.current,
                text: encrypted.text,
                iv: encrypted.iv,
            })

            if (ok) {
                const newMessage = {
                    ...data,
                    decrypted_text: text,
                } satisfies MessageResource & DecryptedMessage

                setMessages(messages => [...messages, newMessage])

                if (scrollIsEnd()) {
                    scrollToEndInNextRender()
                }
            }
        }
    }

    const shouldScrollToEndInNextRender = useRef<null | {instant: boolean}>(null)

    const scrollToEnd = (instant: boolean = false) => {
        if (!chatContentElement.current) return

        chatContentElement.current.scrollTo({
            top: chatContentElement.current.scrollHeight - chatContentElement.current.clientHeight,
            behavior: instant ? "instant" : "smooth",
        })
    }

    const scrollIsEnd = (): boolean => {
        if (!chatContentElement.current) return false

        return chatContentElement.current.scrollHeight - chatContentElement.current.clientHeight - chatContentElement.current.scrollTop < 30
    }

    const scrollToEndInNextRender = (instant: boolean = false) => {
        shouldScrollToEndInNextRender.current = {instant}
    }

    useLayoutEffect(() => {
        if (shouldScrollToEndInNextRender.current) {
            scrollToEnd(shouldScrollToEndInNextRender.current.instant)
            shouldScrollToEndInNextRender.current = null
        }
    })

    return (
        <ScreenContainer
            resizeUsing={def => {
                const end = scrollIsEnd()
                def()

                if (end) {
                    scrollToEnd()
                }
            }}
        >
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
                                onClick={() => core.app.popPage()}>
                            <ArrowLeftIcon className="size-6 mx-2"/>
                        </button>
                    </div>
                </div>
                <div className="overflow-y-auto grow"
                     ref={chatContentElement}>
                    <div className="flex flex-col py-2">
                        {messages.map((message, i) => (
                            <PrivateChatMessage
                                key={message.id}
                                message={message}
                                isChained={false} // todo
                            />
                        ))}
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
                                onMouseDown={e => {
                                    e.preventDefault()
                                    sendMessage()
                                }}
                            >
                                <div
                                    className="rounded-full aspect-square bg-primary active:bg-primary/80 transition-all flex items-center justify-center cursor-pointer">
                                    <SendIcon className="size-6 mx-2 text-muted -translate-x-[1px] translate-y-[1px]"/>
                                </div>
                            </motion.div>}
                        </AnimatePresence>
                        <div className="grow overflow-y-auto min-w-0 max-h-48">
                            <EditableBox
                                value={typingText}
                                setValue={setTypingText}
                                inputClassName="min-w-0 focus:outline-none! min-h-10 h-auto p-2"
                                onKeyDown={e => {
                                    if (e.key == 'Enter' && e.ctrlKey) {
                                        e.preventDefault()
                                        sendMessage()
                                    }
                                }}
                            />
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

function PrivateChatMessage({message, isChained}: {
    message: MessageResource & DecryptedMessage;
    isChained: boolean;
}) {
    const core = useCore()
    const isSelf = message.sender_id == core.app.securityData?.auth.id

    return (
        <div className={cn("px-2 flex", isSelf ? "justify-start" : "justify-end", isChained ? "mb-0.5" : "mb-1.5")}>
            <div className={cn(
                "w-max max-w-3/4 px-2 py-2 rounded-xl shadow relative",
                !isChained ? (isSelf ? "rounded-br-none" : "rounded-bl-none") : (isSelf ? "rounded-br-sm" : "rounded-bl-sm"),
                isSelf ? "bg-sky-100 text-slate-800 dark:bg-sky-600 dark:text-white" : "bg-white text-slate-800 dark:bg-slate-700 dark:text-white",
            )}>
                {/*<div*/}
                {/*    className={cn(*/}
                {/*        "flex flex-col relative min-w-0 px-2 py-1 rounded-md gap-1 overflow-hidden mb-1 select-none transition-all",*/}
                {/*        isSelf ? "bg-primary/10 active:bg-primary/20 dark:bg-white/10 dark:active:bg-white/20" : "bg-primary/10 active:bg-primary/20",*/}
                {/*    )}>*/}
                {/*    <p className={cn(*/}
                {/*        "text-xs text-primary",*/}
                {/*        isSelf ? "dark:text-white" : "",*/}
                {/*    )}>محمد احمدی</p>*/}
                {/*    <p className="text-xs truncate text-slate-500 dark:text-slate-300">سلام خوبی راستش میخواستم یه چیزیو*/}
                {/*        بهت بگم... نمیدونم*/}
                {/*        از کجا باید شروع کنم حقیقتا</p>*/}
                {/*    <div className={cn(*/}
                {/*        "absolute left-0 top-0 h-full w-[3px]",*/}
                {/*        isSelf ? "bg-primary dark:bg-white" : "bg-primary",*/}
                {/*    )}/>*/}
                {/*</div>*/}

                <div className={cn(
                    "flex flex-wrap flex-row-reverse gap-x-2",
                )}>
                    <div className="text-wrap wrap-anywhere whitespace-break-spaces self-start me-auto">
                        {message.decrypted_text}
                    </div>
                    <div
                        className="self-end justify-self-end flex flex-row-reverse flex-wrap gap-1 items-end me-auto grow">
                        {/*<div className="ms-auto flex flex-wrap gap-2 ps-1">*/}
                        {/*    <button*/}
                        {/*        className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                        {/*        <img*/}
                        {/*            className="size-4 rounded-full scale-120 me-1 pointer-events-none"*/}
                        {/*            src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"*/}
                        {/*            alt=""*/}
                        {/*        />*/}
                        {/*        🥰*/}
                        {/*    </button>*/}
                        {/*    <button*/}
                        {/*        className="bg-primary flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*/}
                        {/*        <div className="me-1 flex">*/}
                        {/*            <img*/}
                        {/*                className="size-4 rounded-full scale-120 pointer-events-none"*/}
                        {/*                src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"*/}
                        {/*                alt=""*/}
                        {/*            />*/}
                        {/*            <img*/}
                        {/*                className="size-4 rounded-full scale-120 -ms-1 pointer-events-none"*/}
                        {/*                src="https://statics.basalam.com/public-132/users/nABPwW/09-23/42fXAIaVjk8SAKbGczwG7f6F6Zuc76nXeLmUyFiF67drkNCYWp.jpg_800X800X70.jpg"*/}
                        {/*                alt=""*/}
                        {/*            />*/}
                        {/*        </div>*/}
                        {/*        🥰*/}
                        {/*    </button>*/}
                        {/*    /!*<button className="bg-primary/80 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*!/*/}
                        {/*    /!*    <div className="me-1 flex">*!/*/}
                        {/*    /!*        <img*!/*/}
                        {/*    /!*            className="size-4 rounded-full scale-120"*!/*/}
                        {/*    /!*            src="https://statics.basalam.com/public-131/users/nABPwW/09-22/iuyJAf1hslqamF7rlnz2al0M3HJmuFOllWosEyjcCBiruDsvCe.jpg_800X800X70.jpg"*!/*/}
                        {/*    /!*            alt=""*!/*/}
                        {/*    /!*        />*!/*/}
                        {/*    /!*        <img*!/*/}
                        {/*    /!*            className="size-4 rounded-full scale-120 -ms-1"*!/*/}
                        {/*    /!*            src="https://statics.basalam.com/public-132/users/nABPwW/09-23/42fXAIaVjk8SAKbGczwG7f6F6Zuc76nXeLmUyFiF67drkNCYWp.jpg_800X800X70.jpg"*!/*/}
                        {/*    /!*            alt=""*!/*/}
                        {/*    /!*        />*!/*/}
                        {/*    /!*        <img*!/*/}
                        {/*    /!*            className="size-4 rounded-full scale-120 -ms-1"*!/*/}
                        {/*    /!*            src="https://statics.basalam.com/public-132/users/nABPwW/09-23/42fXAIaVjk8SAKbGczwG7f6F6Zuc76nXeLmUyFiF67drkNCYWp.jpg_800X800X70.jpg"*!/*/}
                        {/*    /!*            alt=""*!/*/}
                        {/*    /!*        />*!/*/}
                        {/*    /!*    </div>*!/*/}
                        {/*    /!*    🥰*!/*/}
                        {/*    /!*</button>*!/*/}
                        {/*    /!*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*!/*/}
                        {/*    /!*    <span className="text-xs me-1 text-primary">352</span>*!/*/}
                        {/*    /!*    ♥️*!/*/}
                        {/*    /!*</button>*!/*/}
                        {/*    /!*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*!/*/}
                        {/*    /!*    <span className="text-xs me-1 text-primary">25</span>*!/*/}
                        {/*    /!*    😁*!/*/}
                        {/*    /!*</button>*!/*/}
                        {/*    /!*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*!/*/}
                        {/*    /!*    <span className="text-xs me-1 text-primary">2.4K</span>*!/*/}
                        {/*    /!*    😂*!/*/}
                        {/*    /!*</button>*!/*/}
                        {/*    /!*<button className="bg-primary flex items-center justify-center px-1.5 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*!/*/}
                        {/*    /!*    <span className="text-xs me-1 text-white">9.1K</span>*!/*/}
                        {/*    /!*    😂*!/*/}
                        {/*    /!*</button>*!/*/}
                        {/*    /!*<button className="bg-primary/20 flex items-center justify-center px-1 py-0.5 rounded-xl text-sm active:bg-primary/40 transition-all">*!/*/}
                        {/*    /!*    <span className="text-xs me-1 text-primary">12</span>*!/*/}
                        {/*    /!*    😂*!/*/}
                        {/*    /!*</button>*!/*/}
                        {/*</div>*/}
                        <div className="flex items-end gap-1 self-end me-auto select-none">
                            {isSelf && <span className="text-[0.6rem] opacity-80 w-max">
                                {isChained ? <CheckCheckIcon className="size-3.5 text-primary"/> :
                                    <CheckIcon className="size-3.5 text-slate-500/50 dark:text-white/50"/>}
                            </span>}
                            {/*<span className="text-[0.6rem] opacity-80 w-max">ویرایش شده</span>*/}
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