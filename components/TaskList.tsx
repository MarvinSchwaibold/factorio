"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TaskItem, TaskStatus } from "./TaskItem";
import { cn } from "@/lib/utils";

interface TaskListProps {
  flowState: {
    status: TaskStatus;
    isDurableText: boolean;
    color: string;
  };
}

export default function TaskList({ flowState }: TaskListProps) {
  const isError = flowState.status === "failed";
  const isRestarting = flowState.status === "restarting";

  return (
    <div className="flex flex-col gap-8 relative pl-12">
      {/* Main Vertical Timeline */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
      
      {/* Energy Flow Connector */}
      <div className="absolute left-[-4rem] top-1/2 -translate-y-1/2 w-16 h-px bg-gray-200">
        {/* Connection Points */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white border border-gray-300 z-10 rounded-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white border border-gray-300 z-10 rounded-full" />

        {/* Animated energy pulse */}
        <motion.div 
          animate={{ 
            left: ["0%", "100%"],
            opacity: [0, 1, 0]
          }}
          transition={{ 
            duration: 1.2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={cn(
            "absolute top-1/2 -translate-y-1/2 w-8 h-[2px] blur-[1px]",
            isError ? "bg-red-500" : 
            isRestarting ? "bg-cyan-400" :
            "bg-emerald-400"
          )}
        />
      </div>

      {/* Main Task Item */}
      <div className="relative">
        {/* Horizontal branch line */}
        <div className="absolute left-[-3rem] top-1/2 w-12 h-px bg-gray-200" />
        
        <TaskItem 
          label="[Browser Tool]" 
          status={flowState.status}
          isDurable={flowState.isDurableText}
        />
      </div>

      {/* Sub-tasks */}
      <div className="flex flex-col gap-4 opacity-60">
        <div className="relative">
          <div className="absolute left-[-3rem] top-1/2 w-12 h-px bg-gray-200 border-t border-dashed border-gray-300" />
          <TaskItem 
            label="[Download from sec.gov]" 
            status="pending"
          />
        </div>
        <div className="relative">
          <div className="absolute left-[-3rem] top-1/2 w-12 h-px bg-gray-200 border-t border-dashed border-gray-300" />
          <TaskItem 
            label="[Get Structured Data]" 
            status="pending"
          />
        </div>
      </div>
    </div>
  );
}
