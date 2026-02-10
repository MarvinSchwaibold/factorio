import type { MapNode } from "./types";

// Pure A* pathfinding on the isometric grid
// Manhattan heuristic, 8-directional movement

interface PathNode {
  x: number;
  y: number;
  g: number; // cost from start
  h: number; // heuristic to end
  f: number; // g + h
  parent: PathNode | null;
}

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  return Math.abs(ax - bx) + Math.abs(ay - by);
}

function key(x: number, y: number): string {
  return x + "," + y;
}

// 8-directional neighbors
var DIRS: Array<[number, number, number]> = [
  [0, -1, 1], [0, 1, 1], [-1, 0, 1], [1, 0, 1],
  [-1, -1, 1.41], [-1, 1, 1.41], [1, -1, 1.41], [1, 1, 1.41],
];

/**
 * Find a path from (sx, sy) to (ex, ey) avoiding occupied tiles.
 * Returns array of [x, y] coordinates or empty array if no path found.
 */
export function findPath(
  sx: number,
  sy: number,
  ex: number,
  ey: number,
  nodes: MapNode[],
  gridWidth: number,
  gridHeight: number,
  excludeNodeIds?: string[]
): Array<[number, number]> {
  // Build obstacle set (occupied tiles minus source/target node tiles)
  var obstacles: Record<string, boolean> = {};
  var excludeSet: Record<string, boolean> = {};
  if (excludeNodeIds) {
    for (var e = 0; e < excludeNodeIds.length; e++) {
      excludeSet[excludeNodeIds[e]] = true;
    }
  }
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (!excludeSet[n.id]) {
      obstacles[key(n.tileX, n.tileY)] = true;
    }
  }

  // Don't block start/end
  delete obstacles[key(sx, sy)];
  delete obstacles[key(ex, ey)];

  var open: PathNode[] = [];
  var closed: Record<string, boolean> = {};

  var start: PathNode = { x: sx, y: sy, g: 0, h: heuristic(sx, sy, ex, ey), f: 0, parent: null };
  start.f = start.g + start.h;
  open.push(start);

  var maxIterations = gridWidth * gridHeight * 2;
  var iterations = 0;

  while (open.length > 0 && iterations < maxIterations) {
    iterations++;

    // Find lowest f in open list
    var bestIdx = 0;
    for (var oi = 1; oi < open.length; oi++) {
      if (open[oi].f < open[bestIdx].f) bestIdx = oi;
    }
    var current = open[bestIdx];
    open.splice(bestIdx, 1);

    if (current.x === ex && current.y === ey) {
      // Reconstruct path
      var path: Array<[number, number]> = [];
      var node: PathNode | null = current;
      while (node) {
        path.push([node.x, node.y]);
        node = node.parent;
      }
      path.reverse();
      return path;
    }

    closed[key(current.x, current.y)] = true;

    for (var d = 0; d < DIRS.length; d++) {
      var nx = current.x + DIRS[d][0];
      var ny = current.y + DIRS[d][1];
      var cost = DIRS[d][2];

      if (nx < 0 || ny < 0 || nx >= gridWidth || ny >= gridHeight) continue;
      if (closed[key(nx, ny)]) continue;
      if (obstacles[key(nx, ny)]) continue;

      var ng = current.g + cost;
      var nh = heuristic(nx, ny, ex, ey);
      var nf = ng + nh;

      // Check if already in open with better cost
      var inOpen = false;
      for (var oj = 0; oj < open.length; oj++) {
        if (open[oj].x === nx && open[oj].y === ny) {
          if (ng < open[oj].g) {
            open[oj].g = ng;
            open[oj].f = nf;
            open[oj].parent = current;
          }
          inOpen = true;
          break;
        }
      }

      if (!inOpen) {
        open.push({ x: nx, y: ny, g: ng, h: nh, f: nf, parent: current });
      }
    }
  }

  return []; // no path found
}
