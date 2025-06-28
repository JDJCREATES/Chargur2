import React, { useState, useEffect } from "react";

import {
  Package,
  CheckCircle,
  Users,
  Shield,
  MessageSquare,
  BarChart,
  Upload,
  Download,
  CreditCard,
  Monitor,
  Brain,
  Code,
  Server,
  Database
} from "lucide-react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { Stage } from "../../../types";
import { FeatureCollection } from './feature-planning/FeatureCollection';
import { FeatureBreakdown } from './feature-planning/FeatureBreakdown';
import { FeaturePrioritization } from './feature-planning/FeaturePrioritization';
import { DependencyMapping } from './feature-planning/DependencyMapping';
import { ArchitecturePrep } from './feature-planning/ArchitecturePrep';
import { AIEnhancements } from './feature-planning/AIEnhancements';
import { FeatureSummary } from './feature-planning/FeatureSummary';
import { Feature, FeaturePack, PriorityBucket, ComplexityLevel } from './feature-planning/types';

// Define the enhanced architecture data types
interface Screen {
  name: string;
  type: string;
  description?: string;
}

interface ApiRoute {
  path: string;
  method: string;
  description?: string;
}

interface Component {
  name: string;
  type: string;
  description?: string;
  subComponents?: Component[];
}

interface ArchitectureData {
  screens: Screen[];
  apiRoutes: ApiRoute[];
  components: Component[];
}

interface FeaturePlanningProps {
  stage: Stage;
  initialFormData?: any;
  onComplete: () => void;
  onUpdateData: (data: any) => void;
  onSendMessage?: (message: string) => void;
}

interface Dependency {
  id: string;
  featureId: string;
  dependsOn: string;
  type: "requires" | "enhances" | "conflicts";
}

interface FormData {
  naturalLanguageFeatures: string;
  selectedFeaturePacks: string[];
  customFeatures: Feature[];
  mvpMode: boolean;
  aiEnhancements: string[];
  architecturePrep: {
    screens: string[];
    apiRoutes: string[];
    components: string[];
  };
}

export const FeaturePlanning: React.FC<FeaturePlanningProps> = ({
  stage,
  initialFormData,
  onComplete,
  onUpdateData, 
  onSendMessage
}) => {
  const defaultFormData = {
    naturalLanguageFeatures: "",
    selectedFeaturePacks: [] as string[],
    customFeatures: [] as Feature[],
    featureDependencies: [] as any[],
    mvpMode: false,
    aiEnhancements: [] as string[],
    architecturePrep: {
      screens: [] as Screen[],
      apiRoutes: [] as ApiRoute[],
      components: [] as Component[],
    } as ArchitectureData,
  };

  const [formData, setFormData] = useState<FormData>(() => ({
    ...defaultFormData,
    ...(initialFormData || {}),
  }));
  
  const [dependencyMap, setDependencyMap] = useState<Record<string, string[]>>({});
  
  const updateFormData = (key: string, value: any) => {
    console.log(`Updating ${key}:`, value);
    const updated = { ...formData, [key]: value };
    setFormData(updated);
    onUpdateData(updated);
  };
  
  // Update dependency map when features change
  useEffect(() => {
    const newDependencyMap: Record<string, string[]> = {};
    
    // Add feature packs
    formData.selectedFeaturePacks.forEach((packId: string) => {
      newDependencyMap[packId] = [];
    });
    
    // Add custom features and their dependencies
    formData.customFeatures.forEach((feature: Feature) => {
      newDependencyMap[feature.id] = [];
      
      // Add dependencies
      if (feature.dependencies && feature.dependencies.length > 0) {
        feature.dependencies.forEach(dep => {
          if (dep.dependsOn) {
            if (!newDependencyMap[feature.id]) {
              newDependencyMap[feature.id] = [];
            }
            newDependencyMap[feature.id].push(dep.dependsOn);
          }
        });
      }
    });
    
    setDependencyMap(newDependencyMap);
  }, [formData.selectedFeaturePacks, formData.customFeatures]);

  const featurePacks: FeaturePack[] = [
    {
      id: "auth",
      name: "Authentication & Users",
      description: "User registration, login, profiles, roles",
      icon: Shield,
      features: [
        "User Registration",
        "Login/Logout",
        "Password Reset",
        "User Profiles",
        "Role Management",
        "Email Verification",
      ],
      category: "auth",
    },
    {
      id: "crud",
      name: "Data Management (CRUD)",
      description: "Create, read, update, delete operations",
      icon: Database,
      features: [
        "Create Records",
        "View/List Records",
        "Edit Records",
        "Delete Records",
        "Search & Filter",
        "Data Validation",
      ],
      category: "crud",
    },
    {
      id: "social",
      name: "Social Features",
      description: "Comments, likes, sharing, following",
      icon: Users,
      features: [
        "Comments System",
        "Like/Reactions",
        "Social Sharing",
        "Follow/Unfollow",
        "Activity Feed",
        "User Mentions",
      ],
      category: "social",
    },
    {
      id: "communication",
      name: "Communication",
      description: "Chat, notifications, messaging",
      icon: MessageSquare,
      features: [
        "Real-time Chat",
        "Push Notifications",
        "Email Notifications",
        "Direct Messages",
        "Group Chat",
        "Message History",
      ],
      category: "communication",
    },
    {
      id: "commerce",
      name: "E-commerce",
      description: "Payments, cart, orders, inventory",
      icon: CreditCard,
      features: [
        "Shopping Cart",
        "Payment Processing",
        "Order Management",
        "Inventory Tracking",
        "Product Catalog",
        "Checkout Flow",
      ],
      category: "commerce",
    },
    {
      id: "analytics",
      name: "Analytics & Reporting",
      description: "Dashboards, metrics, insights",
      icon: BarChart,
      features: [
        "Analytics Dashboard",
        "User Metrics",
        "Performance Reports",
        "Data Visualization",
        "Export Reports",
        "Real-time Stats",
      ],
      category: "analytics",
    },
    {
      id: "media",
      name: "Media & Files",
      description: "Upload, storage, processing",
      icon: Upload,
      features: [
        "File Upload",
        "Image Processing",
        "Video Streaming",
        "File Storage",
        "Media Gallery",
        "Download Manager",
      ],
      category: "media",
    },
    {
      id: "ai",
      name: "AI & Automation",
      description: "Smart features, recommendations, automation",
      icon: Brain,
      features: [
        "AI Recommendations",
        "Smart Search",
        "Content Generation",
        "Auto-categorization",
        "Predictive Analytics",
        "Chatbot",
      ],
      category: "ai",
    },
  ];

  const priorityBuckets = [
    {
      id: "must",
      label: "Must Have",
      color: "red",
      description: "Critical for MVP",
    },
    {
      id: "should",
      label: "Should Have",
      color: "orange",
      description: "Important but not critical",
    },
    {
      id: "could",
      label: "Could Have",
      color: "yellow",
      description: "Nice to have",
    },
    {
      id: "wont",
      label: "Won't Have (Yet)",
      color: "gray",
      description: "Future versions",
    },
  ];

  const complexityLevels = [
    { id: "low", label: "Low", color: "green", description: "1-3 days" },
    {
      id: "medium",
      label: "Medium",
      color: "yellow",
      description: "1-2 weeks",
    },
    { id: "high", label: "High", color: "red", description: "2+ weeks" },
  ];

  const toggleFeaturePack = (packId: string) => {
    const updated = formData.selectedFeaturePacks.includes(packId)
      ? formData.selectedFeaturePacks.filter((id: string) => id !== packId)
      : [...formData.selectedFeaturePacks, packId];
    updateFormData("selectedFeaturePacks", updated);
  };

  const addCustomFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      name: "New Feature",
      description: "Describe this feature...",
      type: "core",
      priority: "should" as const,
      complexity: "medium",
      category: "frontend",
      subFeatures: [],
      dependencies: [] as Dependency[],
      estimatedEffort: 5,
    };
    updateFormData("customFeatures", [...formData.customFeatures, newFeature]);
  };
  
  const addDependency = (
    featureId: string,
    dependsOnId: string,
    type: "requires" | "enhances" | "conflicts" = "requires"
  ) => {
    const feature = formData.customFeatures.find(
      (f: Feature) => f.id === featureId
    );
    
    if (feature) {
      // Check if dependency already exists
      const existingDep = feature.dependencies.find(
        (d: Dependency) => d.featureId === featureId && d.dependsOn === dependsOnId
      );
      
      if (!existingDep) {
        const newDependency = {
          id: `${featureId}-${dependsOnId}`,
          featureId,
          dependsOn: dependsOnId,
          type
        };
        
        const updatedDependencies = [...feature.dependencies, newDependency];
        updateFeature(featureId, { dependencies: updatedDependencies });
      }
    }
  };
  
  const removeDependency = (featureId: string, dependencyId: string) => {
    const feature = formData.customFeatures.find(
      (f: Feature) => f.id === featureId
    );
    
    if (feature) {
      const updatedDependencies = feature.dependencies.filter(
        (d: Dependency) => d.id !== dependencyId
      );
      updateFeature(featureId, { dependencies: updatedDependencies });
    }
  };

  const updateFeature = (featureId: string, updates: Partial<Feature>): void => {
    const updated = formData.customFeatures.map((f: Feature) =>
      f.id === featureId ? { ...f, ...updates } : f
    );
    updateFormData("customFeatures", updated);
  };

  const removeFeature = (featureId: string): void => {
    // Remove the feature
    const updatedFeatures = formData.customFeatures.filter(
      (f: Feature) => f.id !== featureId
    );
    
    // Remove any dependencies that reference this feature
    const updatedFeaturesWithCleanDependencies = updatedFeatures.map((feature: Feature) => {
      const cleanedDependencies = feature.dependencies.filter(
        dep => dep.dependsOn !== featureId
      );
      return {
        ...feature,
        dependencies: cleanedDependencies
      };
    });
    
    updateFormData("customFeatures", updatedFeaturesWithCleanDependencies);
  };

  const generateAIFeatureBreakdown = (featureName: string) => {
    // Simulate AI feature breakdown
    const commonBreakdowns: { [key: string]: string[] } = {
      "user profiles": [
        "View user profile details",
        "Edit profile information",
        "Upload and crop profile avatar",
        "Set user preferences",
        "Configure privacy settings",
      ],
      "real-time chat": [
        "Send text messages",
        "Receive messages with delivery status",
        "Show typing indicators",
        "Access message history",
        "Support emoji reactions and attachments",
      ],
      "file upload": [
        "Select multiple files",
        "Show upload progress",
        "Validate file types and sizes",
        "Manage storage quotas",
        "Download and share uploaded files",
      ],
      notifications: [
        "Push notifications for mobile",
        "Email notifications for important events",
        "In-app notification center",
        "Notification preference settings",
        "Read/unread status tracking",
      ],
      authentication: [
        "Email/password registration",
        "Social login options",
        "Password reset flow",
        "Account verification",
        "Session management",
      ],
      payment: [
        "Multiple payment method support",
        "Secure checkout process",
        "Payment history tracking",
        "Subscription management",
        "Invoice generation",
      ],
      search: [
        "Full-text search capability",
        "Filter and sort results",
        "Search history tracking",
        "Suggested search terms",
        "Advanced search options",
      ],
      dashboard: [
        "Key metrics visualization",
        "Customizable widgets",
        "Data filtering options",
        "Export capabilities",
        "Real-time updates",
      ],
    };

    // Try to find an exact match first
    const key = featureName.toLowerCase().trim();
    if (commonBreakdowns[key]) {
      return commonBreakdowns[key];
    }

    // If no exact match, look for partial matches
    for (const breakdownKey in commonBreakdowns) {
      if (key.includes(breakdownKey) || breakdownKey.includes(key)) {
        return commonBreakdowns[breakdownKey];
      }
    }

    // Generate generic breakdown based on feature name
    return [
      `${featureName} setup and configuration`,
      `${featureName} core functionality`,
      `${featureName} user interface`,
      `${featureName} settings and customization`,
      `${featureName} integration with other features`,
    ];
  };

  const suggestAIEnhancements = () => {
    const suggestions = [
      "AI-powered search with natural language queries",
      "Smart content recommendations based on user behavior",
      "Automated content moderation and spam detection",
      "Intelligent form auto-completion",
      "Predictive analytics for user engagement",
      "AI chatbot for customer support",
      "Smart notification timing optimization",
      "Automated content categorization and tagging",
    ];

    updateFormData("aiEnhancements", suggestions.slice(0, 4));
  };

  const generateArchitecturePrep = () => {
    if (onSendMessage) {
      // Prepare feature data for the prompt
      const selectedPacks = featurePacks.filter((pack) =>
        formData.selectedFeaturePacks.includes(pack.id)
      );
      
      const featurePackDetails = selectedPacks.map(pack => ({
        name: pack.name,
        features: pack.features
      }));
      
      // Create a detailed prompt for the AI
      const prompt = `Based on my selected features, please generate a comprehensive architecture blueprint for my application.

Selected Feature Packs:
${JSON.stringify(featurePackDetails, null, 2)}

Custom Features:
${JSON.stringify(formData.customFeatures, null, 2)}

Please organize the architecture into three layers:
1. Screens Layer - All UI screens the user will interact with
2. API Layer - All API endpoints needed for data operations
3. Components Layer - All React components with proper hierarchy (parent components with their subcomponents)

For each screen, include:
- Name
- Type (core, secondary, modal)
- Brief description

For each API route, include:
- Path
- HTTP method
- Purpose/description

For each component, include:
- Name (with proper React naming convention)
- Type (layout, ui, form, display, utility)
- Description
- Subcomponents (if applicable)

Please organize these intelligently based on best practices for React applications. Group related components together and ensure the architecture reflects a production-ready application structure.

`;

      // Send the prompt to the AI
      onSendMessage(prompt);
    } else {
      console.warn("onSendMessage not available for architecture generation");
    }
  };

  // Get all available features for dependency mapping
  const getAllFeatures = () => {
    const features: { id: string, name: string, type: 'pack' | 'custom' }[] = [];
    
    // Add feature packs
    formData.selectedFeaturePacks.forEach((packId: string) => {
      const pack = featurePacks.find(p => p.id === packId);
      if (pack) {
        features.push({
          id: packId,
          name: pack.name,
          type: 'pack'
        });
      }
    });
    
    // Add custom features
    formData.customFeatures.forEach((feature: Feature) => {
      features.push({
        id: feature.id,
        name: feature.name,
        type: 'custom'
      });
    });
    
    return features;
  };
  
  // Get dependency type label
  const getDependencyTypeLabel = (type: string) => {
    switch (type) {
      case 'requires': return 'Requires';
      case 'enhances': return 'Enhances';
      case 'conflicts': return 'Conflicts with';
      default: return 'Depends on';
    }
  };
  
  // Get feature name by ID
  const getFeatureName = (featureId: string): string => {
    // Check if it's a feature pack
    if (formData.selectedFeaturePacks.includes(featureId)) {
      const pack = featurePacks.find(p => p.id === featureId);
      return pack ? pack.name : featureId;
    }
    
    // Check if it's a custom feature
    const customFeature = formData.customFeatures.find((f: Feature) => f.id === featureId);
    return customFeature ? customFeature.name : featureId;
  };
  
  // Check if we have enough features for dependency mapping
  const hasEnoughFeaturesForDependencies = () => {
    const totalFeatures = formData.selectedFeaturePacks.length + formData.customFeatures.length;
    return totalFeatures >= 2;
  };
  
  // Get common dependencies based on selected feature packs
  const getCommonDependencies = () => {
    const dependencies: { from: string, to: string, type: string, description: string }[] = [];
    
    // Check for auth dependencies
    if (formData.selectedFeaturePacks.includes('social') && 
        formData.selectedFeaturePacks.includes('auth')) {
      dependencies.push({
        from: 'social',
        to: 'auth',
        type: 'requires',
        description: 'Social features require user authentication'
      });
    }
    
    // Check for media dependencies
    if (formData.selectedFeaturePacks.includes('media') && 
        formData.selectedFeaturePacks.includes('auth')) {
      dependencies.push({
        from: 'media',
        to: 'auth',
        type: 'requires',
        description: 'Media uploads require user authentication'
      });
    }
    
    // Check for commerce dependencies
    if (formData.selectedFeaturePacks.includes('commerce') && 
        formData.selectedFeaturePacks.includes('auth')) {
      dependencies.push({
        from: 'commerce',
        to: 'auth',
        type: 'requires',
        description: 'E-commerce features require user authentication'
      });
    }
    
    // Check for analytics dependencies
    if (formData.selectedFeaturePacks.includes('analytics') && 
        formData.selectedFeaturePacks.includes('auth')) {
      dependencies.push({
        from: 'analytics',
        to: 'auth',
        type: 'enhances',
        description: 'User authentication enhances analytics with user-specific data'
      });
    }
    
    return dependencies;
  };
  
  const generateFeatureSummary = () => {
    const selectedPacks = featurePacks.filter((pack) =>
      formData.selectedFeaturePacks.includes(pack.id)
    );
    const totalFeatures =
      selectedPacks.reduce((acc, pack) => acc + pack.features.length, 0) +
      formData.customFeatures.length;
    const mustHaveFeatures = formData.customFeatures.filter(
      (f: Feature) => f.priority === "must"
    ).length;

    return `
**Feature Planning Summary**

**Natural Language Description:**
${formData.naturalLanguageFeatures || "No description provided"}

**Selected Feature Packs (${selectedPacks.length}):**
${selectedPacks
  .map((pack) => `- ${pack.name}: ${pack.features.length} features`)
  .join("\n")}

**Custom Features (${formData.customFeatures.length}):**
${formData.customFeatures
  .map(
    (f: Feature) => `- ${f.name} (${f.priority}, ${f.complexity} complexity)`
  )
  .join("\n")}
${formData.customFeatures
  .flatMap((f: Feature) => f.subFeatures?.map((sub) => `  - ${sub}`) || [])
  .join("\n")}
**Total Features:** ${totalFeatures}
**MVP Features:** ${mustHaveFeatures}
**AI Enhancements:** ${formData.aiEnhancements.length}

**Architecture Prep:**
- Screens: ${formData.architecturePrep.screens.length}
- API Routes: ${formData.architecturePrep.apiRoutes.length}
- Components: ${formData.architecturePrep.components.length}
    `.trim();
  };

  return (
    <div className="p-2 space-y-2">
  
      {/* 2.1 Feature Collection */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-yellow-600" />
            <Typography className="font-medium text-sm">Feature Collection</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FeatureCollection
            naturalLanguageFeatures={formData.naturalLanguageFeatures}
            onUpdateNaturalLanguageFeatures={(value) => updateFormData('naturalLanguageFeatures', value)}
            featurePacks={featurePacks}
            selectedFeaturePacks={formData.selectedFeaturePacks}
            onToggleFeaturePack={toggleFeaturePack}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2.2 Feature Breakdown */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-600" />
            <Typography className="font-medium text-sm">Feature Breakdown</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FeatureBreakdown
            selectedFeaturePacks={formData.selectedFeaturePacks}
            featurePacks={featurePacks}
            customFeatures={formData.customFeatures}
            onAddCustomFeature={addCustomFeature}
            onUpdateFeature={updateFeature}
            onRemoveFeature={removeFeature}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2.3 Feature Prioritization */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Feature Prioritization (MoSCoW)</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FeaturePrioritization
            priorityBuckets={priorityBuckets}
            customFeatures={formData.customFeatures}
            mvpMode={formData.mvpMode}
            onToggleMvpMode={(value) => updateFormData('mvpMode', value)}
            onUpdateFeature={updateFeature}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2.4 Dependency Mapping */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-purple-600" />
            <Typography className="font-medium text-sm">Dependency Mapping</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <DependencyMapping
            features={formData.customFeatures}
            onUpdateFeature={updateFeature}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2.5 Architecture Prep */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-indigo-600" />
            <Typography className="font-medium text-sm">Architecture Prep</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <ArchitecturePrep
            architectureData={formData.architecturePrep}
            onGenerateArchitecturePrep={generateArchitecturePrep}
            onSendMessage={onSendMessage}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2.6 Optional Enhancements */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-pink-600" />
            <Typography className="font-medium text-sm">AI Enhancements</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <AIEnhancements
            aiEnhancements={formData.aiEnhancements}
            onSuggestAIEnhancements={suggestAIEnhancements}
          />
        </AccordionDetails>
      </Accordion>

      {/* 2.7 Hand-off Prep */}
      <Accordion>
        <AccordionSummary expandIcon={<ChevronDown size={16} />}>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <Typography className="font-medium text-sm">Feature Summary & Complete</Typography>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <FeatureSummary
            generateFeatureSummary={generateFeatureSummary}
            onComplete={onComplete}
            customFeatures={formData.customFeatures}
            selectedFeaturePacks={formData.selectedFeaturePacks}
          />
        </AccordionDetails>
      </Accordion>
    </div>
  );
};