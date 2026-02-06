"use client";

import { useState, useRef, useCallback } from "react";
import type { Task, SubWorkflowTask, Scenario, WorkflowState, WorkflowSide, TaskState } from "@/lib/types";
import { initialWorkflowState, subWorkflowConfigs } from "@/lib/constants";

export interface WorkflowHandlers {
  handleApprove: () => void;
  handleReject: () => void;
  handleResolve: () => void;
  handleApprovePreview: () => void;
  runScenario: (scenario: Scenario) => void;
  resetWorkflow: () => void;
}

export function useWorkflow(side: WorkflowSide): [WorkflowState, React.Dispatch<React.SetStateAction<WorkflowState>>, WorkflowHandlers] {
  const [workflow, setWorkflow] = useState<WorkflowState>(initialWorkflowState);
  const scenarioRef = useRef<Scenario | null>(null);
  const taskIndexRef = useRef(0);
  const subTaskIndexRef = useRef(0);

  const triggerCompletion = useCallback(() => {
    const scenario = scenarioRef.current;
    if (!scenario) return;

    setWorkflow(prev => {
      const hasPendingReviews = prev.tasks.some(t =>
        t.status === "needs_approval" || t.status === "needs_resolve" || t.status === "working"
      );
      if (hasPendingReviews) return prev;

      setTimeout(() => {
        setWorkflow(p => ({ ...p, tasks: [], isCollapsing: false, isCompleted: true, isRunning: false, currentScenarioLabel: "" }));
      }, 400);

      return { ...prev, completedScenarioLabel: scenario.buttonLabel, isCollapsing: true };
    });
  }, []);

  const scheduleTaskCompletion = useCallback((taskIndex: number, taskDef: Scenario["tasks"][0], baseDelay: number) => {
    const randomOutcome = Math.random();
    const shouldFail = randomOutcome < 0.10;
    const shouldRewrite = randomOutcome >= 0.10 && randomOutcome < 0.55;

    if (shouldFail && taskDef.duration >= 1500) {
      const failAfter = baseDelay + taskDef.duration * 0.4;
      setTimeout(() => {
        setWorkflow(prev => ({
          ...prev,
          tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "failed" as TaskState, subtext: "Error encountered" } : t)
        }));

        setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "fixing" as TaskState, subtext: "Auto-recovering..." } : t)
          }));

          setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "completed" as TaskState, subtext: taskDef.subtext } : t)
            }));
          }, 1500);
        }, 1200);
      }, failAfter);
    } else if (shouldRewrite && taskDef.duration >= 1200) {
      const rewriteAfter = baseDelay + taskDef.duration * 0.5;
      setTimeout(() => {
        setWorkflow(prev => ({
          ...prev,
          tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "rewriting" as TaskState, subtext: "Restructuring..." } : t)
        }));

        setTimeout(() => {
          setWorkflow(prev => ({
            ...prev,
            tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "working" as TaskState, subtext: "Rebuilding..." } : t)
          }));

          setTimeout(() => {
            setWorkflow(prev => ({
              ...prev,
              tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "completed" as TaskState, subtext: taskDef.subtext } : t)
            }));
          }, 2500);
        }, 4000);
      }, rewriteAfter);
    } else {
      setTimeout(() => {
        setWorkflow(prev => ({
          ...prev,
          tasks: prev.tasks.map((t, i) => i === taskIndex ? { ...t, status: "completed" as TaskState } : t)
        }));
      }, baseDelay + taskDef.duration);
    }
  }, []);

  const completeSubWorkflow = useCallback((completedSubtext: string) => {
    const indexToComplete = taskIndexRef.current;
    setWorkflow(prev => ({ ...prev, subWorkflowCollapsing: true }));
    setTimeout(() => {
      setWorkflow(prev => ({
        ...prev,
        subWorkflowActive: false,
        subWorkflowTasks: [],
        subWorkflowCollapsing: false,
        resolveTaskIndex: null,
        resolveType: null,
        awaitingApproval: false,
        tasks: prev.tasks.map((t, i) => i === indexToComplete ? { ...t, status: "completed" as TaskState, subtext: completedSubtext } : t)
      }));
      taskIndexRef.current++;
      subTaskIndexRef.current = 0;
      setTimeout(() => addNextTask(), 400);
    }, 600);
  }, []);

  const runSubWorkflow = useCallback((type: string) => {
    const config = subWorkflowConfigs[type];
    if (!config || config.tasks.length === 0) return;

    const subTask = config.tasks[subTaskIndexRef.current];
    if (!subTask) {
      completeSubWorkflow("Issue resolved");
      return;
    }

    const newSubTask: SubWorkflowTask = {
      id: `${side}-subtask-${Date.now()}-${subTaskIndexRef.current}`,
      label: subTask.label,
      subtext: subTask.subtext,
      status: "working"
    };

    setWorkflow(prev => ({ ...prev, subWorkflowTasks: [...prev.subWorkflowTasks, newSubTask] }));

    setTimeout(() => {
      setWorkflow(prev => ({
        ...prev,
        subWorkflowTasks: prev.subWorkflowTasks.map((t, i) => i === subTaskIndexRef.current ? { ...t, status: "completed" as TaskState } : t)
      }));
      subTaskIndexRef.current++;
      setTimeout(() => runSubWorkflow(type), 300);
    }, subTask.duration);
  }, [side, completeSubWorkflow]);

  const addNextTask = useCallback(() => {
    const scenario = scenarioRef.current;
    if (!scenario || taskIndexRef.current >= scenario.tasks.length) {
      triggerCompletion();
      return;
    }

    let spawnIndex = taskIndexRef.current;
    let spawnDelay = 0;
    const tasksToSpawn: { index: number; def: typeof scenario.tasks[0]; delay: number }[] = [];

    while (spawnIndex < scenario.tasks.length) {
      const taskDef = scenario.tasks[spawnIndex];
      tasksToSpawn.push({ index: spawnIndex, def: taskDef, delay: spawnDelay });

      if (taskDef.requiresApproval || taskDef.requiresResolve) {
        break;
      }

      spawnIndex++;
      spawnDelay += 300;
    }

    tasksToSpawn.forEach(({ index, def, delay }) => {
      setTimeout(() => {
        const newTask: Task = {
          id: `${side}-task-${index}`,
          label: def.label,
          subtext: def.subtext,
          status: def.requiresApproval ? "needs_approval" : def.requiresResolve ? "needs_resolve" : "working",
          requiresApproval: def.requiresApproval,
          requiresResolve: def.requiresResolve,
          resolveType: def.resolveType
        };

        setWorkflow(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));

        if (def.requiresApproval || def.requiresResolve) {
          setWorkflow(prev => ({ ...prev, awaitingApproval: true }));
          taskIndexRef.current = index;
        } else {
          scheduleTaskCompletion(index, def, 0);
        }
      }, delay);
    });

    const lastTask = tasksToSpawn[tasksToSpawn.length - 1];
    if (lastTask && !lastTask.def.requiresApproval && !lastTask.def.requiresResolve) {
      const maxCompletionTime = Math.max(...tasksToSpawn.map(t => t.delay + t.def.duration + (Math.random() < 0.25 && t.def.duration >= 1500 ? 2700 : 0)));
      setTimeout(() => {
        taskIndexRef.current = spawnIndex;
        addNextTask();
      }, maxCompletionTime + 400);
    }
  }, [side, triggerCompletion, scheduleTaskCompletion]);

  const handleApprove = useCallback(() => {
    setWorkflow(prev => {
      const approvalIndex = prev.tasks.findIndex(t => t.status === "needs_approval");
      if (approvalIndex === -1) return prev;
      taskIndexRef.current = approvalIndex;
      return {
        ...prev,
        awaitingApproval: false,
        tasks: prev.tasks.map((t, i) => i === approvalIndex ? { ...t, status: "working" as TaskState, subtext: "Processing..." } : t)
      };
    });
    setTimeout(() => {
      setWorkflow(prev => {
        const processingIndex = prev.tasks.findIndex(t => t.status === "working" && t.subtext === "Processing...");
        if (processingIndex === -1) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map((t, i) => i === processingIndex ? { ...t, status: "completed" as TaskState } : t)
        };
      });
      taskIndexRef.current++;
      setTimeout(addNextTask, 400);
    }, 1000);
  }, [addNextTask]);

  const handleReject = useCallback(() => {
    setWorkflow(prev => ({
      ...prev,
      tasks: prev.tasks.slice(0, -1),
      awaitingApproval: false,
      isRunning: false
    }));
  }, []);

  const handleResolve = useCallback(() => {
    const currentIndex = taskIndexRef.current;
    setWorkflow(prev => {
      const currentTask = prev.tasks[currentIndex];
      const type = currentTask?.resolveType || "inventory";

      const isAutomaticSubWorkflow = type !== "email_copy" && type !== "insights";

      setTimeout(() => {
        if (isAutomaticSubWorkflow) {
          runSubWorkflow(type);
        }
      }, 400);

      return {
        ...prev,
        resolveTaskIndex: currentIndex,
        subWorkflowActive: true,
        subWorkflowTasks: [],
        resolveType: type,
        awaitingApproval: !isAutomaticSubWorkflow,
        tasks: prev.tasks.map((t, i) => i === currentIndex ? { ...t, status: "working" as TaskState, subtext: "Resolving..." } : t)
      };
    });
  }, [runSubWorkflow]);

  const handleApprovePreview = useCallback(() => {
    completeSubWorkflow("Approved");
  }, [completeSubWorkflow]);

  const runScenario = useCallback((scenario: Scenario) => {
    if (workflow.isRunning) return;

    scenarioRef.current = scenario;
    taskIndexRef.current = 0;

    setWorkflow({
      ...initialWorkflowState,
      isRunning: true,
      currentScenarioLabel: scenario.buttonLabel,
    });

    const lineAnimDuration = 600;
    const startTime = Date.now();

    const animateLine = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / lineAnimDuration, 1);
      setWorkflow(prev => ({ ...prev, lineProgress: progress }));
      if (progress < 1) requestAnimationFrame(animateLine);
      else addNextTask();
    };
    requestAnimationFrame(animateLine);
  }, [workflow.isRunning, addNextTask]);

  const resetWorkflow = useCallback(() => {
    scenarioRef.current = null;
    taskIndexRef.current = 0;
    subTaskIndexRef.current = 0;
    setWorkflow(initialWorkflowState);
  }, []);

  const handlers: WorkflowHandlers = {
    handleApprove,
    handleReject,
    handleResolve,
    handleApprovePreview,
    runScenario,
    resetWorkflow,
  };

  return [workflow, setWorkflow, handlers];
}
