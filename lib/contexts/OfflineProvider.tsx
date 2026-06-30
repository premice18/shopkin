"use client";

import { useEffect, useState, type ReactNode } from "react";

export default function OfflineProvider({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState(() => {
    if (typeof window !== "undefined") return !navigator.onLine;
    return false;
  });

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      {offline && (
        <div
          className="fixed top-0 left-0 right-0 z-[60] bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-900"
          role="alert"
        >
          Vous êtes hors-ligne. Certaines fonctionnalités sont limitées.
        </div>
      )}
      {children}
    </>
  );
}
