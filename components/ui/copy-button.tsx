import * as React from "react";
import type {VariantProps} from "class-variance-authority";
import {Button, buttonVariants} from "@/components/ui/button";
import {CheckIcon, CopyIcon} from "lucide-react";
import {useEffect, useState} from "react";
import {toast} from "sonner";

export function CopyButton(
    {
        className,
        size,
        variant = "outline",
        shape = "square",
        data,
        ...props
    }: Omit<React.ComponentProps<"button">, "children"> &
        VariantProps<typeof buttonVariants> & {
        data: string | (() => string);
    }
) {
    const [copied, setCopied] = useState(false)
    const [copying, setCopying] = useState(false)

    useEffect(() => {
        if (copied) {
            const id = setTimeout(() => {
                setCopied(false)
            }, 4000)

            return () => clearTimeout(id)
        }
    }, [copied]);

    return (
        <Button
            onClick={async () => {
                if (copied || copying) {
                    return
                }

                setCopying(true)

                try {
                    await navigator.clipboard.writeText(typeof data === 'string' ? data : data())
                    setCopied(true)
                    toast.success("متن کپی شد")
                } catch (err) {
                    console.error(err)
                    toast("متن کپی نشد")
                }

                setCopying(false)
            }}
            type="button"
            icon={copied ? <CheckIcon /> : <CopyIcon/>}
            isLoading={copying}
            variant={variant}
            shape={shape}
        />
    )
}
