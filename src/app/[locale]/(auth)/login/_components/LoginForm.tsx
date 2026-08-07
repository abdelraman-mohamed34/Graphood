"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import {
  LoginInputType,
  LoginInputsSchema,
} from "@/shared/lib/schemas";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useLogin } from "@/shared/lib/supabase";
import GoogleBtn from "./GoogleBtn";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { signInWithPassword, signInWithProvider, isPasswordLoading, isOAuthLoading } = useLogin();
  const t = useTranslations("auth.login");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputType>({
    resolver: zodResolver(LoginInputsSchema),
  });

  const onSubmit = async (data: LoginInputType) => {
    try {
      await signInWithPassword(data);
    } catch { }
  };

  const params = useSearchParams();
  const token = params.get('token');
  const tenant = params.get('tenant');

  const registerPath = () => {
    if (token && tenant) {
      return `/register?token=${token}&tenant=${tenant}`;
    } else {
      return `/register`;
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border border-border shadow-md">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Side: Login Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 md:p-8"
          >
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t("title")}</h1>

                <p className="text-balance text-muted-foreground text-sm">
                  {t("subtitle")}
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="email">{t("email")}</FieldLabel>

                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                />

                {errors.email && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.email.message}
                  </p>
                )}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">
                    {t("password")}
                  </FieldLabel>

                  <Link
                    href="/forgot_password"
                    className="ml-auto text-xs underline-offset-2 hover:underline text-muted-foreground"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>

                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                />

                {errors.password && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.password.message}
                  </p>
                )}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isPasswordLoading}
                >
                  {isPasswordLoading
                    ? t("loggingIn")
                    : t("submit")}
                </Button>

              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("socialDivider")}
              </FieldSeparator>

              <Field className="flex">
                <GoogleBtn
                  disabled={isOAuthLoading}
                  onClick={() => signInWithProvider("google")}
                />
              </Field>

              <FieldDescription className="text-center text-sm">
                {t("signupPrompt")}{" "}
                <Link href={registerPath()} className="font-semibold underline underline-offset-4">
                  {t("signup")}
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>

          {/* Right Side: Image Panel with Overlay Brand */}
          <div className="relative hidden md:block border-l border-border bg-muted overflow-hidden">
            <Image
              src="https://plus.unsplash.com/premium_vector-1712873279576-a2e0a8b0588f?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Graphood Login"
              fill
              priority
              sizes="(max-width: 768px) 0vw, 50vw"
              className="object-cover dark:brightness-[0.8] dark:grayscale-[0.2]"
            />

            {/* Gradient Overlay for Text Visibility */}
            <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Brand Logo & Name (Top Left over Image) */}
            <div className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white">
              <span className="font-bold text-xl tracking-tight drop-shadow-sm">
                Graphood
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs">
        {t("termsPrefix")}{" "}
        <a href="#" className="underline underline-offset-2">{t("termsLink")}</a> {t("andText")}{" "}
        <a href="#" className="underline underline-offset-2">{t("privacyLink")}</a>.
      </FieldDescription>
    </div>
  );
}