'use client'

import {MediaFile} from "@/modules/media-file/types/media-types";

export type AdminUser = {
    id: number;
    first_name: string;
    last_name: string;
    position: string;
    avatar: MediaFile | null;
}
