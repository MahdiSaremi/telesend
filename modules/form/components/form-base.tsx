'use client'

import {UseFormReturn} from "react-hook-form";
import React, {FormEvent, useState} from "react";
import {Label} from "@/components/ui/label";
import {FormContext, FormReactContext, useFormContext} from "@/modules/form/context/FormContext";
import {FormMeta} from "@/modules/form/types/form-meta";
import {FormInputUsed} from "@/modules/form/types/form-property";
import {cn} from "@/lib/utils";

export function Form({theForm, children, onSubmit, meta, disabled, ...props}: {
    theForm: UseFormReturn<any, any, any>;
    children?: React.ReactNode;
    onSubmit?: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    meta?: FormMeta;
    disabled?: boolean;
} & Omit<React.ComponentProps<"form">, "action" | "onSubmit">) {
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [processMap, setProcessMap] = useState<any>({})

    const addProcess = (name: string) => {
        setProcessMap((map: any) => {
            if (!map[name]) {
                setProcessing(true)
                return {...map, [name]: true}
            } else {
                return map
            }
        })
    }

    const removeProcess = (name: string) => {
        setProcessMap((map: any) => {
            if (map[name]) {
                let isProcessing = false

                for (const key in map) {
                    if (name != key && map[key]) {
                        isProcessing = true
                        break
                    }
                }

                setProcessing(isProcessing)
                return {...map, [name]: false}
            } else {
                return map
            }
        })
    }

    return (
        <form
            onSubmit={async e => {
                e.preventDefault();
                setLoading(true)
                await onSubmit?.(e);
                setLoading(false)
            }}
            {...props}
        >
            <FormReactContext.Provider
                value={{
                    form: theForm,
                    loading,
                    setLoading,
                    processing,
                    addProcess,
                    removeProcess,
                    disabled: disabled || meta?.disabled || processing,
                    meta,
                }}
            >
                {children}
            </FormReactContext.Provider>
        </form>
    )
}

export function FormFrame({theForm, children, meta, disabled}: {
    theForm: UseFormReturn<any, any, any>;
    children?: React.ReactNode;
    meta?: FormMeta;
    disabled?: boolean;
}) {
    const [loading, setLoading] = useState(false)
    const [processing, setProcessing] = useState(false)
    const [processMap, setProcessMap] = useState<any>({})

    const addProcess = (name: string) => {
        setProcessMap((map: any) => {
            if (!map[name]) {
                setProcessing(true)
                return {...map, [name]: true}
            } else {
                return map
            }
        })
    }

    const removeProcess = (name: string) => {
        setProcessMap((map: any) => {
            if (map[name]) {
                let isProcessing = false

                for (const key in map) {
                    if (name != key && map[key]) {
                        isProcessing = true
                        break
                    }
                }

                setProcessing(isProcessing)
                return {...map, [name]: false}
            } else {
                return map
            }
        })
    }

    return (
        <FormReactContext.Provider
            value={{
                form: theForm,
                loading,
                setLoading,
                processing,
                addProcess,
                removeProcess,
                disabled: disabled || meta?.disabled || processing,
                meta,
            }}
        >
            {children}
        </FormReactContext.Provider>
    )
}

export function InputLabel({label, children}: {
    label: string | React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col w-full justify-center gap-3">
            {label && <Label>{label}</Label>}
            {children}
        </div>
    )
}

export function InputContainer({used, children, grid = "column"}: {
    used: FormInputUsed;
    children: React.ReactNode;
    grid?: "column" | "column-reverse" | "row" | "row-reverse";
}) {
    const isReversed = grid == "column-reverse" || grid == "row-reverse"

    if (used.property.withoutContainer) {
        return children
    }

    return (
        <div className={cn("flex flex-col w-full justify-center gap-3", used.property.containerClassName)}>
            <div className={cn(
                "flex gap-3",
                grid == "column" && "flex-col",
            )}>
                {!isReversed && used.property.label && <div className="flex justify-between items-center h-3 grow">
                    <Label htmlFor={used.property.name}>{used.property.label}</Label>
                    <div>{used.property.labelAction}</div>
                </div>}
                {children}
                {isReversed && used.property.label && <div className="flex justify-between items-center h-3 grow">
                    <Label htmlFor={used.property.name}>{used.property.label}</Label>
                    <div>{used.property.labelAction}</div>
                </div>}
            </div>

            {used.error && <p className="text-destructive text-xs">{used.error}</p>}
        </div>
    )
}
