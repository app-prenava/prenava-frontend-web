import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table';
import { Input, Select, Pagination, Empty, Skeleton } from 'antd';
import { SearchOutlined, SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  emptyText?: string;
  showPagination?: boolean;
  filterOptions?: {
    key: string;
    label: string;
    options: { label: string; value: string }[];
  }[];
  onRowClick?: (row: TData) => void;
}

export default function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = 'Cari...',
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  emptyText = 'Tidak ada data',
  showPagination = true,
  filterOptions,
  onRowClick,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalRows = table.getFilteredRowModel().rows.length;

  if (isLoading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          )}
          {filterOptions?.map((filter) => (
            <Select
              key={filter.key}
              placeholder={filter.label}
              style={{ width: 150 }}
              allowClear
              options={filter.options}
              onChange={(value) => {
                setColumnFilters((prev) => {
                  const existing = prev.filter((f) => f.id !== filter.key);
                  if (value) {
                    return [...existing, { id: filter.key, value }];
                  }
                  return existing;
                });
              }}
            />
          ))}
        </div>
        {showPagination && (
          <div className="text-sm text-gray-500">
            Total {totalRows} data
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-2 ${
                          header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <SortAscendingOutlined className="text-[#FA6978]" />,
                          desc: <SortDescendingOutlined className="text-[#FA6978]" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <Empty description={emptyText} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 0 && (
        <div className="flex justify-between items-center">
          <Select
            value={pagination.pageSize}
            onChange={(value) => {
              setPagination((prev) => ({ ...prev, pageSize: value }));
            }}
            options={pageSizeOptions.map((size) => ({
              label: `${size} / halaman`,
              value: size,
            }))}
            style={{ width: 130 }}
          />
          <Pagination
            current={currentPage}
            total={totalRows}
            pageSize={pagination.pageSize}
            onChange={(page) => {
              setPagination((prev) => ({ ...prev, pageIndex: page - 1 }));
            }}
            showSizeChanger={false}
            showQuickJumper
          />
        </div>
      )}
    </div>
  );
}

// StatusBadge component for consistent status display
export interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

export function StatusBadge({
  status,
  colorMap = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-gray-100 text-gray-800',
  },
}: StatusBadgeProps) {
  const color = colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  const displayText = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {displayText}
    </span>
  );
}
