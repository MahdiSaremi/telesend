import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"
import {Loader2Icon, LoaderCircleIcon} from "lucide-react";
import Link from "next/link";

const buttonVariants = cva(
    "btn",
    {
        variants: {
            variant: {
                // --- Solid Colors ---
                default: "btn-default",
                primary: "btn-primary",
                destructive: "btn-destructive",
                success: "btn-success",
                warning: "btn-warning",
                info: "btn-info",

                // --- Outline (دورخط) ---
                outline: "btn-outline",
                'outline-primary': "btn-outline-primary",
                'outline-destructive': "btn-outline-destructive",
                'outline-success': "btn-outline-success",
                'outline-warning': "btn-outline-warning",
                'outline-info': "btn-outline-info",

                // --- Ghost (روح - هاور با پس‌زمینه) ---
                ghost: "btn-ghost",
                'ghost-primary': "btn-ghost-primary",
                'ghost-destructive': "btn-ghost-destructive",
                'ghost-success': "btn-ghost-success",
                'ghost-warning': "btn-ghost-warning",
                'ghost-info': "btn-ghost-info",

                // --- Soft (پس‌زمینه روشن) ---
                soft: "btn-soft",
                'soft-primary': "btn-soft-primary",
                'soft-destructive': "btn-soft-destructive",
                'soft-success': "btn-soft-success",
                'soft-warning': "btn-soft-warning",
                'soft-info': "btn-soft-info",

                // --- Link (لینک) ---
                link: "btn-link",
                'link-primary': "btn-link-primary",
                'link-destructive': "btn-link-destructive",
                'link-success': "btn-link-success",
                'link-warning': "btn-link-warning",
                'link-info': "btn-link-info",

                // --- Unstyled (بدون استایل) ---
                unstyled: "btn-unstyled",
                'unstyled-primary': "btn-unstyled-primary",
                'unstyled-destructive': "btn-unstyled-destructive",
                'unstyled-success': "btn-unstyled-success",
                'unstyled-warning': "btn-unstyled-warning",
                'unstyled-info': "btn-unstyled-info",

                // --- Gradient (گرادینت) ---
                gradient: "btn-gradient",
                'gradient-primary': "btn-gradient-primary",
                'gradient-destructive': "btn-gradient-destructive",
                'gradient-success': "btn-gradient-success",
                'gradient-warning': "btn-gradient-warning",
                'gradient-info': "btn-gradient-info",


                // --- Special (خاص) ---
                glass: "btn-glass",

                'outline-input': "btn-outline-input",
            },
            size: {
                default: "btn-size-default",
                xs: "btn-size-xs",
                sm: "btn-size-sm",
                lg: "btn-size-lg",
                xl: "btn-size-xl",
                icon: "btn-size-icon",
            },

            // --- Shape Styles ---
            shape: {
                default: "",
                square: "btn-shape-square",
                circle: "btn-shape-circle",
            },

            loading: {
                true: "disabled btn-loading",
                false: "",
            },
        },
        compoundVariants: [
            {
                variant: "default",
                loading: true,
                className: ""
            },
        ],
        defaultVariants: {
            variant: "default",
            size: "default",
            shape: "default",
        },
    }
)

function Button({
                    className,
                    variant,
                    shape,
                    size,
                    isLoading,
                    asChild = false,
                    link,
                    icon,
                    iconEnd,
                    children,
                    type = "button",
                    ...props
                }: React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
    asChild?: boolean,
    link?: string;
    isLoading?: boolean,
    icon?: React.ReactNode;
    iconEnd?: React.ReactNode;
}) {
    return (
        asChild ?
            <>
                {isLoading ? <LoaderCircleIcon className="animate-spin"/> : icon}
                <Slot
                    data-slot="button"
                    className={cn(buttonVariants({variant, size, shape, className, loading: isLoading ?? false}))}
                    {...props}
                    // @ts-ignore
                    disabled={props.disabled || isLoading}
                >
                    {children}
                </Slot>
                {iconEnd}
            </> : (
                link ?
                    <Link
                        data-slot="button"
                        className={cn(buttonVariants({variant, size, shape, className, loading: isLoading ?? false}))}
                        type={type ?? "button"}
                        href={link}
                        {...props as Object}
                        // disabled={props.disabled || isLoading}
                    >
                        {isLoading ? <LoaderCircleIcon className="animate-spin"/> : icon}
                        {children}
                        {iconEnd}
                    </Link> :
                    <button
                        data-slot="button"
                        className={cn(buttonVariants({variant, size, shape, className, loading: isLoading ?? false}))}
                        type={type ?? "button"}
                        {...props}
                        disabled={props.disabled || isLoading}
                    >
                        {isLoading ? <LoaderCircleIcon className="animate-spin"/> : icon}
                        {children}
                        {iconEnd}
                    </button>
            )
    )
}

export {Button, buttonVariants}
