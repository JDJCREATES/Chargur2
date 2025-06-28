/**
 * Types for Structure & Flow stage
 */

export interface Screen {
  id: string;
  name: string;
  type: 'core' | 'secondary' | 'modal';
}

export interface DataModel {
  id: string;
  name: string;
  fields: string[];
  relations?: string[];
}

export interface UserFlow {
  id: string;
  name: string;
  steps: string[];
  description?: string;
}

export interface Component {
  id: string;
  name: string;
  type: 'layout' | 'ui' | 'form' | 'display' | 'utility';
  props: string[];
  description?: string;
}

export interface FeatureBlueprint {
  id: string;
  name: string;
  description: string;
  components: string[];
  apis: string[];
  context: string;
  category: 'core' | 'secondary' | 'optional';
}

export interface FileStructure {
  [key: string]: FileStructure | string[];
}

export interface FormData {
  screens: Screen[];
  dataModels: DataModel[];
  userFlows: UserFlow[];
  components: Component[];
  featureBlueprints: FeatureBlueprint[];
  fileStructure: FileStructure;
  stateManagement: string;
  dataFlow: string;
  navigationStyle?: string;
  userFlowComplexity?: string;
  screenDepth?: string;
  includeOnboarding?: boolean;
  includeAuth?: boolean;
  includeSettings?: boolean;
}