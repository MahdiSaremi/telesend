'use client'

import * as React from "react"
import {cn} from "@/lib/utils"
import {FormProperty} from "@/modules/form/types/form-property";
import {InputContainer} from "@/modules/form/components/form-base";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";
import {useEffect, useRef, useState} from "react";

export function Textarea({className, inputClassName, placeholder, icon: Icon, iconEnd: IconEnd, ...props}: {
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    className?: string;
    inputClassName?: string;
    placeholder?: string;
} & FormProperty<string>) {
    const used = useFormProperty<string>(props, {defaultValue: ""})
    const input = useRef<HTMLDivElement | null>(null);
    const [inputValue, setInputValue] = useState<string>("")

    useEffect(() => {
        if (used.value != inputValue) {
            setInputValue(used.value)

            if (input.current) {
                input.current.textContent = used.value
            }
        }
    }, [used.value])

    return (
        <InputContainer used={used}>
            <div
                className={cn(
                    "dark:bg-input/30 border-input flex h-max w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color] md:text-sm",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    used.error && "ring-destructive/20 dark:ring-destructive/40 border-destructive",
                    used.disabled && "opacity-40",
                    "relative overflow-auto",
                    className,
                )}
            >
                <div
                    ref={input}
                    contentEditable="plaintext-only"
                    data-slot="input"
                    className={cn(
                        "whitespace-break-spaces min-h-16 h-max max-h-44 py-1",
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "w-full focus:outline-none! focus-visible:outline-none!",
                        "[appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0",
                        used.disabled && "pointer-events-none cursor-not-allowed opacity-50",
                        inputClassName,
                    )}
                    onInput={e => {
                        const newValue = e.currentTarget.textContent ?? ''

                        setInputValue(newValue)
                        used.setValue(newValue)
                    }}
                    {...used.releaseProps(props)}
                ></div>

                {placeholder && used.value == '' && <div className="absolute inset-0 text-slate-500 my-2 mx-3 pointer-events-none overflow-hidden">{placeholder}</div>}
            </div>
        </InputContainer>
    )
}
