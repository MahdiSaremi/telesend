'use client'

import {useFetchData} from "@/modules/apis/hooks/useFetch";

export interface Region {
    id: number;
    name: string;
    code: number;
    short_code: number;
    parent_id: number;
    province_id: number;
    county_id: number;
    sector_id: number;
    city_id: number;
    rural_district_id: number;
}

export function useProvinces(): [Region[] | null, boolean] {
    return useFetchData<Region[]>({
        path: '/v1/locations',
        method: 'GET',
        data: {
            type: 'province',
        },
    })
}

export function useCities(province_id: number | string | null | undefined): [Region[] | null, boolean] {
    return useFetchData<Region[]>({
        path: `/v1/locations`,
        method: 'GET',
        ignore: () => province_id === null || province_id === undefined || province_id === "",
        data: {
            type: 'city',
            province_id,
        },
    }, [province_id])
}
