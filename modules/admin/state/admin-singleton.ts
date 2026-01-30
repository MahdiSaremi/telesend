'use client'

import {singleton} from "@/modules/core/utils/singleton";
import {fetchData} from "@/modules/apis/utils/requests";
import {AdminUser} from "@/modules/admin/types/admin-types";

export const AdminSingleton = singleton<AdminUser>({
    using: async callback => {
        await fetchData("/v1/admin/admin", {
            method: "GET",
            onSuccess: data => {
                callback(data as (AdminUser | null))
            },
        })
    },
})
