import { useNodes, SmoothStepEdge } from "@xyflow/react"
import React from "react"
import { SmartEdge } from "../SmartEdge"
import {
  svgDrawSmoothStepLinePath,
  pathfindingJumpPointNoDiagonal
} from "../functions"
import type { SmartEdgeOptions } from "../SmartEdge"
import type { EdgeProps } from "@xyflow/react"

const SmoothStepConfiguration: SmartEdgeOptions = {
  drawEdge: svgDrawSmoothStepLinePath(),
  generatePath: pathfindingJumpPointNoDiagonal,
  fallback: SmoothStepEdge as any
}

export function SmartSmoothStepEdge(props: EdgeProps) {
  const nodes = useNodes()
  return <SmartEdge {...props} options={SmoothStepConfiguration} nodes={nodes} />
}
