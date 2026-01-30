"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import {CheckIcon} from "lucide-react"
import {cn} from "@/lib/utils"
import {FormProperty} from "@/modules/form/types/form-property";
import {InputContainer} from "@/modules/form/components/form-base";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";

function Checkbox({className, placeholder, icon, iconEnd, ...props}: {
    className?: string;
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    placeholder?: string | React.ReactNode;
} & Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "value"> & FormProperty<boolean>) {
    const used = useFormProperty<boolean>(props, {defaultValue: false})

    return (
        <InputContainer used={used} grid="row-reverse">
            <CheckboxPrimitive.Root
                data-slot="checkbox"
                className={cn(
                    "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-40",
                    className,
                )}
                disabled={used.disabled}
                checked={used.value}
                onCheckedChange={checked => used.setValue(!!checked)}
                {...used.releaseProps(props)}
            >
                <CheckboxPrimitive.Indicator
                    data-slot="checkbox-indicator"
                    className="flex items-center justify-center text-current transition-none"
                >
                    <CheckIcon className="size-3.5"/>
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
        </InputContainer>
    )
}

export {Checkbox}
