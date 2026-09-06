"use client";

import { useCallback, useRef, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import { MarkerType } from "@xyflow/react";

export type SpiderSide = "left" | "right" | "top" | "bottom";
export type SpiderStrategy = "accumulate" | "rewire";

export type SpiderThread = {
  id: string;
  source: string;
  target: string;
  strength: number;
  sourceSide: SpiderSide;
  targetSide: SpiderSide;
};

export type SpiderOptions = {
  reach?: number;
  maxThreads?: number;
  keepOnDrop?: number;
  strategy?: SpiderStrategy;
  isolatedLimit?: number;
};

const opposite: Record<SpiderSide, SpiderSide> = {
  left: "right",
  right: "left",
  top: "bottom",
  bottom: "top",
};

function rect(n: Node) {
  return {
    x: n.position.x,
    y: n.position.y,
    w: n.measured?.width ?? (n as any).width ?? 140,
    h: n.measured?.height ?? (n as any).height ?? 60,
  };
}

function side(a: ReturnType<typeof rect>, b: ReturnType<typeof rect>) {
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;

  const result: SpiderSide =
    Math.abs(bx - ax) >= Math.abs(by - ay)
      ? bx >= ax
        ? "right"
        : "left"
      : by >= ay
        ? "bottom"
        : "top";

  return { sourceSide: result, targetSide: opposite[result] };
}

export function useSpiderWeb(
  nodes: Node[],
  edges: Edge[],
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>,
  options: SpiderOptions = {},
) {
  const {
    reach = 350,
    maxThreads = 8,
    keepOnDrop = 2,
    strategy = "accumulate",
    isolatedLimit = 1,
  } = options;

  const [threads, setThreads] = useState<SpiderThread[]>([]);
  const [removalEdgeIds, setRemovalEdgeIds] = useState<string[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<SpiderStrategy>(strategy);

  const effectiveStrategy = options.strategy ?? activeStrategy;

  // Keep synchronous refs to latest candidate additions and removals to eliminate drop race conditions
  const threadsRef = useRef<SpiderThread[]>([]);
  const removalEdgeIdsRef = useRef<string[]>([]);
  threadsRef.current = threads;
  removalEdgeIdsRef.current = removalEdgeIds;

  const spin = useCallback(
    (current: Node) => {
      const a = rect(current);
      const ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 };

      // Find all existing edges attached to this node
      const connectedEdges = edges.filter(
        (e) => e.source === current.id || e.target === current.id,
      );
      const connectedNeighborIds = new Set(
        connectedEdges.map((e) => (e.source === current.id ? e.target : e.source)),
      );

      if (effectiveStrategy === "rewire") {
        // --- MULTI-EDGE DEGREE-BALANCED REWIRE MODE ---
        // Find all eligible unconnected nodes within reach
        const candidateNeighbors = nodes
          .filter((n) => n.id !== current.id && !connectedNeighborIds.has(n.id))
          .map((n) => {
            const b = rect(n);
            const d = Math.hypot(ac.x - (b.x + b.w / 2), ac.y - (b.y + b.h / 2));
            return { n, b, d };
          })
          .filter((x) => x.d <= reach)
          .sort((x, y) => x.d - y.d);

        if (candidateNeighbors.length === 0) {
          threadsRef.current = [];
          removalEdgeIdsRef.current = [];
          setThreads([]);
          setRemovalEdgeIds([]);
          return;
        }

        const degree = connectedEdges.length;
        // Capacity: if node has degree N, it can swap up to N edges (2 for 2, 3 for 3, etc.)
        // If isolated (degree 0), allow up to isolatedLimit
        const swapCapacity = degree === 0 ? isolatedLimit : Math.min(degree, maxThreads);
        const swapCount = Math.min(candidateNeighbors.length, swapCapacity);

        const topCandidates = candidateNeighbors.slice(0, swapCount);
        const additionThreads: SpiderThread[] = topCandidates.map(({ n, b, d }) => ({
          id: `rewire-add-${current.id}-${n.id}`,
          source: current.id,
          target: n.id,
          strength: 1 - d / reach,
          ...side(a, b),
        }));

        if (degree > 0) {
          // Calculate distance to all currently connected neighbors
          const neighborDistances = connectedEdges.map((edge) => {
            const neighborId = edge.source === current.id ? edge.target : edge.source;
            const neighborNode = nodes.find((n) => n.id === neighborId);
            if (!neighborNode) return { edge, distance: 0 };
            const nb = rect(neighborNode);
            const nd = Math.hypot(ac.x - (nb.x + nb.w / 2), ac.y - (nb.y + nb.h / 2));
            return { edge, distance: nd };
          });

          // Sort descending: furthest connected neighbors first
          neighborDistances.sort((x, y) => y.distance - x.distance);

          // Mark exactly N furthest connected edges for removal matching proposed additions
          const edgesToPrune = neighborDistances
            .slice(0, additionThreads.length)
            .map((item) => item.edge.id);

          threadsRef.current = additionThreads;
          removalEdgeIdsRef.current = edgesToPrune;
          setThreads(additionThreads);
          setRemovalEdgeIds(edgesToPrune);
        } else {
          // Isolated node connecting
          threadsRef.current = additionThreads;
          removalEdgeIdsRef.current = [];
          setThreads(additionThreads);
          setRemovalEdgeIds([]);
        }
      } else {
        // --- CLASSIC GREEDY SPIDER WEB MODE ---
        const next = nodes
          .filter((n) => n.id !== current.id)
          .map((n) => {
            const b = rect(n);
            const d = Math.hypot(ac.x - (b.x + b.w / 2), ac.y - (b.y + b.h / 2));
            return { n, b, d };
          })
          .filter((x) => x.d <= reach)
          .sort((x, y) => x.d - y.d)
          .slice(0, maxThreads)
          .map(({ n, b, d }) => ({
            id: `spider-${current.id}-${n.id}`,
            source: current.id,
            target: n.id,
            strength: 1 - d / reach,
            ...side(a, b),
          }));

        threadsRef.current = next;
        removalEdgeIdsRef.current = [];
        setThreads(next);
        setRemovalEdgeIds([]);
      }
    },
    [effectiveStrategy, edges, isolatedLimit, maxThreads, nodes, reach],
  );

  const onNodeDragStart = useCallback((_: unknown, node: Node) => spin(node), [spin]);
  const onNodeDrag = useCallback((_: unknown, node: Node) => spin(node), [spin]);

  const onNodeDragStop = useCallback(() => {
    const additionsToCommit = [...threadsRef.current];
    const removalsToCommit = new Set(removalEdgeIdsRef.current);

    if (effectiveStrategy === "rewire") {
      if (additionsToCommit.length > 0) {
        setEdges((currentEdges) => {
          // Sever all marked removal edges
          const retainedEdges = currentEdges.filter((e) => !removalsToCommit.has(e.id));
          const existingIds = new Set(retainedEdges.map((e) => e.id));

          // Commit all candidate addition edges
          const newEdges: Edge[] = additionsToCommit
            .map((t, index) => ({
              id: `edge-${t.source}-${t.target}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
              source: t.source,
              target: t.target,
              sourceHandle: `${t.sourceSide}-source`,
              targetHandle: `${t.targetSide}-target`,
              type: "add",
              markerEnd: { type: MarkerType.ArrowClosed },
            }))
            .filter((e) => !existingIds.has(e.id));

          return [...retainedEdges, ...newEdges];
        });
      }
    } else {
      // Classic greedy spider web drop
      const keep = additionsToCommit
        .sort((a, b) => b.strength - a.strength)
        .slice(0, keepOnDrop);

      if (keep.length > 0) {
        setEdges((currentEdges) => {
          const ids = new Set(currentEdges.map((e) => e.id));
          const newEdges = keep
            .map((t, index) => ({
              id: `edge-${t.source}-${t.target}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`,
              source: t.source,
              target: t.target,
              sourceHandle: `${t.sourceSide}-source`,
              targetHandle: `${t.targetSide}-target`,
              type: "add",
              markerEnd: { type: MarkerType.ArrowClosed },
            }))
            .filter((e) => !ids.has(e.id));

          return newEdges.length ? [...currentEdges, ...newEdges] : currentEdges;
        });
      }
    }

    // Reset synchronous tracking and state
    threadsRef.current = [];
    removalEdgeIdsRef.current = [];
    setThreads([]);
    setRemovalEdgeIds([]);
  }, [effectiveStrategy, keepOnDrop, setEdges]);

  return {
    threads,
    removalEdgeIds,
    strategy: effectiveStrategy,
    setStrategy: setActiveStrategy,
    onNodeDragStart,
    onNodeDrag,
    onNodeDragStop,
  };
}
