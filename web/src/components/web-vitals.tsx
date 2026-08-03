"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Field measurement of Core Web Vitals.
 *
 * Lighthouse in CI measures synthetic lab conditions on CI hardware. That
 * catches regressions but says nothing about what real visitors experience on
 * their own devices and networks, which is what the metrics actually grade.
 *
 * There is no analytics vendor wired up yet, so this currently posts to an
 * own-origin endpoint (`connect-src 'self'` in the CSP already permits it and
 * nothing else). Swapping in a real sink later is a one-line change here.
 *
 * `sendBeacon` is used where available because it survives page unload, which
 * matters for metrics that finalise as the user navigates away.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      id: metric.id,
      path: window.location.pathname,
    });

    if (process.env.NODE_ENV === "development") {
      // Keeps the local signal visible without generating requests.
      console.debug("[web-vitals]", metric.name, Math.round(metric.value), metric.rating);
      return;
    }

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/vitals", body);
      } else {
        void fetch("/api/vitals", { body, method: "POST", keepalive: true });
      }
    } catch {
      // Reporting must never break the page it is measuring.
    }
  });

  return null;
}
