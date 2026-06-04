import { flexRender, Table as ReactTable } from "@tanstack/react-table";

type TableProps<T> = {
  table: ReactTable<T>;
  loading: boolean;
};

export function Table<T>({ table, loading }: TableProps<T>) {
  const columns = table.getAllColumns();
  return (
    <table className="min-w-full text-left text-sm text-slate-200">
      <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-brand-muted border-b border-brand-border/20">
        {table.getHeaderGroups().map((hg) => (
          <tr key={hg.id}>
            {hg.headers.map((h) => (
              <th key={h.id} className="px-6 py-4">
                {flexRender(h.column.columnDef.header, h.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-white/5">
        {table.getRowModel().rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-6 py-20 text-center text-brand-muted italic"
            >
              {loading ? "Loading ..." : "No data found."}
            </td>
          </tr>
        ) : (
          table.getRowModel().rows.map((r) => (
            <tr key={r.id} className="hover:bg-white/5 transition-colors group">
              {r.getVisibleCells().map((c) => (
                <td key={c.id} className="px-6 py-4">
                  <div className="text-sm font-medium">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
