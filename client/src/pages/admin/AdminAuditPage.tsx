import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../../services/adminApi";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Row = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  adminUserId: string;
};

const colHelper = createColumnHelper<Row>();

export function AdminAuditPage() {
  const q = useQuery({
    queryKey: ["audit"],
    queryFn: () => fetchAuditLogs({ take: "100", skip: "0" }),
  });

  const columns = [
    colHelper.accessor("createdAt", {
      header: "When",
      cell: (c) => new Date(c.getValue()).toLocaleString(),
    }),
    colHelper.accessor("action", { header: "Action" }),
    colHelper.accessor("entityType", { header: "Entity" }),
    colHelper.accessor("entityId", { header: "Entity id" }),
    colHelper.accessor("adminUserId", { header: "Admin user" }),
  ];

  const table = useReactTable({
    data: (q.data?.items as Row[]) ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-white">Audit log</h1>
        <p className="mt-1 text-sm text-slate-400">
          Immutable admin actions (latest 100).
        </p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="min-w-full text-left text-sm text-slate-200">
          <thead className="bg-slate-900/80 text-xs uppercase text-slate-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-3 py-2 font-medium">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="border-t border-slate-800">
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="px-3 py-2">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
