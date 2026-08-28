"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function TermsAgreementModal({ open, onOpenChange, onProceed }: { open: boolean; onOpenChange: (open: boolean) => void; onProceed: () => void }) {
    const t = useTranslations("refundPolicy"); const [scrolled, setScrolled] = useState(false); const [agreed, setAgreed] = useState(false);
    return <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent className="sm:max-w-lg"><AlertDialogHeader><AlertDialogTitle>{t("title")}</AlertDialogTitle></AlertDialogHeader><div className="max-h-60 overflow-y-auto space-y-4 rounded border p-4 text-sm leading-6" onScroll={(e) => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true); }}><p>{t("testModeClause")}</p><p>{t("oneTimePurchase")}</p><p>{t("monthlySubscriptions")}</p><p>{t("exclusions")}</p><p>{t("manualProcessing")}</p></div>{!scrolled && <p className="text-sm text-muted-foreground">{t("scrollInstruction")}</p>}<label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={agreed} disabled={!scrolled} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />{t("agreeTermsCheck")}</label><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction disabled={!scrolled || !agreed} onClick={(e) => { e.preventDefault(); onProceed(); }}>{t("proceedToPayment")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
