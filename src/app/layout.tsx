import type { Metadata } from "next";
import "./globals.css";
import { Roboto, Roboto_Mono } from "next/font/google";

const robotoSans = Roboto({
    variable: "--font-roboto-sans",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

const robotoMono = Roboto_Mono({
    variable: "--font-roboto-mono",
    subsets: ["latin"],
    weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
    title: "Graphood",
    description: "Multi-System SaaS Platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${robotoSans.variable} ${robotoMono.variable} antialiased font-sans`}>
                {children}
            </body>
        </html>
    );
}