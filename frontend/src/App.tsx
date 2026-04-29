import { Routes, Route, Navigate } from 'react-router-dom'
import WorkflowList from './components/workflow/WorkflowList'
import WorkflowDetail from './components/workflow/WorkflowDetail'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">SnapFlow</h1>
          <nav className="flex gap-6 text-sm">
            <a href="/workflows" className="text-gray-600 hover:text-gray-900">工作流</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">执行历史</a>
            <a href="#" className="text-gray-600 hover:text-gray-900">设置</a>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/workflows" replace />} />
          <Route path="/workflows" element={<WorkflowList />} />
          <Route path="/workflow/:id" element={<WorkflowDetail />} />
        </Routes>
      </main>
    </div>
  )
}

export default App