import * as React from "react"
import {Slot} from "@radix-ui/react-slot"
import {cva, type VariantProps} from "class-variance-authority"

import {cn} from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center justify-center rounded-md border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-slate-500/10 text-slate-700 [a&]:hover:bg-slate-500/15",
                primary:
                    "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15",
                destructive:
                    "border-transparent bg-destructive/10 text-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                success:
                    "border-transparent bg-green-500/10 text-green-500 [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-500/60",
                warning:
                    "border-transparent bg-yellow-500/10 text-yellow-500 [a&]:hover:bg-yellow-500/15",
                info:
                    "border-transparent bg-sky-500/10 text-sky-500 [a&]:hover:bg-sky-500/15",
                outline:
                    "text-foreground border-slate-300 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                'outline-primary':
                    "text-foreground border-primary text-primary [a&]:hover:bg-primary/15",
                'outline-destructive':
                    "text-foreground border-destructive text-destructive [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                'outline-success':
                    "text-foreground border-green-500 text-green-500 [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-500/60",
                'outline-warning':
                    "text-foreground border-yellow-500 text-yellow-500 [a&]:hover:bg-yellow-500/15",
                'outline-info':
                    "text-foreground border-sky-500 text-sky-500 [a&]:hover:bg-sky-500/15",
                solid:
                    "text-foreground border-transparent bg-slate-200 [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
                'solid-primary':
                    "text-foreground border-transparent bg-primary text-white [a&]:hover:bg-primary/15",
                'solid-destructive':
                    "text-foreground border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
                'solid-success':
                    "text-foreground border-transparent bg-green-400 text-white [a&]:hover:bg-green-500/90 focus-visible:ring-green-500/20 dark:focus-visible:ring-green-500/40 dark:bg-green-500/60",
                'solid-warning':
                    "text-foreground border-transparent bg-yellow-400 text-white [a&]:hover:bg-yellow-500/15",
                'solid-info':
                    "text-foreground border-transparent bg-sky-400 text-white [a&]:hover:bg-sky-500/15",
            },
            size: {
                xs: "px-2 py-0.5 text-xs",
                sm: "px-2 py-0.5 text-sm",
            }
        },
        defaultVariants: {
            variant: "default",
            size: "xs",
        },
    }
)

function Badge({
                   className,
                   variant,
                   size,
                   asChild = false,
                   ...props
               }: React.ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
    const Comp = asChild ? Slot : "span"

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({variant, size}), className)}
            {...props}
        />
    )
}

export {Badge, badgeVariants}
