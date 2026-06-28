import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "./firebase";
import { useEffect } from "react";

export interface PerformanceMetric {
  name: string;
  value: number; // in milliseconds
  status: "success" | "error";
  uid?: string | null;
  browser?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Logs a performance metric entry directly to the Firebase Firestore database.
 * Executes on client-side only.
 */
export async function logPerformanceMetric(
  name: string,
  value: number,
  status: "success" | "error" = "success",
  metadata: Record<string, any> = {}
) {
  if (typeof window === "undefined") return;

  try {
    const currentUser = auth.currentUser;
    const userAgent = navigator.userAgent;

    // Extract basic browser information
    let browser = "Other";
    if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
    else if (userAgent.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
    else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) browser = "Opera";
    else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) browser = "Edge";
    else if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
    else if (userAgent.indexOf("Safari") > -1) browser = "Safari";

    const metricData: PerformanceMetric = {
      name,
      value: Math.round(value),
      status,
      uid: currentUser ? currentUser.uid : null,
      browser,
      timestamp: Date.now(),
      metadata: {
        path: window.location.pathname,
        ...metadata
      }
    };

    const metricsCol = collection(db, "performance_metrics");
    await addDoc(metricsCol, metricData);
  } catch (err) {
    // Fail silently, avoid impacting user workflow
    console.warn("Performance logging failed:", err);
  }
}

/**
 * Custom React Hook that automatically calculates component/page mount duration
 * and logs it as a performance metric in Firestore.
 */
export function usePagePerformanceLogger(pageName: string) {
  useEffect(() => {
    const start = performance.now();

    // Use a window load check or mount completion metric
    const handleMeasurement = () => {
      // Calculate paint/mount delay in milliseconds
      const duration = performance.now() - start;
      logPerformanceMetric(`page_load_${pageName}`, duration);
    };

    // If document is already fully loaded, run immediately
    if (document.readyState === "complete") {
      // Small timeout to let rendering finish
      const timer = setTimeout(handleMeasurement, 100);
      return () => clearTimeout(timer);
    } else {
      window.addEventListener("load", handleMeasurement);
      return () => window.removeEventListener("load", handleMeasurement);
    }
  }, [pageName]);
}
