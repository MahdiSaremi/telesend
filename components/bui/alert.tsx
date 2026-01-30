'use client'

import {Alert as AlertBase, AlertDescription, AlertTitle} from "@/components/ui/alert";
import React from "react";

export function Alert({icon, title, description, ...props}: React.ComponentProps<typeof AlertBase> & {
    title: string | React.ReactNode;
    icon?: React.ReactNode;
    description?: string | React.ReactNode;
}) {
    return (
        <AlertBase {...props}>
            {icon}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
        </AlertBase>
    )
}
