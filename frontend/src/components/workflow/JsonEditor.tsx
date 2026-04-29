export default function JsonEditor() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">JSON 编辑器</h2>
      <textarea
        className="w-full h-64 font-mono text-sm border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="在此编辑 JSON 数据..."
      />
    </div>
  )
}