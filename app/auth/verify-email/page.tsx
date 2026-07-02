"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/auth";
import { updateProfile } from "@/lib/profile";
import AuthHeader from "@/components/layout/AuthHeader";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!userId || !secret) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setErrorMsg("Lien de vérification invalide.");
      return;
    }
    verifyEmail(userId, secret)
      .then(async () => {
        await updateProfile(userId, { email_verified: true }).catch(() => {});
        setStatus("success");
        setTimeout(() => router.push("/profil"), 3000);
      })
      .catch((err) => {
        setStatus("error");
        setErrorMsg(err?.message || "Le lien est expiré ou invalide.");
      });
  }, [userId, secret, router]);

  return (
    <div className="min-h-screen bg-surface pt-16 flex flex-col">
      <AuthHeader />
      <div className="mx-auto mt-0 flex flex-1 max-w-sm items-center justify-center px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          {status === "verifying" && (
            <>
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-4 text-sm text-muted">Vérification de votre email...</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-4 text-lg font-bold text-primary">Email vérifié !</h1>
              <p className="mt-2 text-sm text-muted">Merci, votre adresse email a été vérifiée avec succès.</p>
              <p className="mt-4 text-xs text-muted">Redirection vers votre profil...</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mt-4 text-lg font-bold text-primary">Échec de la vérification</h1>
              <p className="mt-2 text-sm text-muted">{errorMsg}</p>
              <Link
                href="/profil"
                className="mt-6 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Retour au profil
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
