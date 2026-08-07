import type { Provider } from "@supabase/supabase-js";

export type OAuthProvider = Extract<
    Provider,
    "google" | "github"
>;

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface OAuthOptions {
    provider: OAuthProvider;
    locale: string;
    redirectTo?: string;
}

export interface AuthResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: Error;
}