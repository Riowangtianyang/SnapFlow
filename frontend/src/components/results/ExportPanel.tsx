import { useState } from 'react'

type ExportFormat = 'json' | 'csv' | 'excel'

interface ExportPanelProps {
  data: Record<string, unknown>[] | null
  filename?: string
}

export default function ExportPanel({ data, filename = 'export' }: ExportPanelProps) {
  const [format, setFormat] = useState<ExportFormat>('json')
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!data || data.length === 0) return

    setExporting(true)
    try {
      let content: string
      let mimeType: string
      let extension: string

      switch (format) {
        case 'csv':
          const headers = Object.keys(data[0]).join(',')
          const rows = data.map((row) =>
            Object.values(row)
              .map((v) => `"${String(v).replace(/"/g, '""')}"`)
              .join(',')
          )
          content = [headers, ...rows].join('\n')
          mimeType = 'text/csv'
          extension = 'csv'
          break
        case 'json':
        default:
          content = JSON.stringify(data, null, 2)
          mimeType = 'application/json'
          extension = 'json'
      }

      const blob = new Blob([content], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-4">导出数据</h3>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {(['json', 'csv'] as ExportFormat[]).map((f) => (
            <label key={f} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value={f}
                checked={format === f}
                onChange={() => setFormat(f)}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700 uppercase">{f}</span>
            </label>
          ))}
        </div>

        <button
          onClick={handleExport}
          disabled={!data || data.length === 0 || exporting}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {exporting ? '导出中...' : `导出 ${format.toUpperCase()}`}
        </button>

        {data && (
          <div className="text-sm text-gray-500">
            共 {data.length} 条数据
          </div>
        )}
      </div>
    </div>
  )
}