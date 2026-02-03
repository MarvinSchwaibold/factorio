"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCw, ShieldCheck, Check } from "lucide-react";

export type TaskStatus = "pending" | "active" | "failed" | "restarting" | "completed";

interface TaskItemProps {
  label: string;
  status: TaskStatus;
  subtext?: string;
  isDurable?: boolean;
}

export function TaskItem({ label, status, subtext, isDurable }: TaskItemProps) {
  const isFailed = status === "failed";
  const isRestarting = status === "restarting";
  const isCompleted = status === "completed";
  const isActive = status === "active" || isRestarting;

  return (
    <div className="flex flex-col gap-0 relative">
      {/* Status Header (Floating) */}
      <AnimatePresence mode="wait">
        {(isFailed || isRestarting) && (
          <motion.div
            initial={{ opacity: 0, y: 4, x: 8 }}
            animate={{ opacity: 1, y: -10, x: 8 }}
            exit={{ opacity: 0, y: 4, x: 8 }}
            className={cn(
              "absolute z-20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm rounded-full",
              isFailed ? "bg-red-50 text-red-600 border border-red-100" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
            )}
          >
            {isRestarting && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
            {isFailed && <AlertCircle className="w-2.5 h-2.5" />}
            {isRestarting ? "Restarting" : "Open Failed"}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout
        className={cn(
          "relative px-4 py-3 border transition-all duration-500 min-w-[300px] rounded-lg",
          isFailed ? "border-red-200 bg-red-50/50 shadow-sm" : 
          (isRestarting || isDurable) ? "border-cyan-200 bg-cyan-50/50 shadow-sm" :
          isCompleted ? "border-emerald-200 bg-emerald-50/50" :
          isActive ? "border-emerald-500 bg-white shadow-md ring-1 ring-emerald-100" :
          "border-gray-200 bg-white shadow-sm"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Indicator Grid */}
            <div className="w-4 h-4 flex items-center justify-center">
              {isCompleted ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : isActive ? (
                <div className="grid grid-cols-2 gap-0.5">
                  {[...Array(4)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                      className={cn("w-1 h-1 rounded-full", isRestarting ? "bg-cyan-500" : "bg-emerald-500")} 
                    />
                  ))}
                </div>
              ) : isFailed ? (
                <div className="w-1.5 h-1.5 bg-red-500 rotate-45" />
              ) : (
                <div className="w-1 h-1 bg-gray-300 rounded-full" />
              )}
            </div>
            
            <span className={cn(
              "text-[11px] font-mono uppercase tracking-[0.15em] font-medium",
              isFailed ? "text-red-600" : (isRestarting || isDurable) ? "text-cyan-600" : isActive ? "text-emerald-700" : "text-gray-500"
            )}>{label}</span>
          </div>
        </div>

        {/* Durable Execution Sub-pane */}
        <AnimatePresence>
          {isDurable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-cyan-100 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-cyan-500" />
                <span className="text-[9px] text-cyan-600 uppercase tracking-[0.2em] font-bold">Durable Execution</span>
              </div>
              <motion.div 
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-cyan-500"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Connection Dot */}
        <div className={cn(
          "absolute left-[-2.1rem] top-1/2 -translate-y-1/2 w-2 h-2 border border-white z-30 transition-colors duration-500 rounded-full shadow-sm",
          isFailed ? "bg-red-500" : (isRestarting || isDurable) ? "bg-cyan-500" : isActive ? "bg-emerald-500" : "bg-gray-300"
        )} />
      </motion.div>
    </div>
  );
}
