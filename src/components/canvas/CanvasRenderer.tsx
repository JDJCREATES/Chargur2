@@ .. @@
   const getConnectionPath = (connection: Connection) => {
     const fromNode = nodes.find(n => n.id === connection.from);
     const toNode = nodes.find(n => n.id === connection.to);
-    
-    if (!fromNode || !toNode) return null;
+
+    // Safety check for missing nodes or node properties
+    if (!fromNode || !toNode || !fromNode.position || !toNode.position || 
+        !fromNode.size || !toNode.size) {
+      return null;
+    }
     
     return {
       from: {
@@ -47,7 +52,7 @@
 
   return (
     <div className="relative w-full h-full">
-      {/* Grid Background */}
+      {/* Grid Background - always visible when showGrid is true */}
       {showGrid && (
         <div
           className="absolute inset-0 opacity-30"
@@ -58,7 +63,7 @@
         />
       )}
 
-      {/* Canvas Content Container */}
+      {/* Canvas Content Container - scales and positions all content */}
       <motion.div
         className="relative w-full h-full"
         animate={{
@@ -70,7 +75,7 @@
           transformOrigin: '0 0',
         }}
       >
-        {/* Render Connections */}
+        {/* Render Connections - only render valid connections */}
         {connections.map((connection) => {
           const path = getConnectionPath(connection);
           if (!path) return null;
@@ -84,7 +89,7 @@
           );
         })}
 
-        {/* Render Nodes */}
+        {/* Render Nodes - with safety checks */}
         {nodes.map((node) => {
           const isCustomIdeationNode = node.metadata?.stage === 'ideation-discovery' && 
                                       Object.values(STAGE1_NODE_TYPES).includes(node.type as any);