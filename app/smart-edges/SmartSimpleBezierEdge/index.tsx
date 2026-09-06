import { useNodes, SimpleBezierEdge } from "@xyflow/react"
import React from "react"
import { SmartEdge } from "../SmartEdge"
import {
  svgDrawSimpleBezierLinePath,
  pathfindingAStarDiagonal
} from "../functions"
import type { SmartEdgeOptions } from "../SmartEdge"
import type { EdgeProps } from "@xyflow/react"

const SimpleBezierConfiguration: SmartEdgeOptions = {
  drawEdge: svgDrawSimpleBezierLinePath,
  generatePath: pathfindingAStarDiagonal,
  fallback: SimpleBezierEdge as any
}

export function SmartSimpleBezierEdge(props: EdgeProps) {
  const nodes = useNodes()
  return <SmartEdge {...props} options={SimpleBezierConfiguration} nodes={nodes} />
}
