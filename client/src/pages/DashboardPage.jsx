import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { useCountUp } from '../hooks/useCountUp';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Percent, ArrowUpRight, ArrowDownRight, RefreshCw, Send } from 'lucide-react';
import { SendTestEmailModal } from '../components/modals/SendTestEmailModal';

export const DashboardPage = () => {
  const { selectedProject } = useProject();
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, successRate: '100%' });
  const [dailyData, setDailyData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);

  // Fetch live project stats
  const fetchDashboardData = async () => {
    if (!selectedProject) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [analyticsRes, dailyRes, logsRes] = await Promise.all([
        api.get(`/projects/${selectedProject._id}/analytics`),
        api.get(`/projects/${selectedProject._id}/analytics/daily?days=7`),
        api.get(`/projects/${selectedProject._id}/logs?limit=5`),
      ]);

      if (analyticsRes.data?.analytics) {
        setStats(analyticsRes.data.analytics);
      }
      if (dailyRes.data?.daily) {
        setDailyData(dailyRes.data.daily);
      }
      if (logsRes.data) {
        setRecentLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      // Small graceful delay to match Section 4.5 skeleton shimmer transition
      setTimeout(() => setLoading(false), 500);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedProject]);

  // Smooth CountUp for metric cards
  const totalCount = useCountUp(stats.total, 1200);
  const sentCount = useCountUp(stats.sent, 1200);
  const failedCount = useCountUp(stats.failed, 1200);
  const rateVal = parseFloat(stats.successRate) || 0;

  // Format relative timestamp
  const formatTime = (dateStr) => {
    if (!dateStr) return 'Just now';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (!selectedProject && !loading) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-12 text-center max-w-lg mx-auto mt-10">
        <div className="w-12 h-12 rounded-xl bg-elev grid place-items-center mx-auto text-brand mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink">No Project Selected</h2>
        <p className="text-sub text-xs mt-1.5 leading-relaxed">
          Create or select a project from the top navbar to inspect transactional email analytics, templates, and logs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Analytics</h1>
          <p className="text-sub text-xs mt-1">
            Delivery health for <b className="text-ink font-medium">{selectedProject?.name}</b> · last 7 days
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchDashboardData()}
            className="p-2 rounded-xl border border-line bg-surface hover:bg-elev text-sub hover:text-ink transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsTestEmailOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-brand text-white font-medium text-xs shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Test Email</span>
          </button>
        </div>
      </div>

      {/* 2. Skeleton Loading View (Section 4.5) */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sk h-28" />
            <div className="sk h-28" />
            <div className="sk h-28" />
            <div className="sk h-28" />
          </div>
          <div className="sk h-64" />
          <div className="sk h-56" />
        </div>
      ) : (
        /* 3. Real Live Dashboard Content */
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Metric Cards (Section 4.4 Lift hover) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Emails */}
            <div className="lift bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Total emails</span>
                <span className="w-7 h-7 rounded-lg bg-elev grid place-items-center text-ink">
                  <Mail className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-bold mt-2 text-ink">{totalCount}</div>
              <div className="text-[11px] mt-1 text-ok font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 100% tracked
              </div>
            </div>

            {/* Delivered (Sent) */}
            <div className="lift bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Delivered</span>
                <span className="w-7 h-7 rounded-lg grid place-items-center text-ok" style={{ background: 'var(--okbg)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-bold mt-2 text-ok">{sentCount}</div>
              <div className="text-[11px] mt-1 text-ok font-medium">Successful delivery</div>
            </div>

            {/* Failed */}
            <div className="lift bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Failed</span>
                <span className="w-7 h-7 rounded-lg grid place-items-center text-bad" style={{ background: 'var(--badbg)' }}>
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-bold mt-2 text-bad">{failedCount}</div>
              <div className="text-[11px] mt-1 text-mute">Rejected or SMTP error</div>
            </div>

            {/* Success Rate */}
            <div className="lift bg-surface border border-line rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Success rate</span>
                <span className="w-7 h-7 rounded-lg bg-elev grid place-items-center text-brand">
                  <Percent className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-3xl font-bold mt-2 text-ink">{rateVal}%</div>
              <div className="mt-2 h-1.5 rounded-full bg-elev overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, rateVal)}%` }}
                />
              </div>
            </div>
          </section>

          {/* Daily Delivery Trends Chart */}
          <section className="bg-surface border border-line rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-semibold text-ink">Daily delivery trends</h2>
                <p className="text-sub text-xs">Recent email volume over time</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-sub">
                  <i className="w-2.5 h-2.5 rounded-full bg-ok" /> Delivered
                </span>
                <span className="flex items-center gap-1.5 text-sub">
                  <i className="w-2.5 h-2.5 rounded-full bg-bad" /> Failed
                </span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="h-48 flex items-end gap-3 pt-6 border-b border-line px-2">
              {dailyData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-xs text-mute">
                  No email history recorded for the selected timeframe.
                </div>
              ) : (
                dailyData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-surface border border-line px-2.5 py-1 rounded-lg shadow-lg text-[10px] text-ink z-10 whitespace-nowrap">
                      {d._id?.date}: <b>{d.count}</b> ({d._id?.status})
                    </div>
                    {/* Bar */}
                    <div
                      className={`w-full max-w-[36px] rounded-t-lg transition-all duration-500 ${d._id?.status === 'sent' ? 'bg-ok/80 hover:bg-ok' : 'bg-bad/80 hover:bg-bad'
                        }`}
                      style={{ height: `${Math.min(100, Math.max(15, d.count * 20))}%` }}
                    />
                    <span className="text-[10px] text-mute truncate max-w-[48px]">
                      {d._id?.date?.slice(5)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent Activity & Quick Templates */}
          <section className="grid lg:grid-cols-3 gap-4">
            {/* Recent Email Logs */}
            <div className="lg:col-span-2 bg-surface border border-line rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-base font-semibold text-ink">Recent email logs</h2>
                <Link to="/logs" className="text-brand font-medium text-xs hover:underline">
                  View all logs →
                </Link>
              </div>

              {recentLogs.length === 0 ? (
                <div className="text-xs text-mute py-8 text-center">
                  No recent emails sent yet.
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {recentLogs.map((log) => (
                    <li key={log._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-medium text-ink truncate">{log.to}</div>
                        <div className="text-mute font-mono text-[11px] truncate">
                          {log.templateName || log.subject}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-mute hidden sm:inline text-[11px]">
                          {formatTime(log.sentAt || log.createdAt)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-medium text-[11px] ${log.status === 'sent' ? 'text-ok' : 'text-bad'
                            }`}
                          style={{
                            background: log.status === 'sent' ? 'var(--okbg)' : 'var(--badbg)',
                          }}
                        >
                          {log.status === 'sent' ? 'Sent' : 'Failed'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Setup Card */}
            <div className="bg-surface border border-line rounded-xl p-5 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink mb-1">Quick Integration</h2>
                <p className="text-sub text-xs leading-relaxed mb-4">
                  Integrate NotifyHub into your backend with 1 POST request using your project API key.
                </p>
                <div className="p-3 rounded-xl bg-elev font-mono text-[11px] text-ink border border-line space-y-1 overflow-x-auto">
                  <div className="text-mute"># Send Email API</div>
                  <div>POST /api/v1/emails/send</div>
                  <div className="text-brand">x-api-key: sk_live_...</div>
                </div>
              </div>

              <Link
                to="/templates"
                className="w-full mt-4 py-2 rounded-xl border border-line bg-surface hover:bg-elev text-ink text-center text-xs font-medium transition-colors block"
              >
                Manage Templates →
              </Link>
            </div>
          </section>
        </div>
      )}

      {/* Send Test Email Modal */}
      <SendTestEmailModal
        isOpen={isTestEmailOpen}
        onClose={() => setIsTestEmailOpen(false)}
        projectId={selectedProject?._id}
        onEmailSent={() => fetchDashboardData()}
      />
    </div>
  );
};
