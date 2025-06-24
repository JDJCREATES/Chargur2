@@ .. @@
       {/* Grid Background */}
       {showGrid && (
         <div
-          className="absolute inset-0 opacity-30"
+          className="absolute inset-0 opacity-30 transition-colors duration-200"
           style={{
-            backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
+            backgroundImage: `radial-gradient(circle, ${document.documentElement.classList.contains('dark') ? '#4b5563' : '#e5e7eb'} 1px, transparent 1px)`,
             backgroundSize: `${20 * scale}px ${20 * scale}px`,
             backgroundPosition: `${offset.x}px ${offset.y}px`,
           }}
         />
       )}
@@ .. @@
       {/* Canvas Info */}
-      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 p-3 text-xs text-gray-600">
+      <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 text-xs text-gray-600 dark:text-gray-300 transition-colors duration-200">
         <div>Nodes: {state.nodes.length}</div>
         <div>Connections: {state.connections.length}</div>
         <div>Zoom: {Math.round(state.scale * 100)}%</div>