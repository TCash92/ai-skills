"use client";

import { useState, useCallback } from "react";
import type { ChecklistFormData } from "@/lib/types";
import { INSPECTION_ITEMS } from "@/lib/types";

// Airtable configuration - these should be set in environment variables
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || "";
const AIRTABLE_BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || "";
const AIRTABLE_TABLE_NAME = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_NAME || "Pre-Op Checklist";

interface AirtableResponse {
  success: boolean;
  recordId?: string;
  error?: string;
}

export function useAirtable() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const submitToAirtable = useCallback(async (data: ChecklistFormData): Promise<AirtableResponse> => {
    setIsSubmitting(true);
    setLastError(null);

    try {
      // Map form data to Airtable field names
      const getItemLabel = (id: string) => {
        const item = INSPECTION_ITEMS.find((i) => i.id === id);
        return item?.label || id;
      };

      const fields: Record<string, unknown> = {
        "Date": data.date,
        "Employee Initials or Name": data.employeeName,
        "Employee ID Number": data.employeeId === "unknown" ? "I Don't Know" : data.employeeId,
        "Asset Make and Equipment Type": data.assetMake,
        "Asset ID Number": data.assetId || "",
        "Hours": data.hours ? parseFloat(data.hours) : null,
        "Kilometers": data.kilometers ? parseFloat(data.kilometers) : null,
        "Items Inspected": data.itemsInspected.map(getItemLabel),
        "Items Requiring Attention": data.itemsRequiringAttention.map(getItemLabel),
        "Condition of Equipment": data.equipmentCondition === "ok" ? "OK" : data.equipmentCondition === "requires_attention" ? "Requires Attention" : "",
        "Comments/Observations": data.comments || "",
        "Action Taken": data.actionTaken === "cleared" ? "Equipment Cleared" : data.actionTaken === "reported" ? "Reported for Maintenance" : "",
      };

      // Remove null/empty fields
      Object.keys(fields).forEach((key) => {
        if (fields[key] === null || fields[key] === "" || (Array.isArray(fields[key]) && (fields[key] as unknown[]).length === 0)) {
          delete fields[key];
        }
      });

      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }

      const result = await response.json();
      return { success: true, recordId: result.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error occurred";
      setLastError(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const isConfigured = Boolean(AIRTABLE_API_KEY && AIRTABLE_BASE_ID);

  return {
    submitToAirtable,
    isSubmitting,
    lastError,
    isConfigured,
  };
}
