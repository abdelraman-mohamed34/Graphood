import React from "react";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales } from "../../../../public/data";
import { Footer } from "./_components/footer/Footer";
import Navbar from "./_components/navbar";

interface MainLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function MainLayout({
  children,
  params,
}: Readonly<MainLayoutProps>) {

  const { locale } = await params;
  if (!locales.includes(locale)) { notFound(); }
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Navbar />
        <main className="flex-1 w-full mx-auto">
          {children}
        </main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  );
}