import type {Metadata} from "next";
import "../globals.css";
import {Toaster} from "@/components/ui/sonner";
import NavbarSidebar from "./navbar-sidebar";
import {Footer} from "./footer";

export const metadata: Metadata = {
    title: "نوبتی",
    description: "نوبتی، وب اپلیکیشن رزرو نوبت",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    return (<>
        <NavbarSidebar>
            <main>
                {children}
            </main>
        </NavbarSidebar>
        <Footer/>
        <Toaster/>
    </>);
}
