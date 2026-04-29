// Toolbar Component - Tool selection, color picker, undo/redo

import { useAnnotationToolStore } from '../../stores/annotationToolStore'

export function Toolbar() {
  const {
    selectedTool,
    setSelectedTool,
    selectedColor,
    undo,
    redo,
    historyIndex,
    history,
  } = useAnnotationToolStore()

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const tools = [
    { id: 'click' as const, label: 'Click', color: '#3B82F6' },
    { id: 'extract' as const, label: 'Extract', color: '#22C55E' },
    { id: 'download' as const, label: 'Download', color: '#EF4444' },
  ]

  return (
    <div className="flex items-center gap-4 p-3 bg-white border-b border-gray-200">
      {/* Tool Selection */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-500 mr-2">Tool:</span>
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSelectedTool(tool.id)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all border-2
              ${selectedTool === tool.id
                ? 'border-transparent shadow-md'
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
            style={{
              backgroundColor: selectedTool === tool.id ? tool.color : 'transparent',
              color: selectedTool === tool.id ? 'white' : '#374151',
            }}
          >
            {tool.label}
          </button>
        ))}
      </div>

      {/* Color indicator */}
      <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
        <span className="text-sm text-gray-500">Color:</span>
        <div
          className="w-5 h-5 rounded-full border-2 border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 pl-4 border-l border-gray-200">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}