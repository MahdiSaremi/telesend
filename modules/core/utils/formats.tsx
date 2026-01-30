export function formatPhoneNumber(phone: string) {
    if (phone.length == 10) {
        phone = '0' + phone;
    }

    return phone
}

export function formatRial(value: number) {
    return value.toLocaleString('fa-IR') + " ریال"
}

export function formatToman(value: number, convert: boolean = false) {
    return (convert ? Math.round(value / 10) : value).toLocaleString('fa-IR') + " تومان"
}

export function faDate(d: string | Date | null | undefined) {
    if (!d) {
        return null
    }

    if (typeof d === 'string') {
        d = new Date(d)
    }

    return Intl.DateTimeFormat('fa-IR').format(d)
}

export function faDateTime(d: string | Date | null | undefined) {
    if (!d) {
        return null
    }

    if (typeof d === 'string') {
        d = new Date(d)
    }

    return Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(d)
}

export function formatCardNumber(number: string | null): string | null {
    if (!number) {
        return null
    }

    const cleaned = number.replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function splitCardNumberSegments(number: string | null): string[] | null {
    if (!number) {
        return null
    }

    const cleaned = number.replace(/\D/g, '');
    return cleaned.match(/.{1,4}/g) || [];
}

export function formatEmpty<T>(value: T) {
    if (typeof value == 'string') {
        if (value.length > 0) {
            return value
        }
    } else if (value) {
        return value
    }

    return <span className="text-xs text-slate-500/40">-</span>;
}

export function formatStringNumber(value: string | number) {
    if (typeof value == 'number') {
        value = "" + value
    }

    value = value.replaceAll(/[^0-9.]/g, '').replaceAll(/\.(.*\.)+/g, '.')

    let [digits, decimals]: [string, string | null] = value.includes('.') ? value.split('.') as [string, string] : [value, null]

    digits = [...digits].map((d, i) => (i > 0 && (digits.length - i) % 3 == 0 ? ',' : '') + d).join('')

    // if (decimals !== null) {
    //     decimals = [...decimals].map((d, i) => (i > 0 && i % 3 == 0 ? ',' : '') + d).join('')
    // }

    return digits + (decimals === null ? '' : '.' + decimals)
}
