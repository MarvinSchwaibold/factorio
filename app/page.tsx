"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3x3 } from "lucide-react";
import { Toggle } from "@base-ui/react/toggle";
import { theme, ThemeContext } from "@/lib/theme";
import type { Task, SubWorkflowTask, WorkflowState } from "@/lib/types";
import {
  GRID_SIZE, WIDGET_GAP, TASK_ROW_HEIGHT, TASK_CONNECTION_Y,
  AGENT_CENTER_Y, CONNECTION_LINE_Y, CONNECTION_WIDTH, CONNECTION_BEND_X,
  scenarios, initialWorkflowState, cleanLabels, cleanSubtexts
} from "@/lib/constants";
import {
  EnergyDot, ServerRack, LiveStatusWidget, CompletedTaskWidget,
  TaskWidget, WorkflowBranchContainer, EmailPreviewPanel,
  InsightsPreviewPanel, SubWorkflowPanel
} from "@/components/workflow";
import { useWorkflow } from "@/hooks/useWorkflow";
import { SideNav, SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from "@/components/SideNav";
import { CommerceView } from "@/components/CommerceView";
import { InsightsView } from "@/components/InsightsView";
import { ActivityView } from "@/components/ActivityView";
import { SettingsView } from "@/components/SettingsView";
import { HomeView } from "@/components/HomeView";
import { InboxView } from "@/components/InboxView";
import { InlineChat } from "@/components/InlineChat";

export default function Home() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const startPanRef = useRef({ x: 0, y: 0 });
  const panRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [leftWorkflow, setLeftWorkflow, leftHandlers] = useWorkflow("left");
  const [rightWorkflow, setRightWorkflow, rightHandlers] = useWorkflow("right");

  const [deepCleanMode, setDeepCleanMode] = useState<"idle" | "running" | "collapsing" | "complete">("idle");
  const deepCleanTaskCounterRef = useRef({ left: 0, right: 0 });
  const [autoPilot, setAutoPilot] = useState(false);
  const autoPilotTimerRef = useRef<{ left: NodeJS.Timeout | null; right: NodeJS.Timeout | null }>({ left: null, right: null });
  const [activeCanvas, setActiveCanvas] = useState<"home" | "inbox" | "canvas" | "blueprint" | "commerce" | "insights" | "activity" | "settings">("home");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sidebarWidth = sidebarExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const accentColor = theme.accent;

  const zoomSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const scrollAmount = Math.abs(e.deltaY);
    const sensitivity = 0.001;
    const zoomFactor = 1 + (scrollAmount * sensitivity);
    const delta = e.deltaY > 0 ? 1 / zoomFactor : zoomFactor;
    const oldZoom = zoomRef.current;
    const newZoom = Math.min(Math.max(oldZoom * delta, 0.25), 3);

    const rect = e.currentTarget.getBoundingClientRect();
    const viewportCenterX = rect.width / 2;
    const viewportCenterY = rect.height / 2;
    const mouseX = e.clientX - rect.left - viewportCenterX;
    const mouseY = e.clientY - rect.top - viewportCenterY;

    const zoomRatio = newZoom / oldZoom;
    const newPanX = mouseX - (mouseX - panRef.current.x) * zoomRatio;
    const newPanY = mouseY - (mouseY - panRef.current.y) * zoomRatio;

    zoomRef.current = newZoom;
    panRef.current = { x: newPanX, y: newPanY };

    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${newPanX}px, ${newPanY}px) scale(${newZoom})`;
    }

    if (zoomSyncTimeoutRef.current) {
      clearTimeout(zoomSyncTimeoutRef.current);
    }
    zoomSyncTimeoutRef.current = setTimeout(() => {
      setZoom(zoomRef.current);
      setPan(panRef.current);
    }, 150);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      isPanningRef.current = true;
      setIsPanning(true);
      startPanRef.current = { x: e.clientX - panRef.current.x, y: e.clientY - panRef.current.y };
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanningRef.current) {
      const newX = e.clientX - startPanRef.current.x;
      const newY = e.clientY - startPanRef.current.y;
      panRef.current = { x: newX, y: newY };

      if (canvasRef.current) {
        canvasRef.current.style.transform = `translate(${newX}px, ${newY}px) scale(${zoomRef.current})`;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
      setPan(panRef.current);
    }
  }, []);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`;
    }
  }, []);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  // Auto-pilot: automatically handle approvals and resolves
  useEffect(() => {
    if (!autoPilot) {
      if (autoPilotTimerRef.current.left) clearTimeout(autoPilotTimerRef.current.left);
      if (autoPilotTimerRef.current.right) clearTimeout(autoPilotTimerRef.current.right);
      autoPilotTimerRef.current = { left: null, right: null };
      return;
    }

    if (leftWorkflow.isRunning) {
      const needsApproval = leftWorkflow.tasks.some(t => t.status === "needs_approval");
      const needsResolve = leftWorkflow.tasks.some(t => t.status === "needs_resolve");
      const hasSubWorkflow = leftWorkflow.subWorkflowActive && (leftWorkflow.resolveType === "email_copy" || leftWorkflow.resolveType === "insights" || leftWorkflow.resolveType === "product_descriptions");

      if (needsApproval && !autoPilotTimerRef.current.left) {
        autoPilotTimerRef.current.left = setTimeout(() => {
          leftHandlers.handleApprove();
          autoPilotTimerRef.current.left = null;
        }, 800);
      } else if (needsResolve && !autoPilotTimerRef.current.left) {
        autoPilotTimerRef.current.left = setTimeout(() => {
          leftHandlers.handleResolve();
          autoPilotTimerRef.current.left = null;
        }, 800);
      } else if (hasSubWorkflow && leftWorkflow.awaitingApproval && !autoPilotTimerRef.current.left) {
        autoPilotTimerRef.current.left = setTimeout(() => {
          leftHandlers.handleApprovePreview();
          autoPilotTimerRef.current.left = null;
        }, 1200);
      }
    }

    if (rightWorkflow.isRunning) {
      const needsApproval = rightWorkflow.tasks.some(t => t.status === "needs_approval");
      const needsResolve = rightWorkflow.tasks.some(t => t.status === "needs_resolve");
      const hasSubWorkflow = rightWorkflow.subWorkflowActive && (rightWorkflow.resolveType === "email_copy" || rightWorkflow.resolveType === "insights" || rightWorkflow.resolveType === "product_descriptions");

      if (needsApproval && !autoPilotTimerRef.current.right) {
        autoPilotTimerRef.current.right = setTimeout(() => {
          rightHandlers.handleApprove();
          autoPilotTimerRef.current.right = null;
        }, 800);
      } else if (needsResolve && !autoPilotTimerRef.current.right) {
        autoPilotTimerRef.current.right = setTimeout(() => {
          rightHandlers.handleResolve();
          autoPilotTimerRef.current.right = null;
        }, 800);
      } else if (hasSubWorkflow && rightWorkflow.awaitingApproval && !autoPilotTimerRef.current.right) {
        autoPilotTimerRef.current.right = setTimeout(() => {
          rightHandlers.handleApprovePreview();
          autoPilotTimerRef.current.right = null;
        }, 1200);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPilot, leftWorkflow, rightWorkflow]);

  // Auto-collapse workflows when all tasks are completed
  useEffect(() => {
    if (leftWorkflow.isRunning && !leftWorkflow.isCompleted && !leftWorkflow.isCollapsing) {
      const allTasksCompleted = leftWorkflow.tasks.length > 0 && leftWorkflow.tasks.every(t => t.status === "completed");
      const noSubWorkflow = !leftWorkflow.subWorkflowActive;
      const notAwaiting = !leftWorkflow.awaitingApproval;

      if (allTasksCompleted && noSubWorkflow && notAwaiting) {
        setTimeout(() => {
          setLeftWorkflow(prev => {
            if (prev.isCompleted || prev.isCollapsing) return prev;

            setTimeout(() => {
              setLeftWorkflow(p => ({ ...p, tasks: [], isCollapsing: false, isCompleted: true, isRunning: false, currentScenarioLabel: "" }));
            }, 400);

            return { ...prev, completedScenarioLabel: prev.currentScenarioLabel || "Workflow", isCollapsing: true };
          });
        }, 500);
      }
    }

    if (rightWorkflow.isRunning && !rightWorkflow.isCompleted && !rightWorkflow.isCollapsing) {
      const allTasksCompleted = rightWorkflow.tasks.length > 0 && rightWorkflow.tasks.every(t => t.status === "completed");
      const noSubWorkflow = !rightWorkflow.subWorkflowActive;
      const notAwaiting = !rightWorkflow.awaitingApproval;

      if (allTasksCompleted && noSubWorkflow && notAwaiting) {
        setTimeout(() => {
          setRightWorkflow(prev => {
            if (prev.isCompleted || prev.isCollapsing) return prev;

            setTimeout(() => {
              setRightWorkflow(p => ({ ...p, tasks: [], isCollapsing: false, isCompleted: true, isRunning: false, currentScenarioLabel: "" }));
            }, 400);

            return { ...prev, completedScenarioLabel: prev.currentScenarioLabel || "Workflow", isCollapsing: true };
          });
        }, 500);
      }
    }
  }, [leftWorkflow, rightWorkflow, setLeftWorkflow, setRightWorkflow]);

  // Deep Clean effect
  useEffect(() => {
    if (deepCleanMode !== "running") return;

    const timeouts: NodeJS.Timeout[] = [];
    const CLEAN_DURATION = 9000;
    const taskIds: { left: string[]; right: string[] } = { left: [], right: [] };

    const spawnCleanTask = (side: "left" | "right") => {
      const setWorkflow = side === "left" ? setLeftWorkflow : setRightWorkflow;
      const counter = deepCleanTaskCounterRef.current[side]++;
      const taskId = `clean-${side}-${counter}`;
      taskIds[side].push(taskId);

      const newTask: Task = {
        id: taskId,
        label: cleanLabels[Math.floor(Math.random() * cleanLabels.length)],
        subtext: cleanSubtexts[Math.floor(Math.random() * cleanSubtexts.length)],
        status: "working",
        requiresApproval: false,
        requiresResolve: false
      };

      setWorkflow(prev => {
        if (prev.isCollapsing || prev.isCompleted) return prev;
        return { ...prev, tasks: [...prev.tasks, newTask], isRunning: true, lineProgress: 1 };
      });

      const duration = 1000 + Math.random() * 1800;
      const randomOutcome = Math.random();
      const shouldFail = randomOutcome < 0.08;
      const shouldRewrite = randomOutcome >= 0.08 && randomOutcome < 0.55;

      if (shouldFail) {
        const t1 = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "failed" as const, subtext: "Retry needed" } : t)
          }));
          const t2 = setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "fixing" as const, subtext: "Retrying..." } : t)
            }));
            const t3 = setTimeout(() => {
              setWorkflow(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "completed" as const, subtext: "Fixed" } : t)
              }));
            }, 700);
            timeouts.push(t3);
          }, 500);
          timeouts.push(t2);
        }, duration * 0.4);
        timeouts.push(t1);
      } else if (shouldRewrite) {
        const t1 = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "rewriting" as const, subtext: "Restructuring..." } : t)
          }));
          const t2 = setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "working" as const, subtext: "Rebuilding..." } : t)
            }));
            const t3 = setTimeout(() => {
              setWorkflow(prev => ({
                ...prev,
                tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "completed" as const, subtext: "Rebuilt" } : t)
              }));
            }, 2500);
            timeouts.push(t3);
          }, 4000);
          timeouts.push(t2);
        }, duration * 0.5);
        timeouts.push(t1);
      } else {
        const t = setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: "completed" as const, subtext: "Cleaned" } : t)
          }));
        }, duration);
        timeouts.push(t);
      }
    };

    // Initialize workflows
    setLeftWorkflow({ ...initialWorkflowState, isRunning: true, lineProgress: 1 });
    setRightWorkflow({ ...initialWorkflowState, isRunning: true, lineProgress: 1 });

    let spawnCount = 0;
    const maxSpawns = 8;

    const scheduleSpawn = (side: "left" | "right", delay: number) => {
      const t = setTimeout(() => {
        if (deepCleanMode === "running" && spawnCount < maxSpawns * 2) {
          spawnCleanTask(side);
          spawnCount++;
          const nextDelay = 300 + Math.random() * 400;
          if (spawnCount < maxSpawns * 2) {
            scheduleSpawn(side === "left" ? "right" : "left", nextDelay);
          }
        }
      }, delay);
      timeouts.push(t);
    };

    scheduleSpawn("left", 200);
    scheduleSpawn("right", 400);

    const collapseTimeout = setTimeout(() => {
      setDeepCleanMode("collapsing");

      setLeftWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));
      setRightWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));

      setTimeout(() => {
        setLeftWorkflow(prev => ({
          ...prev,
          subWorkflowActive: false,
          subWorkflowCollapsing: false,
          subWorkflowTasks: [],
          isCollapsing: true
        }));
        setRightWorkflow(prev => ({
          ...prev,
          subWorkflowActive: false,
          subWorkflowCollapsing: false,
          subWorkflowTasks: [],
          isCollapsing: true
        }));

        setTimeout(() => {
          setLeftWorkflow(prev => ({
            ...initialWorkflowState,
            deepCleanComplete: true,
            currentScenarioLabel: "DEEP CLEAN",
          }));
          setRightWorkflow(prev => ({
            ...initialWorkflowState,
            deepCleanComplete: true,
            currentScenarioLabel: "DEEP CLEAN",
          }));
          setDeepCleanMode("complete");

          setTimeout(() => {
            setLeftWorkflow(initialWorkflowState);
            setRightWorkflow(initialWorkflowState);
            setDeepCleanMode("idle");
          }, 2500);
        }, 800);
      }, 400);
    }, CLEAN_DURATION);
    timeouts.push(collapseTimeout);

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [deepCleanMode, setLeftWorkflow, setRightWorkflow]);

  const startDeepClean = () => {
    if (deepCleanMode !== "idle") return;

    setLeftWorkflow(initialWorkflowState);
    setRightWorkflow(initialWorkflowState);
    deepCleanTaskCounterRef.current = { left: 0, right: 0 };
    setDeepCleanMode("running");
  };

  const numDots = 3;
  const cycleDuration = 2.5;

  const anyRunning = leftWorkflow.isRunning || rightWorkflow.isRunning;
  const anyTasks = leftWorkflow.tasks.length > 0 || rightWorkflow.tasks.length > 0;
  const anyCompleted = leftWorkflow.isCompleted || rightWorkflow.isCompleted;

  return (
    <ThemeContext.Provider value={theme}>
    <div className="h-screen w-screen overflow-hidden relative flex flex-col" style={{ background: "#f5f5f5", fontFamily: theme.fontFamily }}>

      {/* Side Navigation */}
      <SideNav activeView={activeCanvas} onViewChange={(view) => setActiveCanvas(view as typeof activeCanvas)} isExpanded={sidebarExpanded} onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)} />

      {/* Fixed UI Elements - Only on main canvas */}
      {activeCanvas === "canvas" && <LiveStatusWidget
        leftWorkflow={{
          tasks: leftWorkflow.tasks,
          isRunning: leftWorkflow.isRunning,
          subWorkflowActive: leftWorkflow.subWorkflowActive,
          subWorkflowTasks: leftWorkflow.subWorkflowTasks,
          isCompleted: leftWorkflow.isCompleted
        }}
        rightWorkflow={{
          tasks: rightWorkflow.tasks,
          isRunning: rightWorkflow.isRunning,
          subWorkflowActive: rightWorkflow.subWorkflowActive,
          subWorkflowTasks: rightWorkflow.subWorkflowTasks,
          isCompleted: rightWorkflow.isCompleted
        }}
        deepCleanMode={deepCleanMode}
      />}

      {/* Zoom Controls - only on canvas/blueprint */}
      {(activeCanvas === "canvas" || activeCanvas === "blueprint") && <div style={{ position: "fixed", top: 20, left: sidebarWidth + 20, display: "flex", alignItems: "center", gap: 8, zIndex: 1000, background: "white", border: `1px solid ${theme.borderLight}`, padding: "6px 8px", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)" }}>
        <button onClick={resetView} style={{ background: "transparent", border: "none", color: theme.textMuted, padding: "6px 10px", fontSize: 11, cursor: "pointer", fontFamily: theme.fontFamily, fontWeight: 500, letterSpacing: "0.02em" }}>Reset</button>
        <div style={{ width: 1, height: 16, background: theme.borderLight }} />
        <button onClick={() => { zoomRef.current = Math.max(zoomRef.current * 0.8, 0.25); if (canvasRef.current) canvasRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`; setZoom(zoomRef.current); }} style={{ background: "transparent", border: "none", color: theme.text, padding: "6px 8px", fontSize: 13, cursor: "pointer", fontFamily: theme.fontFamily, fontWeight: 500, lineHeight: 1 }}>−</button>
        <span style={{ color: theme.textMuted, fontSize: 11, fontFamily: theme.fontFamily, minWidth: 36, textAlign: "center", fontWeight: 500 }}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => { zoomRef.current = Math.min(zoomRef.current * 1.2, 3); if (canvasRef.current) canvasRef.current.style.transform = `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`; setZoom(zoomRef.current); }} style={{ background: "transparent", border: "none", color: theme.text, padding: "6px 8px", fontSize: 13, cursor: "pointer", fontFamily: theme.fontFamily, fontWeight: 500, lineHeight: 1 }}>+</button>
        <div style={{ width: 1, height: 16, background: theme.borderLight }} />
        <button
          onClick={() => {
            if (activeCanvas === "blueprint") {
              setActiveCanvas("canvas");
              setZoom(1);
              setPan({ x: 0, y: 0 });
              zoomRef.current = 1;
              panRef.current = { x: 0, y: 0 };
            } else {
              setActiveCanvas("blueprint");
              setZoom(0.55);
              setPan({ x: 0, y: 0 });
              zoomRef.current = 0.55;
              panRef.current = { x: 0, y: 0 };
            }
            if (canvasRef.current) {
              canvasRef.current.style.transform = `translate(0px, 0px) scale(${activeCanvas === "blueprint" ? 1 : 0.55})`;
            }
          }}
          style={{
            background: activeCanvas === "blueprint" ? "rgba(13, 148, 136, 0.08)" : "transparent",
            border: "none",
            color: activeCanvas === "blueprint" ? theme.accent : theme.textMuted,
            padding: "6px 8px",
            cursor: "pointer",
            fontFamily: theme.fontFamily,
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 4,
            transition: "all 0.15s ease",
          }}
        >
          <Grid3x3 size={14} />
          Blueprint
        </button>
      </div>}

      {/* Main Canvas */}
      {activeCanvas === "canvas" && (
      <div style={{ marginLeft: sidebarWidth, transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)", height: "100vh", overflow: "hidden", padding: 8, display: "flex" }}>
      <div
        className="flex-1 relative overflow-hidden"
        style={{ cursor: isPanning ? "grabbing" : "grab", background: "#ffffff", borderRadius: 12, border: "1px solid #e5e5e5" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Canvas Content - zero-size anchor point, content positioned around it */}
        <div ref={canvasRef} style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, transformOrigin: "0 0", willChange: "transform", overflow: "visible" }}>
          {/* Grid - centered on the anchor point */}
          <div
            ref={gridRef}
            style={{
              position: "absolute",
              width: 10000,
              height: 10000,
              left: -5000,
              top: -5000,
              backgroundImage: theme.gridPattern,
              backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
              backgroundPosition: "0 0",
              pointerEvents: "none"
            }}
          />
          {/* Content wrapper - agent at center (0,0), workflows expand outward */}
          <div className="flex items-start" style={{ position: "absolute", top: -150, left: -800 }}>

            {/* LEFT WORKFLOW */}
            <div className="flex items-start">
              {/* Left Tasks (mirrored) - fixed width to prevent layout shifts */}
              <div className="flex flex-col" style={{ width: 400, marginRight: 0, minHeight: 300, alignItems: "flex-end", gap: 0 }}>
                <AnimatePresence mode="wait">
                  {/* Show completed widget ONLY after tasks are cleared */}
                  {leftWorkflow.isCompleted && leftWorkflow.completedScenarioLabel && (
                    <motion.div
                      key="left-completed-container"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      style={{ width: "100%", display: "flex", justifyContent: "flex-end", alignItems: "flex-start", marginBottom: WIDGET_GAP }}
                    >
                      <CompletedTaskWidget label={leftWorkflow.completedScenarioLabel} onClose={leftHandlers.resetWorkflow} mirrored />
                    </motion.div>
                  )}
                  {/* Show tasks while running/collapsing OR show clean complete state */}
                  {(!leftWorkflow.isCompleted && leftWorkflow.tasks.length > 0) || leftWorkflow.deepCleanComplete ? (
                    <motion.div
                      key="left-tasks-container"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                      className="flex"
                      style={{ alignItems: "flex-start", justifyContent: "flex-end", gap: 16 }}
                    >
                      {/* Sub-workflows appear on the LEFT (further from agent) */}
                      {!leftWorkflow.deepCleanComplete && (
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {leftWorkflow.subWorkflowActive && leftWorkflow.resolveType === "email_copy" && (
                            <EmailPreviewPanel isActive={leftWorkflow.subWorkflowActive} isCollapsing={leftWorkflow.subWorkflowCollapsing} onApprove={leftHandlers.handleApprovePreview} mirrored />
                          )}
                          {leftWorkflow.subWorkflowActive && leftWorkflow.resolveType === "insights" && (
                            <InsightsPreviewPanel isActive={leftWorkflow.subWorkflowActive} isCollapsing={leftWorkflow.subWorkflowCollapsing} onApprove={leftHandlers.handleApprovePreview} mirrored />
                          )}
                          {leftWorkflow.subWorkflowActive && leftWorkflow.resolveType !== "email_copy" && leftWorkflow.resolveType !== "insights" && (
                            <SubWorkflowPanel isActive={leftWorkflow.subWorkflowActive} tasks={leftWorkflow.subWorkflowTasks} isCollapsing={leftWorkflow.subWorkflowCollapsing} mirrored />
                          )}
                        </div>
                      )}

                      {/* Main tasks container */}
                      <WorkflowBranchContainer
                        scenarioLabel={leftWorkflow.currentScenarioLabel}
                        isActive={leftWorkflow.tasks.length > 0 || leftWorkflow.deepCleanComplete || false}
                        isCollapsing={leftWorkflow.isCollapsing}
                        isCleanComplete={leftWorkflow.deepCleanComplete || false}
                        mirrored
                      >
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {leftWorkflow.tasks.map((task, index) => (
                            <TaskWidget
                              key={task.id}
                              task={task}
                              onApprove={leftHandlers.handleApprove}
                              onReject={leftHandlers.handleReject}
                              onResolve={leftHandlers.handleResolve}
                              isCollapsing={leftWorkflow.isCollapsing && index !== 0}
                              collapseIndex={leftWorkflow.tasks.length - 1 - index}
                              mirrored
                            />
                          ))}
                        </div>
                      </WorkflowBranchContainer>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* Left Connection - lines go from agent (right) TO tasks (left) */}
              {(() => {
                const reviewTaskIndex = leftWorkflow.tasks.findIndex(t => t.status === "needs_approval" || t.status === "needs_resolve");
                const targetTaskIndex = reviewTaskIndex >= 0 ? reviewTaskIndex : Math.max(0, leftWorkflow.tasks.length - 1);
                const targetY = CONNECTION_LINE_Y + targetTaskIndex * TASK_ROW_HEIGHT;
                const hasReviewTask = reviewTaskIndex >= 0;

                const actualTasksHeight = leftWorkflow.tasks.length > 0
                  ? CONNECTION_LINE_Y + (leftWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT + 50
                  : 300;

                return (
                  <div className="relative" style={{ width: CONNECTION_WIDTH, height: Math.max(300, actualTasksHeight) }}>
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
                      {!leftWorkflow.isCollapsing && <motion.path d={`M ${CONNECTION_WIDTH} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${targetY} L 0 ${targetY}`} fill="none" stroke={leftWorkflow.isCompleted ? "rgba(16, 185, 129, 0.4)" : hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: leftWorkflow.lineProgress > 0 || leftWorkflow.isCompleted ? 1 : 0, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ pathLength: { duration: 0.6 }, opacity: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }} />}
                      {leftWorkflow.tasks.length > 1 && !leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && <motion.path d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y} L ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + (leftWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT}`} fill="none" stroke={theme.connectionLineDim} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} />}
                      {!leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && leftWorkflow.tasks.map((_, i) => <motion.path key={i} d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT} L 0 ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT}`} fill="none" stroke={i === targetTaskIndex && hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }} />)}
                    </svg>
                    {!leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && leftWorkflow.tasks.length > 0 && leftWorkflow.lineProgress > 0.3 && <motion.div initial={{ scale: 0, opacity: 0, y: 0 }} animate={leftWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], y: -12, filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1, y: 0 }} transition={leftWorkflow.isCollapsing ? { duration: 0.5, delay: 0.3 + leftWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity }} style={{ position: "absolute", left: CONNECTION_WIDTH - 3, top: AGENT_CENTER_Y - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {!leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && leftWorkflow.tasks.length > 0 && leftWorkflow.lineProgress > 0.6 && <motion.div initial={{ scale: 0, opacity: 0 }} animate={leftWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1 }} transition={leftWorkflow.isCollapsing ? { duration: 0.5, delay: 0.2 + leftWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity, delay: 0.2 }} style={{ position: "absolute", left: CONNECTION_BEND_X - 3, top: targetY - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {leftWorkflow.isCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} style={{ position: "absolute", left: -3, top: CONNECTION_LINE_Y - 6, width: 12, height: 12, borderRadius: 0, background: "#10b981", boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)" }} />}
                    {!leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && leftWorkflow.tasks.length > 0 && leftWorkflow.tasks.map((task, i) => <motion.div key={`node-${i}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ position: "absolute", left: -3, top: CONNECTION_LINE_Y - 3 + i * TASK_ROW_HEIGHT, width: 6, height: 6, borderRadius: 0, background: task.status === "needs_approval" || task.status === "needs_resolve" ? "#e07020" : task.status === "failed" ? "#ef4444" : task.status === "fixing" ? "#3b82f6" : task.status === "rewriting" ? "#a855f7" : task.status === "completed" ? "#10b981" : task.status === "working" ? accentColor : theme.dotDim, boxShadow: task.status === "needs_approval" || task.status === "needs_resolve" ? "0 0 8px #e07020" : task.status === "failed" ? "0 0 8px #ef4444" : task.status === "fixing" ? "0 0 8px #3b82f6" : task.status === "rewriting" ? "0 0 8px #a855f7" : task.status === "completed" ? "0 0 8px #10b981" : task.status === "working" ? theme.glowAccent : "none" }} />)}
                    {leftWorkflow.isRunning && !leftWorkflow.awaitingApproval && !leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && Array.from({ length: numDots }).map((_, i) => <EnergyDot key={`main-${i}`} delay={(i / numDots) * cycleDuration} color={hasReviewTask ? "#e07020" : accentColor} duration={cycleDuration} path={`M ${CONNECTION_WIDTH} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y}`} />)}
                    {leftWorkflow.isRunning && !leftWorkflow.awaitingApproval && !leftWorkflow.isCompleted && !leftWorkflow.isCollapsing && leftWorkflow.tasks.map((_, taskIndex) =>
                      Array.from({ length: 2 }).map((__, i) => <EnergyDot key={`branch-${taskIndex}-${i}`} delay={(i / 2) * 1.5 + taskIndex * 0.3} color={taskIndex === targetTaskIndex && hasReviewTask ? "#e07020" : accentColor} duration={1.5} path={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT} L 0 ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT}`} />)
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Agent Container */}
            <div className="relative p-6" style={{ border: `1px solid ${theme.border}`, background: theme.cardBg, borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "80px 140px 80px", gridTemplateRows: "60px 140px 60px", gap: 20, width: 340 }}>
                <ServerRack />
                <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 32, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>
                <ServerRack />
                <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 26, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>

                <div className="relative flex flex-col items-center justify-center" style={{ border: `1px solid ${theme.border}`, background: anyRunning ? "rgba(13, 148, 136, 0.06)" : "#f9fafb", borderRadius: 8 }}>
                  <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", width: 1, height: 10, background: theme.borderLight }} />
                  <div style={{ position: "absolute", bottom: -11, left: "50%", transform: "translateX(-50%)", width: 1, height: 10, background: theme.borderLight }} />
                  <div style={{ position: "absolute", left: -11, top: "50%", transform: "translateY(-50%)", width: 10, height: 1, background: theme.borderLight }} />
                  <div style={{ position: "absolute", right: -11, top: "50%", transform: "translateY(-50%)", width: 10, height: 1, background: theme.borderLight }} />
                  <div style={{ position: "absolute", top: 6, left: 6, width: 14, height: 14, borderTop: `2px solid ${theme.border}`, borderLeft: `2px solid ${theme.border}` }} />
                  <div style={{ position: "absolute", top: 6, right: 6, width: 14, height: 14, borderTop: `2px solid ${theme.border}`, borderRight: `2px solid ${theme.border}` }} />
                  <div style={{ position: "absolute", bottom: 6, left: 6, width: 14, height: 14, borderBottom: `2px solid ${theme.border}`, borderLeft: `2px solid ${theme.border}` }} />
                  <div style={{ position: "absolute", bottom: 6, right: 6, width: 14, height: 14, borderBottom: `2px solid ${theme.border}`, borderRight: `2px solid ${theme.border}` }} />
                  {anyRunning && <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ position: "absolute", inset: 0, border: `2px solid ${theme.border}` }} />}
                  <span style={{ fontSize: 13, letterSpacing: "0.06em", textAlign: "center", lineHeight: 1.5, color: theme.accent, fontWeight: 600, marginBottom: 8 }}>SIDEKICK<br />AGENT</span>
                  <Toggle
                    pressed={autoPilot}
                    onPressedChange={setAutoPilot}
                    className="autopilot-toggle"
                    style={(state) => ({
                      background: state.pressed ? "rgba(13, 148, 136, 0.12)" : "transparent",
                      border: `1px solid ${state.pressed ? "rgba(13, 148, 136, 0.4)" : "#d1d5db"}`,
                      color: state.pressed ? theme.accent : theme.textMuted,
                      padding: "3px 8px",
                      fontSize: 9,
                      cursor: "pointer",
                      fontFamily: theme.fontFamily,
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                      transition: "all 0.15s ease",
                      borderRadius: 4,
                    })}
                  >
                    {autoPilot ? "✓ AUTO PILOT" : "AUTO PILOT"}
                  </Toggle>
                </div>

                <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 26, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>
                <ServerRack />
                <div style={{ border: `1px solid ${theme.borderDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 32, height: 14, border: `1px solid ${theme.borderDim}` }} /></div>
                <ServerRack />
              </div>
            </div>

            {/* RIGHT WORKFLOW */}
            <div className="flex items-start">
              {/* Right Connection */}
              {(() => {
                const reviewTaskIndex = rightWorkflow.tasks.findIndex(t => t.status === "needs_approval" || t.status === "needs_resolve");
                const targetTaskIndex = reviewTaskIndex >= 0 ? reviewTaskIndex : Math.max(0, rightWorkflow.tasks.length - 1);
                const targetY = CONNECTION_LINE_Y + targetTaskIndex * TASK_ROW_HEIGHT;
                const hasReviewTask = reviewTaskIndex >= 0;

                const actualTasksHeight = rightWorkflow.tasks.length > 0
                  ? CONNECTION_LINE_Y + (rightWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT + 50
                  : 300;

                return (
                  <div className="relative" style={{ width: CONNECTION_WIDTH, height: Math.max(300, actualTasksHeight) }}>
                    <svg style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", overflow: "visible" }}>
                      {!rightWorkflow.isCollapsing && <motion.path d={`M 0 ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${targetY} L ${CONNECTION_WIDTH} ${targetY}`} fill="none" stroke={rightWorkflow.isCompleted ? "rgba(16, 185, 129, 0.4)" : hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: rightWorkflow.lineProgress > 0 || rightWorkflow.isCompleted ? 1 : 0, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ pathLength: { duration: 0.6 }, opacity: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }} />}
                      {rightWorkflow.tasks.length > 1 && !rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && <motion.path d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y} L ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + (rightWorkflow.tasks.length - 1) * TASK_ROW_HEIGHT}`} fill="none" stroke={theme.connectionLineDim} strokeWidth="1" strokeDasharray="4 4" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }} />}
                      {!rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && rightWorkflow.tasks.map((_, i) => <motion.path key={i} d={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT} L ${CONNECTION_WIDTH} ${CONNECTION_LINE_Y + i * TASK_ROW_HEIGHT}`} fill="none" stroke={i === targetTaskIndex && hasReviewTask ? "rgba(224, 112, 32, 0.5)" : theme.connectionLine} strokeWidth="1" initial={{ pathLength: 0, opacity: 1 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ pathLength: 0, opacity: 0 }} transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }} />)}
                    </svg>
                    {!rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && rightWorkflow.tasks.length > 0 && rightWorkflow.lineProgress > 0.3 && <motion.div initial={{ scale: 0, opacity: 0, y: 0 }} animate={rightWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], y: -12, filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1, y: 0 }} transition={rightWorkflow.isCollapsing ? { duration: 0.5, delay: 0.3 + rightWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity }} style={{ position: "absolute", left: -3, top: AGENT_CENTER_Y - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {!rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && rightWorkflow.tasks.length > 0 && rightWorkflow.lineProgress > 0.6 && <motion.div initial={{ scale: 0, opacity: 0 }} animate={rightWorkflow.isCollapsing ? { scale: [1, 1.3, 0], opacity: [1, 0.8, 0], filter: "blur(8px)" } : { scale: [1, 1.2, 1], opacity: 1 }} transition={rightWorkflow.isCollapsing ? { duration: 0.5, delay: 0.2 + rightWorkflow.tasks.length * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 1, repeat: Infinity, delay: 0.2 }} style={{ position: "absolute", left: CONNECTION_BEND_X - 3, top: targetY - 3, width: 6, height: 6, borderRadius: 0, background: hasReviewTask ? "#e07020" : accentColor, boxShadow: hasReviewTask ? "0 0 8px #e07020" : theme.glowAccent }} />}
                    {rightWorkflow.isCompleted && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }} style={{ position: "absolute", left: CONNECTION_WIDTH - 6, top: CONNECTION_LINE_Y - 6, width: 12, height: 12, borderRadius: 0, background: "#10b981", boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)" }} />}
                    {!rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && rightWorkflow.tasks.length > 0 && rightWorkflow.tasks.map((task, i) => <motion.div key={`node-${i}`} initial={{ scale: 0, opacity: 0, x: 0, y: 0 }} animate={rightWorkflow.isCollapsing ? { scale: [1, 1.4, 0], opacity: [1, 0.6, 0], x: 15, y: -8, filter: "blur(10px)" } : { scale: 1, opacity: 1, x: 0, y: 0 }} transition={rightWorkflow.isCollapsing ? { duration: 0.55, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] } : { duration: 0.3 }} style={{ position: "absolute", left: CONNECTION_WIDTH - 3, top: CONNECTION_LINE_Y - 3 + i * TASK_ROW_HEIGHT, width: 6, height: 6, borderRadius: 0, background: task.status === "needs_approval" || task.status === "needs_resolve" ? "#e07020" : task.status === "failed" ? "#ef4444" : task.status === "fixing" ? "#3b82f6" : task.status === "rewriting" ? "#a855f7" : task.status === "completed" ? "#10b981" : task.status === "working" ? accentColor : theme.dotDim, boxShadow: task.status === "needs_approval" || task.status === "needs_resolve" ? "0 0 8px #e07020" : task.status === "failed" ? "0 0 8px #ef4444" : task.status === "fixing" ? "0 0 8px #3b82f6" : task.status === "rewriting" ? "0 0 8px #a855f7" : task.status === "completed" ? "0 0 8px #10b981" : task.status === "working" ? theme.glowAccent : "none" }} />)}
                    {rightWorkflow.isRunning && !rightWorkflow.awaitingApproval && !rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && Array.from({ length: numDots }).map((_, i) => <EnergyDot key={`main-${i}`} delay={(i / numDots) * cycleDuration} color={hasReviewTask ? "#e07020" : accentColor} duration={cycleDuration} path={`M 0 ${AGENT_CENTER_Y} L ${CONNECTION_BEND_X} ${AGENT_CENTER_Y}`} />)}
                    {rightWorkflow.isRunning && !rightWorkflow.awaitingApproval && !rightWorkflow.isCompleted && !rightWorkflow.isCollapsing && rightWorkflow.tasks.map((_, taskIndex) =>
                      Array.from({ length: 2 }).map((__, i) => <EnergyDot key={`branch-${taskIndex}-${i}`} delay={(i / 2) * 1.5 + taskIndex * 0.3} color={taskIndex === targetTaskIndex && hasReviewTask ? "#e07020" : accentColor} duration={1.5} path={`M ${CONNECTION_BEND_X} ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT} L ${CONNECTION_WIDTH} ${CONNECTION_LINE_Y + taskIndex * TASK_ROW_HEIGHT}`} />)
                    )}
                  </div>
                );
              })()}

              {/* Right Tasks - fixed width to prevent layout shifts */}
              <div className="flex flex-col" style={{ width: 400, marginLeft: 0, minHeight: 300, gap: 0 }}>
                <AnimatePresence mode="wait">
                  {rightWorkflow.isCompleted && rightWorkflow.completedScenarioLabel && (
                    <motion.div
                      key="right-completed-container"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                      style={{ width: "100%", display: "flex", justifyContent: "flex-start", alignItems: "flex-start", marginBottom: WIDGET_GAP }}
                    >
                      <CompletedTaskWidget label={rightWorkflow.completedScenarioLabel} onClose={rightHandlers.resetWorkflow} />
                    </motion.div>
                  )}
                  {(!rightWorkflow.isCompleted && rightWorkflow.tasks.length > 0) || rightWorkflow.deepCleanComplete ? (
                    <motion.div
                      key="right-tasks-container"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, y: -20, transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] } }}
                      className="flex"
                      style={{ alignItems: "flex-start", justifyContent: "flex-start", gap: 16 }}
                    >
                      <WorkflowBranchContainer
                        scenarioLabel={rightWorkflow.currentScenarioLabel}
                        isActive={rightWorkflow.tasks.length > 0 || rightWorkflow.deepCleanComplete || false}
                        isCollapsing={rightWorkflow.isCollapsing}
                        isCleanComplete={rightWorkflow.deepCleanComplete || false}
                      >
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {rightWorkflow.tasks.map((task, index) => (
                            <TaskWidget
                              key={task.id}
                              task={task}
                              onApprove={rightHandlers.handleApprove}
                              onReject={rightHandlers.handleReject}
                              onResolve={rightHandlers.handleResolve}
                              isCollapsing={rightWorkflow.isCollapsing && index !== 0}
                              collapseIndex={rightWorkflow.tasks.length - 1 - index}
                            />
                          ))}
                        </div>
                      </WorkflowBranchContainer>

                      {!rightWorkflow.deepCleanComplete && (
                        <div className="flex flex-col" style={{ gap: WIDGET_GAP }}>
                          {rightWorkflow.subWorkflowActive && rightWorkflow.resolveType === "email_copy" && (
                            <EmailPreviewPanel
                              isActive={rightWorkflow.subWorkflowActive}
                              isCollapsing={rightWorkflow.subWorkflowCollapsing}
                              onApprove={rightHandlers.handleApprovePreview}
                            />
                          )}
                          {rightWorkflow.subWorkflowActive && rightWorkflow.resolveType === "insights" && (
                            <InsightsPreviewPanel isActive={rightWorkflow.subWorkflowActive} isCollapsing={rightWorkflow.subWorkflowCollapsing} onApprove={rightHandlers.handleApprovePreview} />
                          )}
                          {rightWorkflow.subWorkflowActive && rightWorkflow.resolveType !== "email_copy" && rightWorkflow.resolveType !== "insights" && (
                            <SubWorkflowPanel isActive={rightWorkflow.subWorkflowActive} tasks={rightWorkflow.subWorkflowTasks} isCollapsing={rightWorkflow.subWorkflowCollapsing} />
                          )}
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
      )}

      {/* Blueprint Canvas */}
      {activeCanvas === "blueprint" && (
      <div style={{ marginLeft: sidebarWidth, transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)", height: "100vh", overflow: "hidden", padding: 8, display: "flex" }}>
      <div
        className="flex-1 relative overflow-hidden"
        style={{
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e5e5e5",
          cursor: isPanning ? "grabbing" : "grab"
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div ref={canvasRef} style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, transformOrigin: "0 0", willChange: "transform", overflow: "visible" }}>
          <div style={{
            position: "absolute",
            width: 10000,
            height: 10000,
            left: -5000,
            top: -5000,
            backgroundImage: theme.gridPattern,
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0",
            pointerEvents: "none"
          }} />

        <div style={{
          position: "absolute",
          top: -400,
          left: -900,
          width: 1800,
          padding: 24
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
            gap: 20,
            maxWidth: 1800,
            margin: "0 auto"
          }}>
            {/* Working State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>WORKING</div>
              <TaskWidget
                task={{ id: "bp-1", label: "Process Customer Data", status: "working" }}
              />
            </div>

            {/* Completed State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>COMPLETED</div>
              <TaskWidget
                task={{ id: "bp-2", label: "Generate Analytics Report", status: "completed" }}
              />
            </div>

            {/* Needs Approval State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>NEEDS APPROVAL</div>
              <TaskWidget
                task={{ id: "bp-3", label: "Update Product Catalog", status: "needs_approval" }}
              />
            </div>

            {/* Needs Resolve State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>NEEDS RESOLVE</div>
              <TaskWidget
                task={{ id: "bp-4", label: "Sync Inventory Database", status: "needs_resolve" }}
              />
            </div>

            {/* Failed State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>FAILED</div>
              <TaskWidget
                task={{ id: "bp-5", label: "Deploy to Production", status: "failed" }}
              />
            </div>

            {/* Fixing State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>FIXING</div>
              <TaskWidget
                task={{ id: "bp-6", label: "Repair Email Service", status: "fixing" }}
              />
            </div>

            {/* Rewriting State */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>REWRITING</div>
              <TaskWidget
                task={{ id: "bp-7", label: "Optimize Query Performance", status: "rewriting" }}
              />
            </div>

            {/* Email Preview Panel */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>EMAIL PREVIEW</div>
              <EmailPreviewPanel isActive={true} isCollapsing={false} onApprove={() => {}} mirrored={false} />
            </div>

            {/* Insights Preview Panel */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>INSIGHTS PREVIEW</div>
              <InsightsPreviewPanel isActive={true} isCollapsing={false} onApprove={() => {}} mirrored={false} />
            </div>

            {/* Sub-Workflow Panel - Left */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>SUB-WORKFLOW (LEFT)</div>
              <SubWorkflowPanel
                isActive={true}
                tasks={[
                  { id: "sub-1", label: "Validate Data Schema", status: "completed" as const },
                  { id: "sub-2", label: "Transform Records", status: "completed" as const },
                  { id: "sub-3", label: "Index Documents", status: "completed" as const },
                  { id: "sub-4", label: "Update References", status: "working" as const },
                  { id: "sub-5", label: "Generate Metadata", status: "idle" as const },
                  { id: "sub-6", label: "Sync to Cloud", status: "idle" as const }
                ]}
                mirrored={false}
                isCollapsing={false}
              />
            </div>

            {/* Sub-Workflow Panel - Right */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>SUB-WORKFLOW (RIGHT)</div>
              <SubWorkflowPanel
                isActive={true}
                tasks={[
                  { id: "sub-7", label: "Fetch API Data", status: "completed" as const },
                  { id: "sub-8", label: "Parse Response", status: "completed" as const },
                  { id: "sub-9", label: "Validate Schema", status: "completed" as const },
                  { id: "sub-10", label: "Cache Results", status: "working" as const },
                  { id: "sub-11", label: "Update Database", status: "idle" as const },
                  { id: "sub-12", label: "Notify Services", status: "idle" as const }
                ]}
                mirrored={true}
                isCollapsing={false}
              />
            </div>

            {/* Completed Task Widget */}
            <div>
              <div style={{ color: theme.textMuted, fontSize: 11, fontWeight: 600, letterSpacing: "0.02em", marginBottom: 12, fontFamily: theme.fontFamily }}>COMPLETED WIDGET</div>
              <CompletedTaskWidget
                label="Weekly Analytics Report"
                onClose={() => {}}
                mirrored={false}
              />
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
      )}

      {/* Content Views */}
      {(activeCanvas === "home" || activeCanvas === "inbox" || activeCanvas === "commerce" || activeCanvas === "insights" || activeCanvas === "activity" || activeCanvas === "settings") && (
        <div style={{ marginLeft: sidebarWidth, transition: "margin-left 300ms cubic-bezier(0.4, 0, 0.2, 1)", height: "100vh", overflow: "hidden", padding: 8, display: "flex" }}>
        <div style={{ flex: 1, background: "#ffffff", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "auto", display: "flex", flexDirection: "column" }}>
          {activeCanvas === "home" && <HomeView onNavigate={(view) => setActiveCanvas(view as typeof activeCanvas)} />}
          {activeCanvas === "inbox" && <InboxView />}
          {activeCanvas === "commerce" && <CommerceView />}
          {activeCanvas === "insights" && <InsightsView />}
          {activeCanvas === "activity" && <ActivityView />}
          {activeCanvas === "settings" && <SettingsView />}
        </div>
        </div>
      )}

      {/* Task Controls Sidebar - Only on main canvas */}
      {activeCanvas === "canvas" && <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onWheel={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: 280,
          right: 20,
          width: 220,
          background: "#ffffff",
          border: `1px solid ${theme.borderLight}`,
          padding: "16px",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}
      >
        {scenarios.map((scenario) => {
          const isThisSideRunning = scenario.side === "left" ? leftWorkflow.isRunning : rightWorkflow.isRunning;
          const handlers = scenario.side === "left" ? leftHandlers : rightHandlers;

          return (
            <button
              key={scenario.id}
              onClick={() => handlers.runScenario(scenario)}
              disabled={isThisSideRunning}
              style={{
                background: isThisSideRunning ? "#f9fafb" : "#f9fafb",
                border: `1px solid ${theme.borderLight}`,
                color: isThisSideRunning ? theme.textDim : theme.text,
                padding: "10px 12px",
                fontSize: 11,
                letterSpacing: "0.02em",
                cursor: isThisSideRunning ? "not-allowed" : "pointer",
                fontFamily: theme.fontFamily,
                fontWeight: 600,
                textAlign: "center",
                transition: "all 0.15s ease",
                opacity: isThisSideRunning ? 0.6 : 1,
                width: "100%",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => { if (!isThisSideRunning) { e.currentTarget.style.background = "#f0f0f0"; e.currentTarget.style.borderColor = "#d1d5db"; }}}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = theme.borderLight; }}
            >
              {scenario.buttonLabel.toUpperCase()}
            </button>
          );
        })}
        {(anyTasks || anyCompleted) && (
          <button
            onClick={() => { leftHandlers.resetWorkflow(); rightHandlers.resetWorkflow(); }}
            style={{
              background: anyCompleted && !anyRunning ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)",
              border: anyCompleted && !anyRunning ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              color: anyCompleted && !anyRunning ? theme.success : theme.error,
              padding: "10px 12px",
              fontSize: 10,
              letterSpacing: "0.08em",
              cursor: "pointer",
              fontFamily: theme.fontFamily,
              fontWeight: 600,
              textAlign: "center",
              transition: "all 0.15s ease",
              width: "100%"
            }}
            onMouseEnter={(e) => {
              if (anyCompleted && !anyRunning) {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.15)";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.5)";
              } else {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (anyCompleted && !anyRunning) {
                e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
                e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.3)";
              } else {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              }
            }}
          >
            RESET ALL
          </button>
        )}
        <button
          onClick={startDeepClean}
          disabled={deepCleanMode !== "idle"}
          style={{
            background: deepCleanMode !== "idle" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.08)",
            border: deepCleanMode !== "idle" ? "1px solid rgba(59, 130, 246, 0.6)" : "1px solid rgba(59, 130, 246, 0.3)",
            color: "#3b82f6",
            padding: "10px 12px",
            fontSize: 10,
            letterSpacing: "0.08em",
            cursor: deepCleanMode !== "idle" ? "not-allowed" : "pointer",
            fontFamily: theme.fontFamily,
            fontWeight: 600,
            textAlign: "center",
            transition: "all 0.15s ease",
            opacity: deepCleanMode !== "idle" ? 0.8 : 1,
            boxShadow: deepCleanMode === "running" ? "0 0 20px rgba(59, 130, 246, 0.4)" : "none",
            width: "100%"
          }}
          onMouseEnter={(e) => {
            if (deepCleanMode === "idle") {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
              e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.6)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(59, 130, 246, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = deepCleanMode !== "idle" ? "rgba(59, 130, 246, 0.2)" : "rgba(59, 130, 246, 0.08)";
            e.currentTarget.style.borderColor = deepCleanMode !== "idle" ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.3)";
            e.currentTarget.style.boxShadow = deepCleanMode === "running" ? "0 0 20px rgba(59, 130, 246, 0.4)" : "none";
          }}
        >
          {deepCleanMode === "running" ? "CLEANING..." : deepCleanMode === "collapsing" ? "FINISHING..." : deepCleanMode === "complete" ? "CLEAN!" : "RUN DEEP CLEAN"}
        </button>

      </motion.div>}

      {/* Inline Chat - available on all views */}
      <InlineChat />
    </div>
    </ThemeContext.Provider>
  );
}
