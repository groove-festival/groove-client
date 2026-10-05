import { z } from "zod";

import { readStorageItem, writeStorageItem } from "@/shared/lib/storage";

const ORDER_STORAGE_KEY_PREFIX = "groove:pub-order";

const storedOrderRefSchema = z.object({
  orderId: z.number().int().positive(),
  orderToken: z.string().min(1),
});

export type StoredOrderRef = z.infer<typeof storedOrderRefSchema>;

export const getOrderStorageKey = (boothCode: string, tableCode: string) =>
  `${ORDER_STORAGE_KEY_PREFIX}:${boothCode}:${tableCode}`;

export const readStoredOrderRef = (storageKey: string): StoredOrderRef | null => {
  try {
    const rawValue = readStorageItem("local", storageKey);

    if (!rawValue) {
      return null;
    }

    const result = storedOrderRefSchema.safeParse(JSON.parse(rawValue));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const writeStoredOrderRef = (
  storageKey: string,
  orderRef: StoredOrderRef | null,
): boolean =>
  writeStorageItem("local", storageKey, orderRef ? JSON.stringify(orderRef) : null);
