"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function AgentHarness() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative p-10 border border-gray-200 bg-white shadow-xl rounded-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border border-emerald-200 flex items-center justify-center rounded-full"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </motion.div>
          </div>
          <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-gray-500 font-bold">Tensorlake</span>
        </div>
        <div className="flex gap-1.5">
          {[...Array(3)].map((_, i) => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              className="w-1 h-1 bg-emerald-500/40 rounded-full" 
            />
          ))}
        </div>
      </div>

      {/* Main Container */}
      <div className="border border-gray-200 p-6 relative bg-gray-50/50 rounded-lg">
        <div className="absolute -top-2.5 left-6 bg-white border border-gray-100 px-3 text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold rounded-full shadow-sm">
          Agent Runtime
        </div>
        
        {/* Grid Layout */}
        <div className="grid grid-cols-3 gap-6 h-56 w-80 relative">
          {/* Side Modules */}
          <div className="flex flex-col gap-4">
            <div className="h-1/2 border border-gray-200 bg-white flex items-center justify-center relative overflow-hidden rounded-md shadow-sm">
               <motion.div 
                 animate={{ y: ["-100%", "100%"] }}
                 transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-px bg-emerald-500/10"
               />
               <div className="w-8 h-4 border border-gray-100 rounded-sm" />
            </div>
            <div className="h-1/2 border border-gray-200 bg-white p-2 flex flex-col gap-1 rounded-md shadow-sm">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-1 bg-gray-100 w-full rounded-full" />
              ))}
            </div>
          </div>

          {/* Core Module */}
          <div className="flex flex-col gap-4">
             <div className="h-1/3 border border-gray-200 bg-white flex items-center justify-center rounded-md shadow-sm">
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2.5 h-2.5 bg-emerald-500/40 rounded-full blur-[1px]"
                />
             </div>
             <div className="h-2/3 border border-emerald-100 flex items-center justify-center text-center p-4 relative overflow-hidden bg-emerald-50/30 rounded-md shadow-sm">
                <motion.div 
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500"
                />
                <span className="text-[10px] leading-relaxed uppercase relative z-10 font-bold tracking-[0.2em] text-emerald-700">Agent<br/>Harness</span>
                
                {/* Core pulse rings */}
                {[...Array(2)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                    transition={{ duration: 2, delay: i * 1, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 border border-emerald-500/20 rounded-md"
                  />
                ))}
             </div>
          </div>

          {/* Right Modules */}
          <div className="flex flex-col gap-4">
            <div className="h-2/3 border border-gray-200 bg-white p-3 flex flex-col justify-between rounded-md shadow-sm">
              <div className="flex justify-between">
                <div className="w-1 h-1 bg-emerald-500/30 rounded-full" />
                <div className="w-1 h-1 bg-emerald-500/30 rounded-full" />
              </div>
              <div className="h-px bg-gray-100 w-full" />
              <div className="flex justify-between">
                <div className="w-1 h-1 bg-emerald-500/30 rounded-full" />
                <div className="w-1 h-1 bg-emerald-500/30 rounded-full" />
              </div>
            </div>
            <div className="h-1/3 border border-gray-200 bg-white flex items-center justify-center rounded-md shadow-sm">
              <motion.div 
                animate={{ rotate: 45 }}
                className="w-5 h-5 border border-gray-200 rounded-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
