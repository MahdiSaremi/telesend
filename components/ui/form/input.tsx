import * as React from "react"
import {cn} from "@/lib/utils"
import {FormProperty} from "@/modules/form/types/form-property";
import {InputContainer} from "@/modules/form/components/form-base";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";

export function Input({className, inputClassName, type, icon: Icon, iconEnd: IconEnd, prefix, suffix, displayValue, unformatValue, ...props}: {
    icon?: React.ElementType;
    iconEnd?: React.ElementType;
    inputClassName?: string;
    prefix?: string | React.ReactNode;
    suffix?: string | React.ReactNode;
    displayValue?: string | ((value: string) => string);
    unformatValue?: string | ((value: string) => string);
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "defaultValue" | "name"> & FormProperty<string>) {
    const used = useFormProperty<string>(props, {defaultValue: ""})

    return (
        <InputContainer used={used}>
            <div
                className={cn(
                    "dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base transition-[color] md:text-sm",
                    "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
                    used.error && "ring-destructive/20 dark:ring-destructive/40 border-destructive",
                    "flex items-center gap-2",
                    "has-[:disabled]:opacity-40",
                    className,
                )}
            >
                {Icon && <Icon size={16} className="text-muted-foreground"/>}
                {typeof prefix == 'string' ? <div className="border-e pe-2 text-muted-foreground">
                    {prefix}
                </div> : prefix}
                <div className="grow overflow-hidden">
                    <input
                        type={type}
                        data-slot="input"
                        className={cn(
                            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                            "w-full focus:outline-none! focus-visible:outline-none!",
                            "[appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0",
                            inputClassName
                        )}
                        value={typeof displayValue === 'function' ? displayValue(used.value) : (displayValue ?? used.value ?? '')}
                        onChange={e => used.setValue(typeof unformatValue === 'function' ? unformatValue(e.target.value) : unformatValue ?? e.target.value)}
                        name={props.name}
                        disabled={used.disabled}
                        {...used.releaseProps(props)}
                    />
                </div>
                {typeof suffix == 'string' ? <div className="border-s ps-2 text-muted-foreground">
                    {suffix}
                </div> : suffix}
                {IconEnd && <IconEnd size={20} className="text-muted-foreground"/>}
            </div>
        </InputContainer>
    )
}
