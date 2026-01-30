'use client'

import {Button, buttonVariants} from "@/components/ui/button";
import * as React from "react";
import type {VariantProps} from "class-variance-authority";
import {FormContext, useFormContext} from "@/modules/form/context/FormContext";

export function FormButton(
    {
        context,
        disabled,
        isLoading,
        type,
        ...props
    }: React.ComponentProps<"button"> &
        VariantProps<typeof buttonVariants> & {
        asChild?: boolean,
        isLoading?: boolean,
        context?: FormContext;
        icon?: React.ReactNode;
        iconEnd?: React.ReactNode;
        layoutClassName?: string;
    }
) {
    const defaultContext = useFormContext()
    const ctx = context ?? defaultContext

    return (
        <Button
            isLoading={isLoading || ctx?.loading}
            type={type ?? "submit"}
            disabled={disabled || ctx?.loading || ctx?.disabled}
            {...props}
        />
    )
}