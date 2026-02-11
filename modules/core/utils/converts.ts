'use client'

import PersianDate from "@alireza-ab/persian-date";

export function persianDateFrom(value: string | null) {
    return value ? new PersianDate(Date.parse(value)) : null
}

export function persianDateTo(
    value: PersianDate | null | undefined,
    type: 'date' | 'datetime' | 'time' = 'datetime',
    timeType: 'hour' | 'minute' | 'second' = 'minute'
) {
    if (!value) {
        return null
    }

    const date = value.toDate()

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');

    if (type == 'date') {
        return `${year}-${month}-${day}`
    } else if (type == 'datetime') {
        if (timeType == 'hour') {
            return `${year}-${month}-${day} ${hour}`
        } else if (timeType == 'minute') {
            return `${year}-${month}-${day} ${hour}:${minute}`
        } else if (timeType == 'second') {
            return `${year}-${month}-${day} ${hour}:${minute}:${second}`
        }
    } else if (type == 'time') {
        if (timeType == 'hour') {
            return `${hour}`
        } else if (timeType == 'minute') {
            return `${hour}:${minute}`
        } else if (timeType == 'second') {
            return `${hour}:${minute}:${second}`
        }
    }
}
