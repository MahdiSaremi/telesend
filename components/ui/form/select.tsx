'use client'

import {useLayoutEffect, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronDownIcon} from "lucide-react";
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {InputContainer} from "@/modules/form/components/form-base";
import {FormProperty} from "@/modules/form/types/form-property";
import {useFormProperty} from "@/modules/form/hooks/useFormProperty";

export interface Option {
    id: string | number | null;
    label?: string;
    content?: React.ReactNode;
}

export function Select({className, items, onValueChange, placeholder, searchable = false, ...props}: {
    className?: string;
    items?: Option[];
    onValueChange?: (value: string | number | null) => void;
    placeholder?: string;
    searchable?: boolean;
} & React.ComponentProps<"button"> & FormProperty<string | number | null>) {
    const used = useFormProperty<string | number | null>(props, {defaultValue: null})
    const ctx = used.property.context
    const [open, setOpen] = useState(false)
    const value = used.value

    const rItems: Option[] = items ?? (ctx?.meta?.options && ctx?.meta?.options[used.property.name ?? '']) ?? []

    const inputRef = useRef<HTMLButtonElement>(null)
    const [inputWidth, setInputWidth] = useState(0)

    useLayoutEffect(() => {
        if (inputRef.current) {
            setInputWidth(inputRef.current.getBoundingClientRect().width)
        }

        const handleResize = () => {
            if (inputRef.current) {
                setInputWidth(inputRef.current.offsetWidth)
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const current = rItems.find((item) => item.id === value)

    return (
        <InputContainer used={used}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild ref={inputRef}>
                    <Button
                        variant="outline-input"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "justify-between font-normal!",
                            used.error && "border-destructive!",
                            className
                        )}
                        disabled={used.disabled}
                        {...used.releaseProps(props)}
                    >
                        <div className="grow text-start truncate">
                            {current?.content ?? current?.label ?? <span className="text-muted-foreground">{placeholder}</span>}
                        </div>
                        <ChevronDownIcon className="opacity-50"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0" style={{width: inputWidth}}>
                    <Command>
                        {searchable && <CommandInput placeholder="جستجو کنید..." className="h-9"/>}
                        <CommandList>
                            <CommandEmpty>هیچ آیتمی یافت نشد.</CommandEmpty>
                            <CommandGroup>
                                {rItems.map((item) => (
                                    <CommandItem
                                        key={item.id}
                                        value={item.label}
                                        onSelect={(currentValue) => {
                                            const newValue = item.id === value ? null : item.id

                                            used.setValue(newValue)
                                            setOpen(false)
                                            onValueChange?.(newValue)
                                        }}
                                    >
                                        {item.content ?? item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                value === item.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </InputContainer>
    )
}
