'use client'

import {useLayoutEffect, useRef, useState} from "react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {Check, ChevronDownIcon, ChevronsDown, ChevronsUpDown} from "lucide-react";
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

export function MultiSelect({className, items, placeholder, searchable = false, ...props}: {
    className?: string;
    items?: Option[];
    placeholder?: string;
    searchable?: boolean;
} & Omit<React.ComponentProps<"button">, "value"> & FormProperty<(string | number | null)[]>) {
    const used = useFormProperty<(string | number | null)[]>(props, {defaultValue: []})
    const ctx = used.property.context
    const [open, setOpen] = useState(false)
    const values = used.value

    const rItems: Option[] = items ?? (ctx?.meta?.options && ctx?.meta?.options[used.property.name ?? '']) ?? []

    const inputRef = useRef<HTMLButtonElement>(null);
    const [inputWidth, setInputWidth] = useState(0)

    useLayoutEffect(() => {
        if (inputRef.current) {
            setInputWidth(inputRef.current.getBoundingClientRect().width);
        }

        const handleResize = () => {
            if (inputRef.current) {
                setInputWidth(inputRef.current.offsetWidth);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <InputContainer used={used}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild ref={inputRef}>
                    <Button
                        variant="outline-input"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "justify-between h-max font-normal!",
                            used.error && "border-destructive!",
                            className
                        )}
                        disabled={used.disabled}
                        {...used.releaseProps(props)}
                    >
                        <div className="grow text-start truncate">
                            {values.length > 0 ?
                                <div className="flex flex-wrap gap-1">
                                    {values.map(value => {
                                        const val = rItems.find((item) => item.id === value)

                                        return (
                                            <span className="bg-slate-100 px-2 py-1 rounded-xl text-xs" key={value}>
                                                {val?.content ?? val?.label}
                                            </span>
                                        )
                                    })}
                                </div> :
                                <span className="text-muted-foreground">{placeholder}</span>}
                            {/*{rItems.find((item) => item.id === value)?.label*/}
                            {/*    ?? <span className="text-muted-foreground">{placeholder}</span>}*/}
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
                                            used.setValue(
                                                values.includes(item.id) ? values.filter(i => item.id != i) : [...values, item.id]
                                            )
                                        }}
                                    >
                                        {item.content ?? item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                values.includes(item.id) ? "opacity-100" : "opacity-0"
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
