import { CanvasNode } from '../../../types';
import { nodeFactory } from '../nodeFactory';

export function processFeatureData(
  currentNodes: CanvasNode[],
  stageSpecificData: any,
  lastProcessedData: any
): CanvasNode[] {
  // Filter out existing feature-planning nodes to avoid duplicates
  const filteredNodes = currentNodes.filter(node => 
    !node.type?.includes('feature') && 
    !node.type?.includes('architecture')
  );

  const newNodes: CanvasNode[] = [];

  // Process feature packs if they exist
  if (stageSpecificData?.featurePacks) {
    stageSpecificData.featurePacks.forEach((featurePack: any, index: number) => {
      const featurePackNode = nodeFactory.createFeaturePackNode(
        featurePack,
        { x: 100 + (index * 250), y: 100 }
      );
      if (featurePackNode) {
        newNodes.push(featurePackNode);
      }
    });
  }

  // Process custom features if they exist
  if (stageSpecificData?.customFeatures) {
    stageSpecificData.customFeatures.forEach((feature: any, index: number) => {
      const customFeatureNode = nodeFactory.createCustomFeatureNode(
        feature,
        { x: 100 + (index * 250), y: 300 }
      );
      if (customFeatureNode) {
        newNodes.push(customFeatureNode);
      }
    });
  }

  // Process natural language features if they exist
  if (stageSpecificData?.naturalLanguageFeatures) {
    stageSpecificData.naturalLanguageFeatures.forEach((feature: any, index: number) => {
      const nlFeatureNode = nodeFactory.createNaturalLanguageFeatureNode(
        feature,
        { x: 100 + (index * 250), y: 500 }
      );
      if (nlFeatureNode) {
        newNodes.push(nlFeatureNode);
      }
    });
  }

  // Process architecture data if it exists
  if (stageSpecificData?.architecture) {
    const architectureNode = nodeFactory.createArchitectureNode(
      stageSpecificData.architecture,
      { x: 400, y: 700 }
    );
    if (architectureNode) {
      newNodes.push(architectureNode);
    }
  }

  // Return the filtered existing nodes plus the new feature nodes
  return [...filteredNodes, ...newNodes];
}