'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import React, {useEffect} from "react";
import {useIsMobile} from "@/hooks/use-mobile";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {cn} from "@/lib/utils";


export function ResponsiveDialog({open, setOpen, trigger, children, title, description, showCloseButton = false, className, drawerClassName, dialogClassName}: {
    open?: boolean;
    setOpen?: (open: boolean) => void;
    trigger?: React.ReactNode;
    children?: React.ReactNode;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    showCloseButton?: boolean;
    className?: string;
    drawerClassName?: string;
    dialogClassName?: string;
}) {
    const isMobile = useIsMobile()

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                {trigger && <DrawerTrigger asChild>
                    {trigger}
                </DrawerTrigger>}
                <DrawerContent className={cn(className, drawerClassName)}>
                    {(title || description) && <DrawerHeader className="text-right">
                        {title && <DrawerTitle>{title}</DrawerTitle>}
                        {description && <DrawerDescription>
                            {description}
                        </DrawerDescription>}
                    </DrawerHeader>}

                    <div className="px-6 py-8">
                        {children}
                    </div>
                </DrawerContent>
            </Drawer>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>}
            <DialogContent className={cn("sm:max-w-lg", className, dialogClassName)} showCloseButton={showCloseButton}>
                {(title || description) && <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {description && <DialogDescription>
                        {description}
                    </DialogDescription>}
                </DialogHeader>}

                <div className="pt-4 -mx-2 -mb-2 px-2 pb-2 overflow-x-hidden">
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    )
}