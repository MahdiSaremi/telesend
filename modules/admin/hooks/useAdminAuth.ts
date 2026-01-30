'use client'

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {AdminSingleton} from "@/modules/admin/state/admin-singleton";

export function useAdminAuth() {
    const [admin, loading] = AdminSingleton.use()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !admin) {
            toast("ابتدا باید وارد شوید")
            router.push("/login")
        }
    }, [admin, loading])

    return {admin, loading}
}
