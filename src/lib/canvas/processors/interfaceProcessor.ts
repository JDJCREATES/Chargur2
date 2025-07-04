/**
 * interfaceProcessor.ts
 * 
 * Processes interface and interaction stage data into canvas nodes.
 * Handles the creation and updating of nodes related to design systems,
 * branding, and layout components.
 */

import { Node } from 'reactflow';
import * as nodeFactory from '../nodeFactory';

// Helper function to check if objects are equal
function areObjectsEqual(obj1: any, obj2: any): boolean {
  if (!obj1 && !obj2) return true;
  if (!obj1 || !obj2) return false;
  
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

/**
 * Process interface and interaction stage data
 */
export function processInterfaceData(
  currentNodes: Node[],
  stageSpecificData: any,
  lastProcessedData: Record<string, any>
): Node[] {
  const interfaceData = stageSpecificData || {};
  const lastInterfaceData = lastProcessedData['interface-interaction'] || {};
  let nodes = [...currentNodes];
  const originalNodeCount = nodes.length;
  let nodesChanged = false;
  
  if (!interfaceData || JSON.stringify(interfaceData) === JSON.stringify(lastInterfaceData)) {
    return nodes;
  }

  // Create a map of existing nodes by ID for faster lookups
  const existingNodesMap = new Map<string, Node>();
  
  // Separate interface nodes from other nodes
  const existingInterfaceNodes: Node[] = [];
  const otherNodes: Node[] = [];
  
  currentNodes.forEach(node => {
    existingNodesMap.set(node.id, node);
    
    if (node.data?.metadata?.stage === 'interface-interaction') {
      existingInterfaceNodes.push(node);
    } else {
      otherNodes.push(node);
    }
  });
  
  // Start with non-interface nodes
  let newNodes = [...otherNodes];

  let uiX = 100;
  let uiY = 1000;

  // Track which nodes we've processed
  const processedDesignSystemNode = false;
  const processedLayoutNode = false;
  let processedLofiLayoutNodes: string[] = [];

  // Process design system
  if (interfaceData.selectedDesignSystem) {
    // Check if design system node already exists
    const existingNode = existingInterfaceNodes.find(node => 
      node.data?.metadata?.uiType === 'design-system'
    );
    
    if (existingNode) {
      // Check if design system has changed
      if (existingNode.data?.content.indexOf(interfaceData.selectedDesignSystem) === -1) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: `${interfaceData.selectedDesignSystem}\n\nComponent library and styling approach`
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
      const newNode = nodeFactory.createDesignSystemNode(interfaceData.selectedDesignSystem, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Process custom branding
  if (interfaceData.customBranding) {
    // Check if branding node already exists
    const existingBrandingNode = existingInterfaceNodes.find(node => 
      node.type === 'branding'
    );
    
    if (existingBrandingNode) {
      // Check if branding data has changed
      const hasChanged = 
        existingBrandingNode.data?.primaryColor !== interfaceData.customBranding.primaryColor ||
        existingBrandingNode.data?.secondaryColor !== interfaceData.customBranding.secondaryColor ||
        existingBrandingNode.data?.fontFamily !== interfaceData.customBranding.fontFamily ||
        existingBrandingNode.data?.borderRadius !== interfaceData.customBranding.borderRadius ||
        existingBrandingNode.data?.designSystem !== interfaceData.selectedDesignSystem;
      
      if (hasChanged) {
        // Update the existing node
        const updatedNode = {
          ...existingBrandingNode,
          data: {
            ...existingBrandingNode.data,
            primaryColor: interfaceData.customBranding.primaryColor,
            secondaryColor: interfaceData.customBranding.secondaryColor,
            accentColor: interfaceData.customBranding.accentColor || '#F59E0B',
            fontFamily: interfaceData.customBranding.fontFamily,
            bodyFont: interfaceData.customBranding.bodyFont || 'Roboto',
            borderRadius: interfaceData.customBranding.borderRadius,
            designSystem: interfaceData.selectedDesignSystem
          }
        };
        newNodes.push(updatedNode);
        nodesChanged = true;
      } else {
        // Keep existing node unchanged
        newNodes.push(existingBrandingNode);
      }
    } else {
      // Create a new branding node
      const brandingData = {
        primaryColor: interfaceData.customBranding.primaryColor,
        secondaryColor: interfaceData.customBranding.secondaryColor,
        accentColor: interfaceData.customBranding.accentColor || '#F59E0B',
        fontFamily: interfaceData.customBranding.fontFamily,
        bodyFont: interfaceData.customBranding.bodyFont || 'Roboto',
        borderRadius: interfaceData.customBranding.borderRadius,
        designSystem: interfaceData.selectedDesignSystem
      };
      
      const newNode = nodeFactory.createBrandingNode(brandingData, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Process layout blocks
  if (interfaceData.layoutBlocks && interfaceData.layoutBlocks.length > 0) {
    // Check if layout node already exists
    const existingNode = existingInterfaceNodes.find(node => 
      node.data?.metadata?.uiType === 'layout'
    );
    
    if (existingNode) {
      // Check if layout blocks have changed
      if (!areObjectsEqual(existingNode.data?.layoutBlocks, interfaceData.layoutBlocks)) {
        // Update the existing node
        const updatedNode = {
          ...existingNode,
          data: {
            ...existingNode.data,
            content: `${interfaceData.layoutBlocks.length} layout blocks\n\n${interfaceData.layoutBlocks.map((block: any) => block.type).join(', ')}`,
            layoutBlocks: interfaceData.layoutBlocks
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
      const newNode = nodeFactory.createLayoutNode(interfaceData.layoutBlocks, newNodes);
      newNodes.push(newNode);
      nodesChanged = true;
    }
  }

  // Process lofi layouts
  if (interfaceData.lofiLayouts && Array.isArray(interfaceData.lofiLayouts) && interfaceData.lofiLayouts.length > 0) {
    // Find existing lofi layout nodes
    const existingLofiNodes = existingInterfaceNodes.filter(node => node.type === 'lofiLayout');
    
    // Process each lofi layout
    interfaceData.lofiLayouts.forEach((layout: any) => {
      if (!layout.layoutId) {
        console.warn('Skipping lofi layout without layoutId');
        return;
      }
      
      // Check if this layout already exists
      const existingNode = existingLofiNodes.find(node => 
        node.data && node.data.layoutId === layout.layoutId
      );
      
      if (existingNode) {
        // Track that we've processed this node
        processedLofiLayoutNodes.push(existingNode.id);
        
        // Check if layout data has changed
        const hasChanged = 
          existingNode.data.templateName !== layout.templateName ||
          !areObjectsEqual(existingNode.data.layoutBlocks, layout.layoutBlocks) ||
          existingNode.data.viewMode !== layout.viewMode;
        
        if (hasChanged) {
          // Update the existing node
          const updatedNode = {
            ...existingNode,
            data: {
              ...existingNode.data,
              templateName: layout.templateName,
              layoutBlocks: layout.layoutBlocks,
              description: layout.description,
              viewMode: layout.viewMode
            }
          };
          newNodes.push(updatedNode);
          nodesChanged = true;
        } else {
          // Keep existing node unchanged
          newNodes.push(existingNode);
        }
      } else {
        // Create a new lofi layout node
        const newNode = nodeFactory.createLofiLayoutNode(layout, newNodes);
        newNodes.push(newNode);
        nodesChanged = true;
      }
    });
  }

  // Add any remaining interface nodes that weren't processed
  existingInterfaceNodes.forEach(node => {
    // Skip nodes we've already processed
    if ((node.data && node.data.metadata && node.data.metadata.uiType === 'design-system' && processedDesignSystemNode) ||
        (node.data && node.data.metadata && node.data.metadata.uiType === 'layout' && processedLayoutNode) ||
        (node.type === 'lofiLayout' && node.id && processedLofiLayoutNodes.includes(node.id)) ||
        (node.type === 'branding' && interfaceData.customBranding)) {
      return;
    }
    
    // Add the node to our new nodes array
    newNodes.push(node);
  });

  // Check if any nodes were actually changed
  const nodesAdded = newNodes.length - originalNodeCount;
  console.log('Processed interface data:', nodesAdded, 'nodes added/updated, changed:', nodesChanged, 'lofi layouts:', interfaceData.lofiLayouts?.length || 0);
  
  // If no nodes were changed and the count is the same, return the original array
  if (!nodesChanged && newNodes.length === currentNodes.length) {
    return currentNodes;
  }

  return newNodes;
}