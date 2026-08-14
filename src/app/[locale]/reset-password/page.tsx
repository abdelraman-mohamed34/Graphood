import ResetPasswordForm from "./_components/reset-password-form";
import type { Metadata } from "next";
import { privateMetadata } from "@/shared/lib/seo";
export const metadata: Metadata = privateMetadata;

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <ResetPasswordForm />
        </div>
    );
}
