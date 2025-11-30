"use client";

import { useState, useEffect, useCallback } from "react";
import type { ChecklistFormData } from "@/lib/types";

const STORAGE_KEY = "preop-pending-submissions";

interface PendingSubmission {
  id: string;
  data: ChecklistFormData;
  timestamp: number;
}

export function useLocalStorage() {
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingSubmission[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initialize online status
    setIsOnline(navigator.onLine);

    // Load pending submissions from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPendingSubmissions(JSON.parse(stored));
      } catch {
        console.error("Failed to parse stored submissions");
      }
    }

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveForLater = useCallback((data: ChecklistFormData) => {
    const submission: PendingSubmission = {
      id: crypto.randomUUID(),
      data,
      timestamp: Date.now(),
    };

    setPendingSubmissions((prev) => {
      const updated = [...prev, submission];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    return submission.id;
  }, []);

  const removePending = useCallback((id: string) => {
    setPendingSubmissions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllPending = useCallback(() => {
    setPendingSubmissions([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    pendingSubmissions,
    isOnline,
    saveForLater,
    removePending,
    clearAllPending,
  };
}
