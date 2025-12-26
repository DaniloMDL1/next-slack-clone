import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const roboto = Roboto({
    subsets: ["latin"]
})

export const metadata: Metadata = {
    title: "Next Slack Clone",
    description: "Slack Clone with Next.js",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${roboto.className} antialiased`}
            >
                {children}
                <Toaster richColors position="top-center" theme="light"/>
            </body>
        </html>
    );
}
