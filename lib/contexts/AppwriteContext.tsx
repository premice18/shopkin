"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { databases } from "@/lib/appwrite";
import { DATABASE_ID, PARAMETRES_COLLECTION_ID } from "@/lib/constants";

interface AppwriteContextValue {
  usdCdfRate: number;
  rateLoading: boolean;
}

const AppwriteContext = createContext<AppwriteContextValue>({
  usdCdfRate: 2800,
  rateLoading: true,
});

export function AppwriteProvider({ children }: { children: ReactNode }) {
  const [rate, setRate] = useState(2800);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    databases
      .getDocument(DATABASE_ID, PARAMETRES_COLLECTION_ID, "global")
      .then((doc) => {
        const r = (doc.usd_cdf_rate as number) || 2800;
        setRate(r);
      })
      .catch(() => setRate(2800))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppwriteContext.Provider value={{ usdCdfRate: rate, rateLoading: loading }}>
      {children}
    </AppwriteContext.Provider>
  );
}

export function useAppwrite() {
  return useContext(AppwriteContext);
}

export function formaterPrix(prixUSD: number, devise: "USD" | "CDF", taux: number): string {
  if (devise === "CDF") {
    const montant = Math.round(prixUSD * taux);
    return `${montant.toLocaleString()} FC`;
  }
  return `${prixUSD.toLocaleString()} $`;
}
