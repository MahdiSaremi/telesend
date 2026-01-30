'use client'

import {Button} from "@/components/ui/button";
import {
    BriefcaseBusinessIcon,
    LayoutDashboardIcon,
    LogInIcon,
    MenuIcon,
    ShoppingCartIcon,
    StoreIcon,
    UserIcon,
    WrenchIcon
} from "lucide-react";
import {Container} from "@/modules/core/components/base-layout";
import Link from "next/link";
import {useState} from "react";
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";

const navigation = [
    {
        url: "/dashboard",
        title: "پیشخوان",
        icon: LayoutDashboardIcon,
        deep: false,
    },
    {
        url: "/dashboard/services",
        title: "خدمات",
        icon: WrenchIcon,
        deep: true,
    },
    {
        url: "/dashboard/employees",
        title: "کارکنان",
        icon: BriefcaseBusinessIcon,
        deep: true,
    },
]

export default function ({children}: {
    children: React.ReactNode;
}) {
    const [menuOpened, setMenuOpened] = useState(false)
    const path = usePathname()

    return (
        <>
            <nav className="bg-white h-18 py-2 px-2 shadow-lg shadow-slate-500/10">
                <Container className="flex items-center gap-2 h-full max-lg:px-0">
                    <div className="lg:hidden">
                        <Button icon={<MenuIcon/>} shape="square" variant="ghost" onClick={() => setMenuOpened(true)}/>
                    </div>
                    <span>نوبتی</span>
                    <div className="ms-auto"></div>
                    <Button shape="circle" variant="soft">
                        <UserIcon/>
                    </Button>
                </Container>
            </nav>

            <div
                className={cn("fixed inset-0 bg-black/30 backdrop-blur-xs z-40 transition-all lg:hidden", menuOpened ? "opacity-100" : "opacity-0 pointer-events-none")}
                onClick={() => setMenuOpened(false)}>
                <div
                    className={cn("h-full w-[80%] max-w-80 bg-white border-t border-b shadow-lg py-4 px-4 transition-all duration-300", menuOpened ? "translate-x-0" : "translate-x-1/2")}
                    onClick={e => e.stopPropagation()}>
                    <ul className="space-y-2">
                        {navigation.map(item => <li key={item.url}>
                            <Link href={item.url}>
                                <div className={cn(
                                    "w-full px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition-colors",
                                    (path == item.url || (item.deep && path.startsWith(item.url + "/"))) && "bg-slate-100",
                                )}>
                                    <item.icon className="size-5"/>
                                    {item.title}
                                </div>
                            </Link>
                        </li>)}
                    </ul>
                </div>
            </div>

            <div className="flex grow overflow-hidden bg-slate-50">
                <div className="w-80 bg-white border-t border-b shadow-lg py-4 px-4 max-lg:hidden">
                    <ul className="space-y-2">
                        {navigation.map(item => <li key={item.url}>
                            <Link href={item.url}>
                                <div className={cn(
                                    "w-full px-4 py-3 rounded-lg flex items-center gap-2 hover:bg-slate-100 transition-colors",
                                    (path == item.url || (item.deep && path.startsWith(item.url + "/"))) && "bg-slate-100",
                                )}>
                                    <item.icon className="size-5"/>
                                    {item.title}
                                </div>
                            </Link>
                        </li>)}
                    </ul>
                </div>

                <div className="w-full lg:w-[calc(100vw-20rem)]">
                    {children}
                </div>
            </div>
        </>
    )
}
