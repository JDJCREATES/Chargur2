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

export interface FileStructure {
  [key: string]: FileStructure | string[];
}

export interface FormData {
  screens: Screen[];
  dataModels: DataModel[];
  userFlows: UserFlow[];
  fileStructure: FileStructure;
  stateManagement: string;
  dataFlow: string;
  navigationStyle?: string;
  userFlowComplexity?: string;
  screenDepth?: string;
  includeOnboarding?: boolean;
  includeAuth?: boolean;
  includeSettings?: boolean;
  [key: string]: any;
}