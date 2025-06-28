@@ .. @@
 import { motion } from 'framer-motion';
 import { CanvasNodeData } from './CanvasNode';
-import { DefaultCanvasNode } from './DefaultCanvasNode';
 import { DraggableConnectableWrapper } from './DraggableConnectableWrapper';
 import { CanvasConnection } from './CanvasConnection';
-import { 
-  AppNameNode, 
-  TaglineNode, 
-  CoreProblemNode, 
-  MissionNode, 
-  UserPersonaNode, 
-  ValuePropositionNode, 
-  CompetitorNode, 
-  TechStackNode,
-  UIStyleNode,
-  PlatformNode,
-  STAGE1_NODE_TYPES 
-} from '../customnodetypes/stage1nodes';
-import {
-  FeatureNode,
-  ArchitectureNode,
-  STAGE2_NODE_TYPES,
-} from '../customnodetypes/stage2nodes';
+import { nodeTypes } from './nodes';
+
+// Define constants for node types
+const STAGE1_NODE_TYPES = {
+  APP_NAME: 'appName',
+  TAGLINE: 'tagline',
+  CORE_PROBLEM: 'coreProblem',
+  MISSION: 'mission',
+  USER_PERSONA: 'userPersona',
+  VALUE_PROPOSITION: 'valueProp',
+  COMPETITOR: 'competitor', 
+  TECH_STACK: 'techStack',
+  UI_STYLE: 'uiStyle',
+  PLATFORM: 'platform'
+};
+
+const STAGE2_NODE_TYPES = { 
+  FEATURE: 'feature',
+  ARCHITECTURE: 'architecture',
+};
 
 export interface Connection {
@@ .. @@
         {nodes.map((node) => {
           const isCustomIdeationNode = (node.metadata?.stage === 'ideation-discovery' && 
                                       Object.values(STAGE1_NODE_TYPES).includes(node.type as any)) ||
                                       (node.metadata?.stage === 'feature-planning' && 
-                                      node.type === STAGE2_NODE_TYPES.FEATURE);
+                                      node.type === STAGE2_NODE_TYPES.FEATURE);
 
           return (
             <DraggableConnectableWrapper
@@ .. @@
               onEndConnection={onConnectionEnd}
               scale={scale}
             >
-              {isCustomIdeationNode ? (
-                // Render custom ideation node
-                (() => {
-                  const commonProps = {
-                    node: node as any,
-                    isSelected: selectedNodeId === node.id,
-                    onUpdate: onNodeUpdate,
-
-                    onSelect: onNodeSelect,
-                    scale: scale
-                  };
-
-                  switch (node.type) {
-                    case 'appName':
-                      return <AppNameNode {...commonProps} />;
-                    case 'tagline':
-                      return <TaglineNode {...commonProps} />;
-                    case 'coreProblem':
-                      return <CoreProblemNode {...commonProps} />;
-                    case 'mission':
-                      return <MissionNode {...commonProps} onSendMessage={onSendMessage} />;
-                    case 'userPersona':
-                      return <UserPersonaNode {...commonProps} onDelete={onNodeDelete} />;
-                    case 'valueProp':
-                      return <ValuePropositionNode {...commonProps} />;
-                    case 'competitor':
-                      return <CompetitorNode {...commonProps} onDelete={onNodeDelete} />;
-                    case 'techStack':
-                      return <TechStackNode {...commonProps} />;
-                    case 'uiStyle':
-                      return <UIStyleNode {...commonProps} />;
-                    case 'platform':
-                      return <PlatformNode {...commonProps} />;
-                    case STAGE2_NODE_TYPES.FEATURE:
-                      return <FeatureNode {...commonProps} onDelete={onNodeDelete} />;
-                    case STAGE2_NODE_TYPES.ARCHITECTURE:
-                      return <ArchitectureNode {...commonProps} onDelete={onNodeDelete} scale={scale} />;
-                    default:
-                      return <DefaultCanvasNode 
-                                node={node} 
-                                isSelected={selectedNodeId === node.id}
-                                onUpdate={onNodeUpdate}
-                                onDelete={onNodeDelete}
-                                onStartConnection={onConnectionStart}
-                              />;
-                  }
-                })()
-              ) : (
-                // Render default node
-                <DefaultCanvasNode 
-                  node={node} 
-                  isSelected={selectedNodeId === node.id}
-                  onUpdate={onNodeUpdate}
-                  onDelete={onNodeDelete}
-                  onStartConnection={onConnectionStart}
-                />
-              )}
+              {/* Use the node type to render the appropriate component */}
+              {React.createElement(nodeTypes[node.type] || nodeTypes.default, {
+                id: node.id,
+                data: {
+                  ...node.data,
+                  onNodeUpdate,
+                  onNodeDelete,
+                  onStartConnection,
+                  onSendMessage
+                },
+                selected: selectedNodeId === node.id,
+                isConnectable: true
+              })}
             </DraggableConnectableWrapper>
           );
         })}