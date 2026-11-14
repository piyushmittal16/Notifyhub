import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';
import { Search, Filter, History, ChevronLeft, ChevronRight, X, Eye, AlertCircle } from 'lucide-react';

export const LogsPage = () => {
  const { selectedProject } = useProject();

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  // Filters
  const [searchTo, setSearchTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Active inspected log for drawer
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      let url = `/projects/${selectedProject._id}/logs?page=${page}&limit=15`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (searchTo.trim()) url += `&to=${encodeURIComponent(searchTo.trim())}`;

      const res = await api.get(url);
      setLogs(res.data || []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedProject, page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Email Logs</h1>
        <p className="text-sub text-xs mt-1">
          Delivery audit log for <b className="text-ink font-medium">{selectedProject?.name || 'All'}</b>
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface border border-line rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[220px] max-w-sm relative">
          <input
            type="text"
            placeholder="Search recipient email (to)..."
            value={searchTo}
            onChange={(e) => setSearchTo(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-mute absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="sent">Delivered (Sent)</option>
            <option value="failed">Failed</option>
          </select>

          {(searchTo || statusFilter) && (
            <button
              onClick={() => {
                setSearchTo('');
                setStatusFilter('');
                setPage(1);
              }}
              className="text-xs text-sub hover:text-ink px-2 py-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elev border-b border-line text-sub font-semibold">
              <tr>
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-mute">
                    Loading logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-mute">
                    No logs found matching your filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-elev/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-ink max-w-[180px] truncate">{log.to}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-mute">{log.templateName || '—'}</td>
                    <td className="py-3 px-4 text-sub max-w-[200px] truncate">{log.subject}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          log.status === 'sent' ? 'text-ok' : 'text-bad'
                        }`}
                        style={{ background: log.status === 'sent' ? 'var(--okbg)' : 'var(--badbg)' }}
                      >
                        {log.status === 'sent' ? '● Sent' : '● Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-mute whitespace-nowrap">
                      {new Date(log.sentAt || log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="p-1 rounded hover:bg-elev text-sub hover:text-ink cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-line flex items-center justify-between text-xs text-sub">
          <span>
            Page {pagination.page} of {pagination.totalPages || 1} ({pagination.total} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-line bg-surface hover:bg-elev disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-line bg-surface hover:bg-elev disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Log Drawer */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
          <div className="bg-surface border-l border-line w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
                <b className="font-semibold text-ink text-base">Delivery Log Details</b>
                <button
                  onClick={() => setInspectLog(null)}
                  className="text-mute hover:text-ink p-1 rounded-lg hover:bg-elev"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-mute block mb-1">Status</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-semibold ${
                      inspectLog.status === 'sent' ? 'text-ok' : 'text-bad'
                    }`}
                    style={{ background: inspectLog.status === 'sent' ? 'var(--okbg)' : 'var(--badbg)' }}
                  >
                    {inspectLog.status.toUpperCase()}
                  </span>
                </div>

                {inspectLog.error && (
                  <div className="p-3 rounded-xl border border-bad/30 bg-bad/10 text-bad">
                    <b className="block mb-1 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Error Reason:
                    </b>
                    <p className="font-mono text-[11px] break-all">{inspectLog.error}</p>
                  </div>
                )}

                <div>
                  <span className="text-mute block mb-0.5">Recipient</span>
                  <div className="font-medium text-ink bg-elev p-2 rounded-lg font-mono">{inspectLog.to}</div>
                </div>

                <div>
                  <span className="text-mute block mb-0.5">Subject</span>
                  <div className="text-ink bg-elev p-2 rounded-lg">{inspectLog.subject}</div>
                </div>

                <div>
                  <span className="text-mute block mb-0.5">Template</span>
                  <div className="font-mono text-ink bg-elev p-2 rounded-lg">{inspectLog.templateName || 'None'}</div>
                </div>

                <div>
                  <span className="text-mute block mb-0.5">Timestamp</span>
                  <div className="text-sub bg-elev p-2 rounded-lg">
                    {new Date(inspectLog.sentAt || inspectLog.createdAt).toUTCString()}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setInspectLog(null)}
              className="w-full mt-6 py-2 rounded-xl bg-elev hover:bg-line text-ink text-xs font-medium cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
