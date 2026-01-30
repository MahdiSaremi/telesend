'use client'

import React from "react";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import {navigateMap} from "@/configs/navigation";
import {Option} from "@/components/ui/form/select";
import {UseCrudIndexProps} from "@/modules/crud/hooks/useCrudIndex";
import {Button} from "@/components/ui/button";
import {MoveRightIcon} from "lucide-react";

export function NavigationBar({children}: { children?: React.ReactNode }) {
    return (
        <div className="bg-white flex items-center h-14 gap-2 border border-b">
            <Container className="max-lg:px-6">
                {children}
            </Container>
        </div>
    )
}

export function Container({children, className, ...props}: { children?: React.ReactNode, className?: string }) {
    return (
        <div className={cn("container w-full mx-auto px-4 sm:px-8", className)} {...props}>
            {children}
        </div>
    )
}

export function ContainerSmall({children, className, ...props}: { children?: React.ReactNode, className?: string }) {
    return (
        <div className={cn("container w-full mx-auto px-4 sm:max-w-[60rem]", className)} {...props}>
            {children}
        </div>
    )
}

const dashCardVariants = {
    "md": {
        className: "bg-white rounded-xl shadow-xl shadow-slate-500/5 py-6 px-8",
        hr: "mt-6 mb-4 -mx-8",
    },
    "sm": {
        className: "bg-white rounded-xl shadow-xl shadow-slate-500/5 p-4",
        hr: "mt-4 mb-6 -mx-4",
    },
}

export function DashHeader({variant, className, title, actions, back, ...props}: {
    variant?: keyof typeof dashCardVariants;
    className?: string;
    title?: string | React.ReactNode;
    actions?: React.ReactNode;
    back?: string | (() => void);
}) {
    return (
        <div className={cn("flex items-center gap-2 text-xl mb-4", className)} {...props}>
            {typeof back === "function" && <Button variant="outline" shape="square" onClick={back}><MoveRightIcon /></Button>}
            {typeof back === "string" && <Button variant="outline" shape="square" asChild><Link href={back}><MoveRightIcon /></Link></Button>}

            <h1 className="font-bold">{title}</h1>

            <div className="ms-auto"></div>
            {actions}
        </div>
    )
}

export function DashCard({variant, children, className, title, mediumTitle, titleClassName, actions, alerts, ...props}: {
    variant?: keyof typeof dashCardVariants;
    children?: React.ReactNode;
    className?: string;
    title?: string | React.ReactNode;
    mediumTitle?: string | React.ReactNode;
    titleClassName?: string;
    actions?: React.ReactNode;
    alerts?: React.ReactNode;
}) {
    const style = dashCardVariants[variant ?? "md"]

    return (
        <div className={cn(style.className, className)} {...props}>
            {title && (
                <>
                    <div className={cn("flex items-center gap-2 text-xl", titleClassName)}>
                        {title}
                        {actions && (
                            <>
                                <div className="ms-auto"></div>
                                {actions}
                            </>
                        )}
                    </div>
                    {alerts && <div className="mt-6">
                        {alerts}
                    </div>}
                    <hr className={style.hr}/>
                </>
            )}
            {mediumTitle && (
                <p className="mb-6">{mediumTitle}</p>
            )}
            {children}
        </div>
    )
}

export function DashBreadcrumb({items, auto}: {
    items?: Array<{
        title: string;
        href?: string;
    }>;
    auto?: boolean;
}) {
    const pathname = usePathname();
    const autoItems: Array<{
        title: string;
        href?: string;
    }> = []

    if (auto) {
        let target: any = navigateMap
        let path = pathname!
        let link = ""

        while (path.length > 0 && target) {
            let found = false

            for (let key in target) {
                if (path?.startsWith(key + "/")) {
                    path = path.substring(key.length)
                    autoItems.push({
                        title: target[key].title,
                        href: (target[key].link ?? true) ? link + key : undefined,
                    })
                    link += key
                    target = target[key].children
                    found = true
                    break
                } else if (path == key) {
                    path = ""
                    autoItems.push({
                        title: target[key].title,
                        href: (target[key].link ?? true) ? link + key : undefined,
                    })
                    target = target[key].children
                    found = true
                    break
                }
            }

            if (!found) {
                let matches = /^\/([^\/]+)/.exec(path)

                if (target['*'] && matches) {
                    path = path.substring(matches.length)
                    autoItems.push({
                        title: target['*'].title,
                        href: (target['*'].link ?? true) ? link + "/" + matches.at(1) : undefined,
                    })
                    target = target['*'].children
                    link += "/" + matches.at(1)
                    continue
                }

                break
            }
        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {[...autoItems, ...items ?? []].map((item, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <BreadcrumbSeparator/>}
                        <BreadcrumbItem>
                            {item.href ? (
                                <BreadcrumbLink asChild>
                                    <Link href={item.href}>{item.title}</Link>
                                </BreadcrumbLink>
                            ) : (
                                <BreadcrumbLink>{item.title}</BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

export function TableGrouping({items, value, setValue}: {
    items: Option[],
    value?: string | number | null,
    setValue?: (value: string | number | null) => void,
}) {
    return (
        <div className="text-sm text-slate-400">
            <div className="overflow-x-auto -my-4 py-4">
                <div className="flex gap-12 w-max">
                    {items.map(({label, id}) => (
                        <span
                            key={id}
                            className={cn("transition-all cursor-pointer", id === value && "text-primary")}
                            onClick={() => setValue?.(id)}
                        >
                            {label}
                        </span>
                    ))}
                </div>
            </div>
            <hr className="-mx-8 my-4"/>
        </div>
    )
}

export function ViewText({text, className, ...props}: {
    text?: string;
} & React.ComponentProps<"div">) {
    return (
        <div className={cn("space-y-1 text-justify", className)}>
            {text?.split("\n").map((line, i) => {
                if (line.trim() == "") {
                    return <p key={i} />
                }

                return <p key={i}>{line}</p>
            })}
        </div>
    )
}
