const getConnectionPath = (connection: Connection) => {
     const fromNode = nodes.find(n => n.id === connection.from);
     const toNode = nodes.find(n => n.id === connection.to);

    // Safety check for missing nodes or node properties
    if (!fromNode || !toNode || !fromNode.position || !toNode.position || 
        !fromNode.size || !toNode.size) {
      return null;
    }
    
    return {
      from: {
        x: fromNode.position.x + fromNode.size.width,
        y: fromNode.position.y + fromNode.size.height / 2
      },
      to: {
        x: toNode.position.x,
        y: toNode.position.y + toNode.size.height / 2
      }
    }
  }

  return (
    <div className="relative w-full h-full">
      {/* Grid Background - always visible when showGrid is true */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${gridPattern})`,
            backgroundSize: `${GRID_SIZE * scale}px ${GRID_SIZE * scale}px`
          }}
        />
      )}

      {/* Canvas Content Container - scales and positions all content */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          scale,
          x: position.x,
          y: position.y,
        }}
        style={{
          transformOrigin: '0 0',
        }}
      >
        {/* Render Connections - only render valid connections */}
        {connections.map((connection) => {
          const path = getConnectionPath(connection);
          if (!path) return null;
          
          return (
            <Connection
              key={connection.id}
              from={path.from}
              to={path.to}
            />
          );
        })}

        {/* Render Nodes - with safety checks */}
        {nodes.map((node) => {
          const isCustomIdeationNode = node.metadata?.stage === 'ideation-discovery' && 
                                      Object.values(STAGE1_NODE_TYPES).includes(node.type as any);
          
          return isCustomIdeationNode ? (
            <IdeationNode key={node.id} node={node} />
          ) : (
            <Node key={node.id} node={node} />
          );
        })}
      </motion.div>
    </div>
  )