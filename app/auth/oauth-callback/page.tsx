"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getProfile, ensureProfile, updateProfile } from "@/lib/profile";
import { useAuth } from "@/lib/auth";

export default function OAuthCallbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login?error=oauth_failed");
      return;
    }

    const verify = async () => {
      try {
        const profile = await getProfile(user.$id);

        // Fetch Google avatar via API route
        const avatarRes = await fetch("/api/auth/google-avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.$id }),
        });
        const { avatarUrl } = await avatarRes.json();

        if (!profile) {
          const username = user.email?.split("@")[0] || `user_${user.$id.slice(0, 6)}`;
          await ensureProfile(user.$id, user.email || "", username);
          if (avatarUrl) {
            await updateProfile(user.$id, { avatar_url: avatarUrl });
          }
          await updateProfile(user.$id, { email_verified: true });
          router.push("/auth/complete-profile");
          return;
        }

        // Save/refresh Google avatar for existing users (only if no custom avatar)
        const existingAvatarUrl = profile?.avatar_url as string | undefined;
        if (avatarUrl && (!existingAvatarUrl || existingAvatarUrl.startsWith("https://lh3.googleusercontent.com"))) {
          await updateProfile(user.$id, { avatar_url: avatarUrl });
        }

        if (profile?.profile_complete) {
          router.push("/profil");
        } else {
          router.push("/auth/complete-profile");
        }
      } catch {
        router.push("/auth/login?error=oauth_callback_error");
      }
    };
    verify();
  }, [user, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-4">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted">Traitement de l&apos;authentification...</p>
      </div>
    </div>
  );
}
