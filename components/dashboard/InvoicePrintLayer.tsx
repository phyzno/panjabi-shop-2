"use client";

import React, { useEffect, useRef } from "react";
import PrintableInvoice from "@/components/admin/dashboard/PrintableInvoice";
import type { Order } from "@/components/admin/dashboard/order.types";

type InvoicePrintLayerProps = {
  order: Order | null;
  onAfterPrint: () => void;
};

const waitForFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

async function waitForInvoiceRender() {
  try {
    await document.fonts?.ready;
  } catch {
  }

  await waitForFrame();
  await waitForFrame();
  await wait(150);
}

export default function InvoicePrintLayer({ order, onAfterPrint }: InvoicePrintLayerProps) {
  const onAfterPrintRef = useRef(onAfterPrint);

  useEffect(() => {
    onAfterPrintRef.current = onAfterPrint;
  }, [onAfterPrint]);

  useEffect(() => {
    if (!order) return;

    const originalTitle = document.title;
    let cleanupTimer: number | undefined;
    let fallbackTimer: number | undefined;
    let cleanupAt = 0;
    let printStarted = false;
    let cleanedUp = false;

    const cleanup = (delayMs: number) => {
      if (cleanedUp) return;

      const nextCleanupAt = Date.now() + delayMs;
      if (cleanupTimer && cleanupAt >= nextCleanupAt) return;

      cleanupAt = nextCleanupAt;
      window.clearTimeout(cleanupTimer);
      cleanupTimer = window.setTimeout(() => {
        if (cleanedUp) return;

        cleanedUp = true;
        document.title = originalTitle;
        document.body.classList.remove("invoice-printing");
        onAfterPrintRef.current();
      }, delayMs);
    };

    const handleAfterPrint = () => {
      cleanup(2500);
    };

    const handleFocus = () => {
      if (printStarted) cleanup(1200);
    };

    const handleVisibilityChange = () => {
      if (printStarted && document.visibilityState === "visible") {
        cleanup(1200);
      }
    };

    const startPrint = async () => {
      document.title = `invoice-${order.id}`;
      document.body.classList.add("invoice-printing");
      await waitForInvoiceRender();

      if (cleanedUp) return;

      printStarted = true;
      window.print();
      fallbackTimer = window.setTimeout(() => cleanup(0), 120000);
    };

    window.addEventListener("afterprint", handleAfterPrint);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    startPrint();

    return () => {
      cleanedUp = true;
      document.title = originalTitle;
      document.body.classList.remove("invoice-printing");
      window.clearTimeout(cleanupTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("afterprint", handleAfterPrint);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [order]);

  if (!order) return null;

  return (
    <div className="invoice-print-root fixed inset-0 z-[9999] bg-white overflow-auto">
      <PrintableInvoice order={order} />
    </div>
  );
}
