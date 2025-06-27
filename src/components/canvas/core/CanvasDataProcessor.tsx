import { CanvasNode } from '../../../types';
import { getSmartNodePosition } from '../../../lib/canvas/nodePlacementUtils';
import { processIdeationData } from '../../../lib/canvas/processors/ideationProcessor';
import { processFeatureData } from '../../../lib/canvas/processors/featureProcessor';
import { processStructureData } from '../../../lib/canvas/processors/structureProcessor';
import { processArchitectureData } from '../../../lib/canvas/processors/architectureProcessor';
import { processInterfaceData } from '../../../lib/canvas/processors/interfaceProcessor';
import { processAuthData } from '../../../lib/canvas/processors/authProcessor';

export interface ProcessorState {
  nodes: CanvasNode[];
  connections: any[];
  lastProcessedData: Record<string, any>;
}

export class CanvasDataProcessor {
  /**
   * Main orchestration method that processes stage data and updates canvas
   */
  static updateCanvasFromStageData(
    currentNodes: CanvasNode[],
    currentConnections: any[],
    stageId: string,
    stageData: any,
    lastProcessedData: Record<string, any> = {}
  ): ProcessorState {
    console.log('Processing stage data for:', stageId, stageData);
    
    let nodes = [...currentNodes];
    let connections = [...currentConnections];
    
    // Check if data has changed to avoid unnecessary processing
    const dataKey = `${stageId}_data`;
    const currentDataHash = JSON.stringify(stageData);
    
    if (lastProcessedData[dataKey] === currentDataHash) {
      console.log('Data unchanged, skipping processing for:', stageId);
      return { nodes, connections, lastProcessedData };
    }

    try {
      // Process based on stage type
      switch (stageId) {
        case 'ideation-discovery':
          nodes = processIdeationData(nodes, stageData);
          break;
        case 'feature-planning':
          nodes = processFeatureData(nodes, stageData);
          break;
        case 'structure-flow':
          nodes = processStructureData(nodes, stageData);
          break;
        case 'architecture-design':
          nodes = processArchitectureData(nodes, stageData);
          break;
        case 'interface-interaction':
          nodes = processInterfaceData(nodes, stageData);
          break;
        case 'user-auth-flow':
          nodes = processAuthData(nodes, stageData);
          break;
        default:
          console.warn('Unknown stage type:', stageId);
      }

      // Update last processed data
      const updatedLastProcessedData = {
        ...lastProcessedData,
        [dataKey]: currentDataHash
      };

      console.log('Successfully processed stage data for:', stageId);
      return { 
        nodes, 
        connections, 
        lastProcessedData: updatedLastProcessedData 
      };
    } catch (error) {
      console.error('Error processing stage data:', error);
      return { nodes: currentNodes, connections: currentConnections, lastProcessedData };
    }
  }

  /**
   * Process authentication data and create/update canvas nodes
   * @deprecated Use processAuthData from authProcessor instead
   */
  static processAuthData(nodes: CanvasNode[], authData: any): CanvasNode[] {
    console.warn('CanvasDataProcessor.processAuthData is deprecated. Use processAuthData from authProcessor instead.');
    return processAuthData(nodes, authData);
  }
}