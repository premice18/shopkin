import { tablesDB } from "./appwrite";
import { Query, ID } from "appwrite";
import { DATABASE_ID, PAYMENT_METHODS_COLLECTION_ID } from "./constants";
import type { PaymentMethodDocument, MobileMoneyProvider, CardProvider } from "./types";

export async function getPaymentMethods(userId: string): Promise<PaymentMethodDocument[]> {
  try {
    const res = await tablesDB.listRows({
      databaseId: DATABASE_ID,
      tableId: PAYMENT_METHODS_COLLECTION_ID,
      queries: [
        Query.equal("user_id", userId),
        Query.orderDesc("$createdAt"),
      ],
    });
    return res.rows as unknown as PaymentMethodDocument[];
  } catch {
    return [];
  }
}

export async function getPaymentMethod(id: string): Promise<PaymentMethodDocument | null> {
  try {
    const doc = await tablesDB.getRow({ databaseId: DATABASE_ID, tableId: PAYMENT_METHODS_COLLECTION_ID, rowId: id });
    return doc as unknown as PaymentMethodDocument;
  } catch {
    return null;
  }
}

interface CreateMobileMoneyData {
  userId: string;
  provider: MobileMoneyProvider;
  phoneNumber: string;
  label?: string;
  isDefault?: boolean;
}

interface CreateCardData {
  userId: string;
  provider: CardProvider;
  cardHolderName: string;
  cardLastFour: string;
  cardExpiryMonth: number;
  cardExpiryYear: number;
  label?: string;
  isDefault?: boolean;
}

export type CreatePaymentMethodData = CreateMobileMoneyData | CreateCardData;

function isMobileMoneyData(data: CreatePaymentMethodData): data is CreateMobileMoneyData {
  return "phoneNumber" in data;
}

export async function createPaymentMethod(data: CreatePaymentMethodData) {
  const { userId, provider, label, isDefault } = data;

  if (isMobileMoneyData(data)) {
    const { phoneNumber } = data;
    return tablesDB.createRow({
      databaseId: DATABASE_ID,
      tableId: PAYMENT_METHODS_COLLECTION_ID,
      rowId: ID.unique(),
      data: {
        user_id: userId,
        type: "mobile_money",
        provider,
        label: label || "",
        phone_number: phoneNumber,
        card_holder_name: "",
        card_last_four: "",
        card_expiry_month: null,
        card_expiry_year: null,
        is_default: isDefault || false,
      },
    });
  }

  const { cardHolderName, cardLastFour, cardExpiryMonth, cardExpiryYear } = data as CreateCardData;
  return tablesDB.createRow({
    databaseId: DATABASE_ID,
    tableId: PAYMENT_METHODS_COLLECTION_ID,
    rowId: ID.unique(),
    data: {
      user_id: userId,
      type: "card",
      provider,
      label: label || "",
      phone_number: "",
      card_holder_name: cardHolderName,
      card_last_four: cardLastFour,
      card_expiry_month: cardExpiryMonth,
      card_expiry_year: cardExpiryYear,
      is_default: isDefault || false,
    },
  });
}

interface UpdateMobileMoneyData {
  provider?: MobileMoneyProvider;
  phoneNumber?: string;
  label?: string;
  isDefault?: boolean;
}

interface UpdateCardData {
  provider?: CardProvider;
  cardHolderName?: string;
  cardLastFour?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;
  label?: string;
  isDefault?: boolean;
}

export type UpdatePaymentMethodData = UpdateMobileMoneyData | UpdateCardData;

export async function updatePaymentMethod(id: string, data: UpdatePaymentMethodData) {
  const payload: Record<string, unknown> = {};
  if ("label" in data && data.label !== undefined) payload.label = data.label;
  if ("isDefault" in data && data.isDefault !== undefined) payload.is_default = data.isDefault;
  if ("provider" in data && data.provider !== undefined) payload.provider = data.provider;

  if ("phoneNumber" in data && data.phoneNumber !== undefined) {
    payload.phone_number = data.phoneNumber;
  }
  if ("cardHolderName" in data && data.cardHolderName !== undefined) {
    payload.card_holder_name = data.cardHolderName;
  }
  if ("cardLastFour" in data && data.cardLastFour !== undefined) {
    payload.card_last_four = data.cardLastFour;
  }
  if ("cardExpiryMonth" in data && data.cardExpiryMonth !== undefined) {
    payload.card_expiry_month = data.cardExpiryMonth;
  }
  if ("cardExpiryYear" in data && data.cardExpiryYear !== undefined) {
    payload.card_expiry_year = data.cardExpiryYear;
  }

  return tablesDB.updateRow({ databaseId: DATABASE_ID, tableId: PAYMENT_METHODS_COLLECTION_ID, rowId: id, data: payload });
}

export async function deletePaymentMethod(id: string) {
  return tablesDB.deleteRow({ databaseId: DATABASE_ID, tableId: PAYMENT_METHODS_COLLECTION_ID, rowId: id });
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  const visible = phone.slice(-4);
  const masked = phone.slice(0, -4).replace(/\d/g, "*");
  return masked + visible;
}

export function maskCard(lastFour: string): string {
  return `**** **** **** ${lastFour}`;
}

export const MOBILE_MONEY_PROVIDERS: { value: MobileMoneyProvider; label: string; color: string }[] = [
  { value: "orange_money", label: "Orange Money", color: "bg-orange-500" },
  { value: "m_pesa", label: "M-Pesa", color: "bg-green-600" },
  { value: "airtel_money", label: "Airtel Money", color: "bg-red-600" },
];

export const CARD_PROVIDERS: { value: CardProvider; label: string; color: string }[] = [
  { value: "visa", label: "Visa", color: "bg-blue-700" },
  { value: "mastercard", label: "MasterCard", color: "bg-yellow-600" },
  { value: "amex", label: "American Express", color: "bg-blue-500" },
];

export function getProviderInfo(provider: string) {
  const all = [...MOBILE_MONEY_PROVIDERS, ...CARD_PROVIDERS];
  return all.find((p) => p.value === provider) || { value: provider, label: provider, color: "bg-zinc-500" };
}
