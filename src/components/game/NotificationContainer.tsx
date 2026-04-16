"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/store/notification-store";
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from "lucide-react";

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: "bg-green-50", border: "border-green-400", icon: "text-green-600" },
  info: { bg: "bg-blue-50", border: "border-blue-400", icon: "text-blue-600" },
  warning: { bg: "bg-amber-50", border: "border-amber-400", icon: "text-amber-600" },
  error: { bg: "bg-red-50", border: "border-red-400", icon: "text-red-600" },
};

const SEVERITY_ICONS: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function NotificationContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => {
          const style = SEVERITY_STYLES[n.severity] || SEVERITY_STYLES.info;
          const IconComponent = SEVERITY_ICONS[n.severity] || Info;

          return (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: n.dismissed ? 0 : 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`pointer-events-auto ${style.bg} ${style.border} border-2 rounded-xl shadow-[3px_3px_0_0_#000] p-3 flex items-start gap-2`}
            >
              {/* Emoji or icon */}
              <span className="text-base shrink-0">{n.emoji}</span>

              {/* Message */}
              <p className="text-[11px] font-bold text-stone-700 flex-1 leading-tight">
                {n.message}
              </p>

              {/* Dismiss button */}
              <button
                onClick={() => dismissNotification(n.id)}
                className="shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}