import {Toaster} from "@/components/ui/sonner";
import "./globals.css";

export default async function RootLayout({children}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fa" dir="rtl">
        <body
            // className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white flex flex-col min-h-screen`}
            className="antialiased bg-white dark:bg-slate-700 flex flex-col"
        >
        {children}
        <Toaster/>
        </body>
        </html>
    );
}
