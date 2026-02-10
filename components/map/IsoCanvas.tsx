"use client";

import { useRef, useEffect, useCallback } from "react";
import { renderScene, renderHoverOverlay } from "@/lib/iso-map/renderer";
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
  var hoverCanvasRef = useRef<HTMLCanvasElement>(null);
  var containerRef = useRef<HTMLDivElement>(null);
  var hasCenteredRef = useRef(false);

  // Ref for zoomAtPoint so native wheel listener always has latest
  var zoomAtPointRef = useRef(actions.zoomAtPoint);
  zoomAtPointRef.current = actions.zoomAtPoint;

  // Resize canvases to container
  var resizeCanvases = useCallback(function() {
    var container = containerRef.current;
    var base = baseCanvasRef.current;
    var hover = hoverCanvasRef.current;
    if (!container || !base || !hover) return;

    var dpr = window.devicePixelRatio || 1;
    var w = container.clientWidth;
    var h = container.clientHeight;

    base.width = w * dpr;
    base.height = h * dpr;
    base.style.width = w + "px";
    base.style.height = h + "px";

    hover.width = w * dpr;
    hover.height = h * dpr;
    hover.style.width = w + "px";
    hover.style.height = h + "px";

    var baseCtx = base.getContext("2d");
    var hoverCtx = hover.getContext("2d");
    if (baseCtx) baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (hoverCtx) hoverCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, []);

  // Setup: resize + non-passive wheel listener
  useEffect(function() {
    // Expose container ref to parent
    if (containerRefOut) containerRefOut.current = containerRef.current;

    resizeCanvases();

    var handleResize = function() { resizeCanvases(); };
    window.addEventListener("resize", handleResize);

    // Center grid in viewport on first mount at preset "2" zoom
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

    return function() {
      window.removeEventListener("resize", handleResize);
      if (hoverCanvas) {
        hoverCanvas.removeEventListener("wheel", wheelHandler);
      }
    };
  }, [resizeCanvases]);

  // Draw on every state change
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
      state.connectorPaths,
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
      <canvas
        ref={baseCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      <canvas
        ref={hoverCanvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
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
