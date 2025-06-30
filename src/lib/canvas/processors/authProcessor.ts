/**
 * authProcessor.ts
 * 
 * Processes user authentication and authorization stage data into canvas nodes.
 * Handles the creation and updating of nodes related to auth methods,
 * user roles, and security features.
 */

import { Node } from 'reactflow';
import * as nodeFactory from '../nodeFactory';

// Helper function to check if arrays are equal
function areArraysEqual(arr1: any[] | undefined, arr2: any[] | undefined): boolean {
  if (!arr1 && !arr2) return true;
  if (!arr1 || !arr2) return false;
  if (arr1.length !== arr2.length) return false;
  
  // For simple arrays of primitives
  if (arr1.every(item => typeof item !== 'object')) {
    return arr1.every((item, index) => item === arr2[index]);
  }
  
  // For arrays of objects, we'd need deeper comparison
  // This is a simplified version
  return JSON.stringify(arr1) === JSON.stringify(arr2);
}

/**
 * Process user authentication and authorization stage data
 */
export function processAuthData(
  currentNodes: Node[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): Node[] {
  const authData = stageSpecificData || {};
  const lastAuthData = lastProcessedData['user-auth-flow'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  let nodesChanged = false;
  
  if (!authData || JSON.stringify(authData) === JSON.stringify(lastAuthData)) {
    return nodes;
  }

  // Create a map of existing nodes by ID for faster lookups
  const existingNodesMap = new Map<string, Node>();
  
  // Separate auth nodes from other nodes
  const existingAuthNodes: Node[] = [];
  const otherNodes: Node[] = [];
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'user-auth-flow') {
      existingAuthNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });
  
  // Start with non-auth nodes
  let newNodes = [...otherNodes];

  let authX = 100;
  let authY = 1200;

  // Track which nodes we've processed
  let processedAuthMethodsNode = false;
  let processedUserRolesNode = false;
  let processedSecurityFeaturesNode = false;

  // Process authentication methods
  if (authData.authMethods) {
    const enabledMethods = authData.authMethods.filter((m: any) => m.enabled);
    if (enabledMethods.length > 0) {
      // Check if auth methods node already exists
      const existingNode = existingAuthNodes.find(node => 
        node.data?.metadata?.authType === 'methods'
      );
      
      if (existingNode) {
        processedAuthMethodsNode = true;
        
        // Check if auth methods have changed
        const methodsContent = enabledMethods.map((m: any) => `• ${m.name}`).join('\n');
        const hasChanged = 
          existingNode.data?.content !== `${enabledMethods.length} methods enabled\n\n${methodsContent}`;
        
        if (hasChanged) {
          // Update the existing node
          const updatedNode = {
            ...existingNode,
            data: {
              ...existingNode.data,
              content: `${enabledMethods.length} methods enabled\n\n${methodsContent}`
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
        const newNode = nodeFactory.createAuthMethodsNode(enabledMethods, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    }
  }

  // Process user roles
  if (authData.userRoles && authData.userRoles.length > 0) {
    // Check if user roles node already exists
    const existingNode = existingAuthNodes.find(node => 
      node.data?.metadata?.authType === 'roles'
    );
    
    if (existingNode) {
      processedUserRolesNode = true;
      
      // Check if user roles have changed
      const hasChanged = !areArraysEqual(
        authData.userRoles.map((r: any) => r.name),
        existingNode.data?.content.match(/• ([^:]+):/g)?.map((m: string) => m.replace(/• ([^:]+):/, '$1').trim())
      );
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: `${authData.userRoles.length} roles defined\n\n${authData.userRoles.map((r: any) => {
              const name = r?.name || 'Unnamed Role';
              const description = r?.description || '';
              const truncatedDesc = description && typeof description === 'string' 
                ? description.slice(0, 20) + '...' 
                : 'No description';
              return `• ${name}: ${truncatedDesc}`;
            }).join('\n')}`
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
      const newNode = nodeFactory.createUserRolesNode(authData.userRoles, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Process security features
  if (authData.securityFeatures) {
    const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
    if (enabledSecurity.length > 0) {
      // Check if security features node already exists
      const existingNode = existingAuthNodes.find(node => 
        node.data?.metadata?.authType === 'security'
      );
      
      if (existingNode) {
        processedSecurityFeaturesNode = true;
        
        // Check if security features have changed
        const securityContent = enabledSecurity.slice(0, 4).map((f: any) => `• ${f.name}`).join('\n');
        const hasChanged = 
          existingNode.data?.content !== `${enabledSecurity.length} features enabled\n\n${securityContent}${enabledSecurity.length > 4 ? '\n...' : ''}`;
        
        if (hasChanged) {
          // Update the existing node
          const updatedNode = {
            ...existingNode,
            data: {
              ...existingNode.data,
              content: `${enabledSecurity.length} features enabled\n\n${securityContent}${enabledSecurity.length > 4 ? '\n...' : ''}`
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
        const newNode = nodeFactory.createSecurityFeaturesNode(enabledSecurity, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    }
  }

  // Add any remaining auth nodes that weren't processed
  existingAuthNodes.forEach(node => {
    // Skip nodes we've already processed
    if ((node.data?.metadata?.authType === 'methods' && processedAuthMethodsNode) ||
        (node.data?.metadata?.authType === 'roles' && processedUserRolesNode) ||
        (node.data?.metadata?.authType === 'security' && processedSecurityFeaturesNode)) {
      return;
    }
    
    // Add the node to our new nodes array
    newNodes.push(node);
  });

  // Check if any nodes were actually changed
  const nodesAdded = newNodes.length - originalNodeCount;
  console.log('Processed auth data:', nodesAdded, 'nodes added/updated, changed:', nodesChanged);
  
  // If no nodes were changed and the count is the same, return the original array
  if (!nodesChanged && newNodes.length === currentNodes.length) {
    return currentNodes;
  }

  return newNodes;
}