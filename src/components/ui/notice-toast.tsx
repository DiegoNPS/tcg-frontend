"use client";

import { useEffect, useState } from "react";

type NoticeTone = "success" | "warning" | "error" | "info";

type NoticeToastProps = {
  message: string;
  tone?: NoticeTone;
  durationMs?: number;
};

const toneStyles: Record<NoticeTone, { container: string; dot: string }> = {
  success: {
    container:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 text-emerald-900",
    dot: "bg-emerald-500",
  },
  warning: {
    container:
      "border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 text-amber-900",
    dot: "bg-amber-500",
  },
  error: {
    container:
      "border-rose-200 bg-gradient-to-br from-rose-50 via-white to-rose-100/60 text-rose-900",
    dot: "bg-rose-500",
  },
  info: {
    container:
      "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-sky-100/60 text-sky-900",
    dot: "bg-sky-500",
  },
};

export function NoticeToast({ message, tone = "info", durationMs = 6000 }: NoticeToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-6 z-50 flex justify-center sm:inset-x-auto sm:right-6 sm:left-auto">
      <div
        className={`toast-enter pointer-events-auto w-full max-w-md rounded-2xl border px-4 py-3 shadow-lg ${toneStyles[tone].container}`}
        role={tone === "error" ? "alert" : "status"}
        aria-live={tone === "error" ? "assertive" : "polite"}
      >
        <div className="flex items-start gap-3">
          <span className={`mt-1 h-2.5 w-2.5 rounded-full ${toneStyles[tone].dot}`} />
          <p className="flex-1 text-sm font-semibold leading-relaxed">{message}</p>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-full px-2 py-1 text-xs font-semibold text-current/70 transition hover:text-current"
            aria-label="Cerrar notificación"
          >
            Cerrar
          </button>
        </div>
      </div>

      <style jsx>{`
        .toast-enter {
          animation: toast-in 280ms ease-out;
        }
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .toast-enter {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
