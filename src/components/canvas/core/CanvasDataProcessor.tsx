import { CanvasNode } from '../../../types';
import { getSmartNodePosition } from '../../lib/canvas/nodePlacementUtils';

export class CanvasDataProcessor {
  /**
   * Process authentication data and create/update canvas nodes
   */
  static processAuthData(nodes: CanvasNode[], authData: any): CanvasNode[] {
    console.log('Processing auth data:', authData);
    
    const originalNodeCount = nodes.length;
    const authX = 100;
    const authY = 100;

    // Process authentication methods
    if (authData.authMethods && authData.authMethods.length > 0) {
      const enabledMethods = authData.authMethods.filter((method: any) => method.enabled);
      if (enabledMethods.length > 0) {
        const newNode = this.createAuthMethodsNode(enabledMethods, authX, authY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { x: authX, y: authY },
          'user-auth-flow'
        );
        nodes.push(newNode);
      }
    }

    // Process user roles
    if (authData.userRoles && authData.userRoles.length > 0) {
      const newNode = this.createUserRolesNode(authData.userRoles, authX, authY);
      // Use smart positioning for new node
      newNode.position = getSmartNodePosition(
        nodes,
        newNode.size,
        newNode.type,
        { x: authX + 180, y: authY },
        'user-auth-flow'
      );
      nodes.push(newNode);
    }

    // Process security features
    if (authData.securityFeatures) {
      const enabledSecurity = authData.securityFeatures.filter((f: any) => f.enabled);
      if (enabledSecurity.length > 0) {
        const newNode = this.createSecurityFeaturesNode(enabledSecurity, authX, authY);
        // Use smart positioning for new node
        newNode.position = getSmartNodePosition(
          nodes,
          newNode.size,
          newNode.type,
          { x: authX + 340, y: authY },
          'user-auth-flow'
        );
        nodes.push(newNode);
      }
    }

    console.log('Processed auth data:', nodes.length - originalNodeCount, 'nodes added/updated');

    return nodes;
  }

  /**
   * Create authentication methods node
   */
  private static createAuthMethodsNode(methods: any[], x: number, y: number): CanvasNode {
    return {
      id: `auth-methods-${Date.now()}`,
      type: 'auth-methods',
      position: { x, y },
      size: { width: 160, height: 120 },
      data: {
        title: 'Auth Methods',
        content: methods.map(m => m.name).join(', '),
        methods: methods
      }
    };
  }

  /**
   * Create user roles node
   */
  private static createUserRolesNode(roles: any[], x: number, y: number): CanvasNode {
    return {
      id: `user-roles-${Date.now()}`,
      type: 'user-roles',
      position: { x, y },
      size: { width: 160, height: 120 },
      data: {
        title: 'User Roles',
        content: roles.join(', '),
        roles: roles
      }
    };
  }

  /**
   * Create security features node
   */
  private static createSecurityFeaturesNode(features: any[], x: number, y: number): CanvasNode {
    return {
      id: `security-features-${Date.now()}`,
      type: 'security-features',
      position: { x, y },
      size: { width: 160, height: 120 },
      data: {
        title: 'Security Features',
        content: features.map(f => f.name).join(', '),
        features: features
      }
    };
  }

  /**
   * Create stable hash function that ignores object key ordering
   */
  private static createStableHash(data: any): string {
    // Create a hash that's stable across object key reordering
    const sortedData = this.sortObjectKeys(data);
    return JSON.stringify(sortedData);
  }

  /**
   * Recursively sort object keys to ensure consistent hashing
   */
  private static sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => this.sortObjectKeys(item));
    
    const sorted: any = {};
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys(obj[key]);
    });
    return sorted;
  }
}