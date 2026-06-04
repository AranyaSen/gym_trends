import { useQuery } from "@tanstack/react-query";
import { fetchAuditLogs } from "../../services/admin/admin.services";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ShieldCheck, Clock, User, Fingerprint } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { formatDateTime } from "../../lib/utils/dateTimeFormat";
import { Pagination } from "../../components/ui/Pagination";
import { useMemo, useState } from "react";

type Row = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  createdAt: string;
  adminUserId: string;
};

const colHelper = createColumnHelper<Row>();

function AdminAuditPage() {
  const [page, setPage] = useState(1);

  const { data: auditLogs, isLoading: auditLogsLoading } = useQuery({
    queryKey: ["audit", page],
    queryFn: () => fetchAuditLogs({ page, itemsPerPage: 10 }),
  });

  const columns = useMemo(
    () => [
      colHelper.accessor("createdAt", {
        header: "Timestamp",
        cell: (data) => (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-brand-muted" />
            <span className="font-mono text-[10px]">
              {formatDateTime(data.getValue())}
            </span>
          </div>
        ),
      }),
      colHelper.accessor("action", {
        header: "Action",
        cell: (c) => (
          <Badge variant="info" className="text-[9px] px-2">
            {c.getValue()}
          </Badge>
        ),
      }),
      colHelper.accessor("entityType", {
        header: "Entity",
        cell: (c) => (
          <div className="flex items-center gap-2">
            <Fingerprint className="w-3 h-3 text-brand-accent/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">
              {c.getValue()}
            </span>
          </div>
        ),
      }),
      colHelper.accessor("entityId", {
        header: "Resource ID",
        cell: (c) => (
          <span className="font-mono text-[10px] text-brand-muted">
            {c.getValue() || "N/A"}
          </span>
        ),
      }),
      colHelper.accessor("adminUserId", {
        header: "Operator",
        cell: (c) => (
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-brand-muted" />
            <span className="text-xs font-medium text-slate-300">
              {c.getValue()}
            </span>
          </div>
        ),
      }),
    ],
    [],
  );

  const tableData = useMemo(
    () => (auditLogs?.items as Row[]) ?? [],
    [auditLogs?.items],
  );

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handlePageClick = (e: { selected: number }) => {
    setPage(e.selected + 1);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Audit Trails</h2>
          <p className="text-brand-muted font-medium uppercase tracking-[0.2em] text-[10px] mt-1">
            Immutable tracking of administrative actions
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-accent/5 border border-brand-accent/10">
          <ShieldCheck className="w-4 h-4 text-brand-accent" />
          <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">
            Secured
          </span>
        </div>
      </header>

      <div className="glass-card overflow-hidden border-brand-border/20 shadow-2xl">
        <div className="overflow-x-auto">
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
                    {auditLogsLoading
                      ? "Loading secure logs..."
                      : "No administrative actions recorded yet."}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-brand-accent/5 transition-colors group"
                  >
                    {r.getVisibleCells().map((c) => (
                      <td key={c.id} className="px-6 py-4">
                        <div className="text-sm">
                          {flexRender(c.column.columnDef.cell, c.getContext())}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        totalPage={auditLogs?.pagination.totalPage || 0}
        handlePageClick={handlePageClick}
        currentPage={page}
      />
    </div>
  );
}

export default AdminAuditPage;
