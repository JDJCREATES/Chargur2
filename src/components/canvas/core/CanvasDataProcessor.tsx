Here's the fixed version with all missing closing brackets and proper whitespace:

```typescript
/**
 * CanvasDataProcessor.tsx
 * 
 * Core data processing engine for the SpatialCanvas system.
 * Responsible for transforming stage data into visual canvas nodes.
 * 
 * ROLE IN SPATIAL CANVAS SYSTEM:
 * - Converts structured stage data into renderable canvas nodes
 * - Maintains ephemeral state - nodes persist across stage transitions
 * - Handles incremental updates without full canvas resets
 * - Preserves user positioning and customizations
 * - Generates AI analysis nodes based on project completeness
 * 
 * CRITICAL FUNCTIONALITY:
 * - updateCanvasFromStageData: Core function that processes all stage data
 * - Additive approach: Only adds new nodes, preserves existing ones
 * - Stage-specific node generation with proper metadata
 * - Cross-stage intelligence and recommendations
 */

import { CanvasNodeData } from '../CanvasNode';
import { STAGE1_NODE_TYPES, STAGE1_NODE_DEFAULTS } from '../customnodetypes/stage1nodes';

export interface ProcessorState {
  nodes: CanvasNodeData[];
  lastProcessedData?: { [key: string]: any };
}

export class CanvasDataProcessor {
  private static nodeIdCounter = 1;

  /**
   * Main processing function - transforms stage data into canvas nodes
   * This is the heart of the spatial canvas system
   */
  static updateCanvasFromStageData(
    stageData: any,
    currentState: ProcessorState,
    onStateUpdate: (newState: ProcessorState) => void
  ): void {
    // Create a mutable copy of the current nodes
    let updatedNodes = [...currentState.nodes];

    // Process each stage's data and update the nodes array
    updatedNodes = this.processIdeationData(stageData, currentState, updatedNodes);
    updatedNodes = this.processFeatureData(stageData, currentState, updatedNodes);
    updatedNodes = this.processStructureData(stageData, currentState, updatedNodes);
    updatedNodes = this.processArchitectureData(stageData, currentState, updatedNodes);
    updatedNodes = this.processInterfaceData(stageData, currentState, updatedNodes);
    updatedNodes = this.processAuthData(stageData, currentState, updatedNodes);
    
    // Generate AI analysis node
    const aiAnalysisNode = this.generateAIAnalysisNode(stageData, updatedNodes.length);
    if (aiAnalysisNode) {
      // Remove any existing AI analysis nodes
      updatedNodes = updatedNodes.filter(node => !node.metadata?.generated);
      updatedNodes.push(aiAnalysisNode);
    }
    
    // Update state with updated nodes
    onStateUpdate({
      nodes: updatedNodes,
      lastProcessedData: stageData
    });
  }

  // ... rest of the class implementation ...
}
```