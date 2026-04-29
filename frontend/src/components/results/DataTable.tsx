import { useState, useMemo } from 'react'

interface Column {
  key: string
  label: string
  width?: string
}

interface DataTableProps {
  data: Record<string, unknown>[] | null
  columns?: Column[]
  loading?: boolean
}

export default function DataTable({ data, columns: customColumns, loading }: DataTableProps) {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)

  const columns = useMemo(() => {
    if (customColumns?.length) return customColumns
    if (!data || data.length === 0) return []
    return Object.keys(data[0]).map((key) => ({
      key,
      label: key,
      width: 'auto',
    }))
  }, [customColumns, data])

  const paginatedData = useMemo(() => {
    if (!data) return []
    const start = (page - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, page, pageSize])

  const totalPages = useMemo(() => {
    if (!data) return 0
    return Math.ceil(data.length / pageSize)
  }, [data, pageSize])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg">
        <div className="text-gray-500">暂无数据</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-gray-700">
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-500">
            第 {page} / {totalPages} 页，共 {data.length} 条
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              上一页
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}