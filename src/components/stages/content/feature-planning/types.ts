export interface Feature {
  id: string;
  name: string;
  description: string;
  type: 'core' | 'admin' | 'user' | 'optional' | 'stretch';
  priority: 'must' | 'should' | 'could' | 'wont';
  complexity: 'low' | 'medium' | 'high';
  category: 'frontend' | 'backend' | 'both' | 'ai-assisted' | 'api-required';
  subFeatures: string[];
  dependencies: FeatureDependency[];
  estimatedEffort: number; // 1-10 scale
}

export interface FeatureDependency {
  id: string;
  featureId: string;
  dependsOn: string;
  type: 'requires' | 'enhances' | 'conflicts';
}

export interface FeaturePack {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  features: string[];
  category: 'auth' | 'crud' | 'social' | 'commerce' | 'analytics' | 'ai' | 'media' | 'communication';
}

export interface PriorityBucket {
  id: string;
  label: string;
  color: string;
  description: string;
}

export interface ComplexityLevel {
  id: string;
  label: string;
  color: string;
  description: string;
}