/**
 * processors/index.ts
 * 
 * Exports all stage-specific processors for the canvas data processing system.
 * This provides a centralized import point for the CanvasDataProcessor.
 */

export { processIdeationData } from './ideationProcessor';
export { processFeatureData } from './featureProcessor';
export { processStructureData } from './structureProcessor';
export { processArchitectureData } from './architectureProcessor';
export { processInterfaceData } from './interfaceProcessor';
export { processAuthData } from './authProcessor';