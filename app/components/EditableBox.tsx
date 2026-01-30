'use client'

import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

export function EditableBox({value, setValue, placeholder, className, inputClassName, placeholderClassName, inputRef, ...props}: {
    value: string;
    setValue: (value: string) => void;
    placeholder?: string;
    inputClassName?: string;
    placeholderClassName?: string;
    inputRef?: React.RefObject<HTMLDivElement | null>;
} & React.ComponentProps<"div">) {
    const input = useRef<HTMLDivElement | null>(null)
    const [inputValue, setInputValue] = useState<string>("")

    useEffect(() => {
        if (value != inputValue) {
            setInputValue(value)

            if (input.current) {
                input.current.textContent = value
            }
        }
    }, [value])

    return (
        <div
            className={cn(
                "relative overflow-auto",
                className,
            )}
            {...props}
        >
            <div
                ref={v => {
                    input.current = v;
                    if (inputRef) inputRef.current = v;
                }}
                contentEditable="plaintext-only"
                data-slot="input"
                className={cn(
                    // "whitespace-break-spaces min-h-16 h-max max-h-44 py-1",
                    // "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
                    // "w-full focus:outline-none! focus-visible:outline-none!",
                    // "[appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0",
                    // used.disabled && "pointer-events-none cursor-not-allowed opacity-50",
                    "focus:outline-none",
                    inputClassName,
                )}
                onInput={e => {
                    const newValue = e.currentTarget.textContent ?? ''

                    setInputValue(newValue)
                    setValue(newValue)
                }}
            />

            {placeholder && value == '' && <div
                className={cn("absolute inset-0 text-slate-500 pointer-events-none overflow-hidden", placeholderClassName)}>{placeholder}</div>}
        </div>
    )
}
