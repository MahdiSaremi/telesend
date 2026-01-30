'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {UserSingleton} from "@/modules/auth/state/auth";
import {User} from "@/configs/apis";

export function useAuth(options?: {
    required?: boolean;
}): [User | null, boolean] {
    const [user, loading] = UserSingleton.use()
    const router = useRouter()

    useEffect(() => {
        if (options?.required && !loading && !user) {
            toast("ابتدا باید وارد شوید")
            router.push("/login")
        }
    }, [user, loading])

    return [user, loading]
}
