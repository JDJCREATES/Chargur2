/**
 * architectureProcessor.ts
 * 
 * Processes architecture design stage data into canvas nodes.
 * Handles the creation and updating of nodes related to database schema,
 * API endpoints, and system architecture.
 */

import { Node } from 'reactflow';
import * as nodeFactory from '../nodeFactory';

/**
 * Convert folder structure object to string representation
 */
function folderStructureToString(structure: any, indent: number = 0): string {
  if (!structure) return '';
  
  let result = '';
  const indentStr = ' '.repeat(indent);
  
  Object.entries(structure).forEach(([key, value]) => {
    result += `${indentStr}${key}\n`;
    
    if (Array.isArray(value)) {
      // Files
      value.forEach((file: string) => {
        result += `${indentStr}  ${file}\n`;
      });
    } else if (typeof value === 'object') {
      // Subdirectories
      result += folderStructureToString(value, indent + 2);
    }
  });
  
  return result;
}

// Helper function to check if objects are equal
function areObjectsEqual(obj1: any, obj2: any): boolean {
  if (!obj1 && !obj2) return true;
  if (!obj1 || !obj2) return false;
  
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Process architecture design stage data
 */
export function processArchitectureData(
  currentNodes: Node[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): Node[] {
  const architectureData = stageSpecificData;
  const lastArchitectureData = lastProcessedData['architecture-design'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  let nodesChanged = false;
  
  if (!architectureData || JSON.stringify(architectureData) === JSON.stringify(lastArchitectureData)) {
    return nodes;
  }

  // Create a map of existing nodes by ID for faster lookups
  const existingNodesMap = new Map<string, Node>();
  
  // Separate architecture nodes from other nodes
  const existingArchitectureNodes: Node[] = [];
  const otherNodes: Node[] = [];
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'architecture-design') {
      existingArchitectureNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });
  
  // Start with non-architecture nodes
  let newNodes = [...otherNodes];

  let systemX = 100;
  let systemY = 800;

  // Track which database table nodes we've processed
  const processedTableIds = new Set<string>();

  // Process database schema
  if (architectureData.databaseSchema) {
    const existingTableNodes = existingArchitectureNodes.filter(node => 
      node.data?.metadata?.tableType === 'database'
    );
    
    architectureData.databaseSchema.forEach((table: any, index: number) => {
      // Check if this table already exists
      const existingNode = existingTableNodes.find(node => 
        node.data?.metadata?.sourceId === table.id
      );
      
      if (existingNode) {
        // Check if table data has changed
        const tableFields = table.fields?.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n') || 'No fields defined';
        const hasChanged = 
          existingNode.data?.title !== `${table.name} Table` ||
          !existingNode.data?.content.includes(tableFields);
        
        if (hasChanged) {
          // Update the existing node
          const updatedNode = {
            ...existingNode,
            data: {
              ...existingNode.data,
              title: `${table.name} Table`,
              content: `Database table\n\nFields:\n${tableFields}${table.fields?.length > 4 ? '\n...' : ''}`
            }
          };
          newNodes.push(updatedNode);
          nodesChanged = true;
        } else {
          // Keep existing node unchanged
          newNodes.push(existingNode);
        }
        
        processedTableIds.add(existingNode.id);
      } else {
        // Create a new node
        const newNode = nodeFactory.createDatabaseTableNode(table, index, systemX, systemY, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Track if we've processed the API endpoints node
  let processedAPINode = false;

  let processedFolderStructureNode = false;
  // Process API endpoints
  if (architectureData.apiEndpoints) {
    // Check if API endpoints node already exists
    const existingNode = existingArchitectureNodes.find(node => 
      node.data?.metadata?.systemType === 'api'
    );
    
    if (existingNode) {
      processedAPINode = true;
      
      // Check if API endpoints have changed
      const hasChanged = 
        existingNode.data?.content !== `${architectureData.apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`;
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: `${architectureData.apiEndpoints.length} endpoints defined\n\nIncludes REST API routes for data operations`
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingNode);
      }
    } else {
      // Create a new node
      const newNode = nodeFactory.createAPIEndpointsNode(architectureData.apiEndpoints, systemX, systemY, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Track which route nodes we've processed
  const processedRouteIds = new Set<string>();

  // Process other architecture components
  if (architectureData.sitemap) {
    const existingRouteNodes = existingArchitectureNodes.filter(node => 
      node.data?.metadata?.routeType === 'page'
    );
    
    architectureData.sitemap.forEach((route: any, index: number) => {
      // Check if this route already exists
      const existingNode = existingRouteNodes.find(node => 
        node.data?.metadata?.sourceId === route.id
      );
      
      if (existingNode) {
        // Check if route data has changed
        const hasChanged = 
          existingNode.data?.title !== `${route.path} Route` ||
          !existingNode.data?.content.includes(route.component) ||
          !existingNode.data?.content.includes(route.protected ? 'Yes' : 'No') ||
          !existingNode.data?.content.includes(route.description);
        
        if (hasChanged) {
          // Update the existing node
          const updatedNode = {
            ...existingNode,
            data: {
              ...existingNode.data,
              title: `${route.path} Route`,
              content: `Component: ${route.component}\nProtected: ${route.protected ? 'Yes' : 'No'}\n\n${route.description}`
            }
          };
          newNodes.push(updatedNode);
          nodesChanged = true;
        } else {
          // Keep existing node unchanged
          newNodes.push(existingNode);
        }
        
        processedRouteIds.add(existingNode.id);
      } else {
        // Create a new node
        const newNode = nodeFactory.createRouteNode(route, index, systemX, systemY, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Process folder structure
  if (architectureData.folderStructure && Object.keys(architectureData.folderStructure).length > 0) {
    const folderStructureString = folderStructureToString(architectureData.folderStructure);
    
    // Check if folder structure node already exists
    const existingNode = existingArchitectureNodes.find(node => 
      node.type === 'markdownCode' && node.data?.title === 'Folder Structure'
    );
    
    if (existingNode) {
      processedFolderStructureNode = true;
      
      // Check if folder structure has changed
      if (existingNode.data?.content !== folderStructureString) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: folderStructureString
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingNode);
      }
    } else {
      // Create a new node
      const newNode = nodeFactory.createMarkdownCodeNode(
        folderStructureString,
        'Folder Structure',
        'Architecture Design',
        newNodes
      );
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Add any remaining architecture nodes that weren't processed
  existingArchitectureNodes.forEach(node => {
    // Skip nodes we've already processed
    if ((node.data?.metadata?.tableType === 'database' && processedTableIds.has(node.id)) ||
        (node.data?.metadata?.systemType === 'api' && processedAPINode) ||
        (node.data?.metadata?.routeType === 'page' && processedRouteIds.has(node.id)) ||
        (node.type === 'markdownCode' && node.data?.title === 'Folder Structure' && processedFolderStructureNode)) {
      return;
    }
    
    // Add the node to our new nodes array
    newNodes.push(node);
  });

  // Check if any nodes were actually changed
  const nodesAdded = newNodes.length - originalNodeCount;
  console.log('Processed architecture data:', nodesAdded, 'nodes added/updated, changed:', nodesChanged);
  
  // If no nodes were changed and the count is the same, return the original array
  if (!nodesChanged && newNodes.length === currentNodes.length) {
    return currentNodes;
  }

  return newNodes;
}