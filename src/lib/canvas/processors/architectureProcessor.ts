/**
 * architectureProcessor.ts
 * 
 * Processes architecture design stage data into canvas nodes.
 * Handles the creation and updating of nodes related to database schema,
 * API endpoints, and system architecture.
 */

import { Node } from 'reactflow';
import * as nodeFactory from '../nodeFactory';

// Helper function to check if an API endpoint is related to a route
function isApiEndpointRelatedToRoute(endpoint: any, route: any): boolean {
  if (!endpoint || !route) return false;
  
  // Convert route path to API path format (remove trailing slashes, etc.)
  const routePath = route.path.replace(/\/$/, '');
  const routePathSegments = routePath.split('/').filter(Boolean);
  
  // Check if the API endpoint path contains the route path
  const endpointPath = endpoint.path.replace(/\/$/, '');
  const endpointPathSegments = endpointPath.split('/').filter(Boolean);
  
  // Check for exact match (e.g., route: /users, api: /api/users)
  if (endpointPath.includes(routePath) || endpointPath.includes(`/api${routePath}`)) {
    return true;
  }
  
  // Check for resource name match (e.g., route: /users, api: /api/users/123)
  if (routePathSegments.length > 0 && endpointPathSegments.length > 0) {
    const routeResource = routePathSegments[routePathSegments.length - 1];
    return endpointPathSegments.some((segment: string) => 
      segment === routeResource || 
      segment === `${routeResource}s` || // Plural form
      routeResource === `${segment}s` // Singular form
    );
  }
  
  // Check for component name match (e.g., component: UserProfile, api: /api/users)
  if (route.component) {
    const componentName = route.component.toLowerCase();
    const resourceNames = endpointPathSegments.map((s: string) => s.toLowerCase());
    
    // Check for partial matches (e.g., UserProfile -> users)
    for (const resource of resourceNames) {
      if (componentName.includes(resource) || 
          resource.includes(componentName.replace('component', '').replace('page', '').replace('screen', ''))) {
        return true;
      }
    }
  }
  
  return false;
}

// Helper function to check if a node is a folder structure node for architecture stage
function isArchitectureFolderStructureNode(node: Node): boolean {
  return node.type === 'markdownCode' && 
         node.data?.title === 'Folder Structure' && 
         node.data?.metadata?.stage === 'architecture-design';
}

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
  // Track the folder structure node specifically
  let existingFolderStructureNode: Node | undefined;
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'architecture-design') {
      // Check if this is the folder structure node
      if (isArchitectureFolderStructureNode(node)) {
        existingFolderStructureNode = node;
      } else {
        existingArchitectureNodes.push(node);
      }
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
        const newNode = nodeFactory.createDatabaseTableNode(table, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Track if we've processed the API endpoints node
  let processedAPINode = false;

  // Process API endpoints
  if (architectureData.apiEndpoints) {
    // Check if API endpoints node already exists
    const existingNode = existingArchitectureNodes.find(node => 
      node.data?.metadata?.systemType === 'api'
    );
    
    if (existingNode) {
      processedAPINode = true;
      
      // Check if API endpoints have changed
      const endpointsLength = Array.isArray(architectureData.apiEndpoints) ? architectureData.apiEndpoints.length : 0;
      const hasChanged = 
        existingNode.data?.content !== `${endpointsLength} endpoints defined\n\nIncludes REST API routes for data operations`;
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: `${endpointsLength} endpoints defined\n\nIncludes REST API routes for data operations`
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
      const newNode = nodeFactory.createAPIEndpointsNode(architectureData.apiEndpoints, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Track which route nodes we've processed
  const processedRouteIds = new Set<string>();

  // Track which route-API mapping nodes we've processed
  const processedRouteApiMappingIds = new Set<string>();

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
        const newNode = nodeFactory.createRouteNode(route, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Process route-API mappings
  if (architectureData.sitemap && Array.isArray(architectureData.apiEndpoints)) {
    const existingRouteApiMappingNodes = existingArchitectureNodes.filter(node => 
      node.type === 'routeApiMapping'
    );
    
    architectureData.sitemap.forEach((route: any) => {
      // Find API endpoints related to this route
      const relatedApiEndpoints = architectureData.apiEndpoints.filter((endpoint: any) => 
        isApiEndpointRelatedToRoute(endpoint, route)
      );
      
      // Only create a mapping node if there are related API endpoints
      if (relatedApiEndpoints.length > 0) {
        // Check if a mapping node already exists for this route
        const existingNode = existingRouteApiMappingNodes.find(node => 
          node.data?.metadata?.routeId === route.id
        );
        
        if (existingNode) {
          processedRouteApiMappingIds.add(existingNode.id);
          
          // Check if the related API endpoints have changed
          const currentEndpointIds = existingNode.data?.apiEndpoints?.map((e: any) => e.id).sort().join(',') || '';
          const newEndpointIds = relatedApiEndpoints.map((e: any) => e.id).sort().join(',');
          
          if (currentEndpointIds !== newEndpointIds || 
              existingNode.data?.route?.path !== route.path ||
              existingNode.data?.route?.component !== route.component ||
              existingNode.data?.route?.protected !== route.protected) {
            
            // Update the existing node
            const updatedNode = {
              ...existingNode,
              data: {
                ...existingNode.data,
                title: `${route.path} Mapping`,
                route,
                apiEndpoints: relatedApiEndpoints
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
          const newNode = nodeFactory.createRouteApiMappingNode(
            route,
            relatedApiEndpoints,
            newNodes
          );
          newNodes.push(newNode);
          nodesChanged = true;
        }
      }
    });
  }

  // Process folder structure - with special handling
  if (architectureData.folderStructure && Object.keys(architectureData.folderStructure).length > 0) {
    const folderStructureString = folderStructureToString(architectureData.folderStructure);
    
    // Check if architecture folder structure node already exists
    if (existingFolderStructureNode) {
      // Check if folder structure has changed
      if (existingFolderStructureNode.data?.content !== folderStructureString) {
        // Update the existing node
        const updatedNode = {
          ...existingFolderStructureNode,
          data: {
            ...existingFolderStructureNode.data,
            content: folderStructureString
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingFolderStructureNode);
      }
    } else {
      // Create a new node
      const newNode = nodeFactory.createMarkdownCodeNode(
        folderStructureString,
        'Folder Structure',
        'Architecture Design',
        newNodes
      );
      
      // Ensure the node is tagged with the architecture-design stage
      newNode.data.metadata = {
        ...newNode.data.metadata,
        stage: 'architecture-design'
      };
      
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
        (node.type === 'routeApiMapping' && processedRouteApiMappingIds.has(node.id))) {
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