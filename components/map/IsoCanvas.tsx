"use client";

import { useRef, useEffect, useCallback } from "react";
import { renderScene, renderHoverOverlay, renderAnimationFrame } from "@/lib/iso-map/renderer";
import type { IsoMapState, IsoMapActions } from "@/hooks/useIsoMap";
import type { MapInteractionHandlers } from "@/hooks/useMapInteraction";

interface IsoCanvasProps {
  state: IsoMapState;
  actions: IsoMapActions;
  handlers: MapInteractionHandlers;
  isDark: boolean;
  containerRefOut?: React.MutableRefObject<HTMLDivElement | null>;
}

export function IsoCanvas({ state, actions, handlers, isDark, containerRefOut }: IsoCanvasProps) {
  var baseCanvasRef = useRef<HTMLCanvasElement>(null);
  var animCanvasRef = useRef<HTMLCanvasElement>(null);
  var hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  var containerRef = useRef<HTMLDivElement>(null);
  var hasCenteredRef = useRef(false);
  var animFrameRef = useRef<number>(0);

  // Refs for zoomAtPoint and state so native listeners + rAF have latest
  var zoomAtPointRef = useRef(actions.zoomAtPoint);
  zoomAtPointRef.current = actions.zoomAtPoint;

  var stateRef = useRef(state);
  stateRef.current = state;

  // Resize canvases to container
  var resizeCanvases = useCallback(function() {
    var container = containerRef.current;
    var base = baseCanvasRef.current;
    var anim = animCanvasRef.current;
    var hover = hoverCanvasRef.current;
    if (!container || !base || !anim || !hover) return;

    var dpr = window.devicePixelRatio || 1;
    var w = container.clientWidth;
    var h = container.clientHeight;

    var canvases = [base, anim, hover];
    for (var i = 0; i < canvases.length; i++) {
      var c = canvases[i];
      c.width = w * dpr;
      c.height = h * dpr;
      c.style.width = w + "px";
      c.style.height = h + "px";
      var ctx = c.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  // Setup: resize + non-passive wheel listener + animation loop
  useEffect(function() {
    // Expose container ref to parent
    if (containerRefOut) containerRefOut.current = containerRef.current;

    resizeCanvases();

    var handleResize = function() { resizeCanvases(); };
    window.addEventListener("resize", handleResize);

    // Center grid in viewport on first mount
    if (!hasCenteredRef.current && containerRef.current) {
      hasCenteredRef.current = true;
      actions.centerAtZoom(0.85, containerRef.current.clientWidth, containerRef.current.clientHeight);
    }

    // Non-passive wheel listener for proper preventDefault
    var hoverCanvas = hoverCanvasRef.current;
    var wheelHandler = function(e: WheelEvent) {
      e.preventDefault();
      var rect = hoverCanvas!.getBoundingClientRect();
      var mouseX = e.clientX - rect.left;
      var mouseY = e.clientY - rect.top;
      zoomAtPointRef.current(e.deltaY, mouseX, mouseY);
    };
    if (hoverCanvas) {
      hoverCanvas.addEventListener("wheel", wheelHandler, { passive: false });
    }

    // Animation loop (runs on animCanvas only)
    var animLoop = function(time: number) {
      var animCanvas = animCanvasRef.current;
      var container = containerRef.current;
      if (animCanvas && container) {
        var ctx = animCanvas.getContext("2d");
        if (ctx) {
          var w = container.clientWidth;
          var h = container.clientHeight;
          var s = stateRef.current;
          renderAnimationFrame(
            ctx, w, h,
            s.model.nodes,
            s.model.connectors,
            s.connectorPaths,
            s.uiState,
            time
          );
        }
      }
      animFrameRef.current = requestAnimationFrame(animLoop);
    };
    animFrameRef.current = requestAnimationFrame(animLoop);

    return function() {
      window.removeEventListener("resize", handleResize);
      if (hoverCanvas) {
        hoverCanvas.removeEventListener("wheel", wheelHandler);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [resizeCanvases]);

  // Draw base + hover on every state change
  useEffect(function() {
    var base = baseCanvasRef.current;
    var hover = hoverCanvasRef.current;
    if (!base || !hover) return;

    var container = containerRef.current;
    if (!container) return;

    var w = container.clientWidth;
    var h = container.clientHeight;

    var baseCtx = base.getContext("2d");
    var hoverCtx = hover.getContext("2d");
    if (!baseCtx || !hoverCtx) return;

    renderScene(
      baseCtx,
      w,
      h,
      state.model.nodes,
      state.model.connectors,
      state.connectorPaths,
      state.model.regions,
      state.uiState,
      isDark,
      state.model.gridWidth,
      state.model.gridHeight
    );

    renderHoverOverlay(
      hoverCtx,
      w,
      h,
      state.uiState,
      isDark
    );
  }, [state, isDark]);

  // Focus container on mousedown so keyboard events (space, esc, delete) work
  var handleMouseDown = useCallback(function(e: React.MouseEvent<HTMLCanvasElement>) {
    if (containerRef.current) {
      containerRef.current.focus();
    }
    handlers.handleMouseDown(e);
  }, [handlers]);

  var cursorStyle = "default";
  if (state.uiState.mode === "PAN") cursorStyle = "grab";
  if (state.uiState.mode === "PLACE_NODE") cursorStyle = "crosshair";
  if (state.uiState.mode === "CONNECTOR") cursorStyle = "crosshair";
  if (state.uiState.mode === "CREATE_SECTION") cursorStyle = "crosshair";

  var canvasStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        outline: "none",
      }}
      tabIndex={0}
      onKeyDown={handlers.handleKeyDown}
      onKeyUp={handlers.handleKeyUp}
    >
      {/* Animation canvas: flow particles + effects (rAF loop) — below cards */}
      <canvas
        ref={animCanvasRef}
        style={canvasStyle}
      />
      {/* Base canvas: grid + buildings (redraws on state change) */}
      <canvas
        ref={baseCanvasRef}
        style={canvasStyle}
      />
      {/* Hover canvas: tile highlights + mouse interaction */}
      <canvas
        ref={hoverCanvasRef}
        style={{
          ...canvasStyle,
          cursor: cursorStyle,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handlers.handleMouseMove}
        onMouseUp={handlers.handleMouseUp}
        onMouseLeave={handlers.handleMouseUp}
      />
    </div>
  );
}
