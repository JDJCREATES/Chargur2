/**
 * authProcessor.ts
 * 
 * Processes user authentication and authorization stage data into canvas nodes.
 * Handles the creation and updating of nodes related to auth methods,
 * user roles, and security features.
 */

import { CanvasNodeData } from '../../../components/canvas/CanvasNode';
import { ProcessorState } from '../../../components/canvas/core/CanvasDataProcessor';
import * as nodeFactory from '../nodeFactory';

/**
 * Process user authentication and authorization stage data
 */
export function processAuthData(
  stageData: any, 
  currentState: ProcessorState, 
  nodes: CanvasNodeData[]
): CanvasNodeData[] {
  const authData = stageData['user-auth-flow'] || {};
  const lastAuthData = (currentState.lastProcessedData || {})['user-auth-flow'] || {};
  const originalNodeCount = nodes.length;
  
  if (!authData || JSON.stringify(authData) === JSON.stringify(lastAuthData)) {
    return nodes;
  }

  let authX = 100;
  let authY = 1200;

  // Remove old auth nodes
  nodes = nodes.filter(node => 
    !node.metadata?.stage || node.metadata.stage !== 'user-auth-flow');

  // Process authentication methods
  if (authData.authMethods) {
    const enabledMethods = authData.authMethods.filter((m: any) => m.enabled);
    if (enabledMethods.length > 0) {
      nodes.push(nodeFactory.createAuthMethodsNode(enabledMethods, authX, authY, nodes));
    }
  }

  // Process user roles
  if (authData.userRoles && authData.userRoles.length > 0) {
    nodes.push(nodeFactory.createUserRolesNode(authData.userRoles, authX, authY, nodes));
  }

  // Process security features
  if (authData.securityFeatures) {
    const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
    if (enabledSecurity.length > 0) {
      nodes.push(nodeFactory.createSecurityFeaturesNode(enabledSecurity, authX, authY, nodes));
    }
  }

  console.log('Processed auth data:', nodes.length - originalNodeCount, 'nodes added/updated');

  return nodes;
}