"use client"

import * as React from "react"
import {OTPInput, OTPInputContext} from "input-otp"
import {MinusIcon} from "lucide-react"

import {cn} from "@/lib/utils"
import {InputContainer} from "@/modules/form/components/form-base";
import {FormProperty} from "@/modules/form/types/form-property";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";

export function InputOTP({className, length, codeSize = "md", onValueChange, onComplete, ...props}: {
    className?: string;
    length: number;
    codeSize?: "md" | "lg";
    onValueChange?: (value: string) => void;
    onComplete?: (value: string) => void;
} & Omit<React.ComponentProps<"input">, "value" | "onChange"> & FormProperty<string>) {
    const used = useFormProperty<string>(props, {defaultValue: ''})
    const ctx = used.property.context;

    let slots = []
    for (let i = 0; i < length; i++) {
        slots.push(<InputOTPSlot index={i} key={i} size={codeSize} className={cn(used.error && "border border-destructive")}/>)
    }

    return (
        <InputContainer used={used}>
            <InputOTPContainer
                maxLength={length}
                className={cn(
                    "w-full",
                    className,
                )}
                onChange={(newValue) => {
                    onValueChange?.(newValue)
                    used.setValue(newValue)
                }}
                onComplete={onComplete}
                value={used.value}
                disabled={used.disabled}
                {...used.releaseProps(props)}
            >
                <InputOTPGroup>
                    {slots}
                </InputOTPGroup>
            </InputOTPContainer>
        </InputContainer>
    )
}

function InputOTPContainer({className, containerClassName, ...props}: {
    containerClassName?: string;
} & React.ComponentProps<typeof OTPInput>) {
    return (
        <OTPInput
            data-slot="input-otp"
            containerClassName={cn(
                "flex items-center gap-2 has-disabled:opacity-50",
                containerClassName
            )}
            className={cn("disabled:cursor-not-allowed", className)}
            {...props}
        />
    )
}

function InputOTPGroup({className, ...props}: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="input-otp-group"
            className={cn("flex items-center w-full justify-center", className)}
            dir="ltr"
            {...props}
        />
    )
}

function InputOTPSlot({
                          index,
                          className,
                          size = "md",
                          ...props
                      }: React.ComponentProps<"div"> & {
    index: number;
    size?: "md" | "lg"
}) {
    const inputOTPContext = React.useContext(OTPInputContext)
    const {char, hasFakeCaret, isActive} = inputOTPContext?.slots[index] ?? {}

    return (
        <div
            data-slot="input-otp-slot"
            data-active={isActive}
            className={cn(
                "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex items-center justify-center border text-sm transition-all outline-none first:rounded-l-md rounded-lg data-[active=true]:z-10 data-[active=true]:ring-[3px] me-4",
                size == "md" && "size-9",
                size == "lg" && "size-12 text-lg",
                className
            )}
            {...props}
        >
            {char}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000"/>
                </div>
            )}
        </div>
    )
}

function InputOTPSeparator({...props}: React.ComponentProps<"div">) {
    return (
        <div data-slot="input-otp-separator" role="separator" {...props}>
            <MinusIcon/>
        </div>
    )
}

export {InputOTPContainer, InputOTPGroup, InputOTPSlot, InputOTPSeparator}
