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

  // 7-Day Normalized Timeline for Combo Bar + Line Chart
  const chartDays = React.useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const shortDay = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

      // Match dailyData
      const sentItem = dailyData.find(
        (item) => item._id?.date === dateStr && item._id?.status === 'sent'
      );
      const failedItem = dailyData.find(
        (item) => item._id?.date === dateStr && item._id?.status === 'failed'
      );

      const sent = sentItem ? sentItem.count : 0;
      const failed = failedItem ? failedItem.count : 0;
      const total = sent + failed;

      days.push({
        date: dateStr,
        shortDay,
        dayNum,
        sent,
        failed,
        total,
      });
    }
    return days;
  }, [dailyData]);

  const maxTotal = Math.max(5, ...chartDays.map((d) => d.total));

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">Analytics</h1>
          <p className="text-sub text-xs mt-0.5 sm:mt-1 truncate max-w-xs sm:max-w-none">
            Delivery health for <b className="text-ink font-medium">{selectedProject?.name}</b> · last 7 days
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Emails */}
            <div className="lift bg-surface border border-line rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Total emails</span>
                <span className="w-7 h-7 rounded-lg bg-elev grid place-items-center text-ink">
                  <Mail className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-ink">{totalCount}</div>
              <div className="text-[11px] mt-1 text-ok font-medium flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> 100% tracked
              </div>
            </div>

            {/* Delivered (Sent) */}
            <div className="lift bg-surface border border-line rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Delivered</span>
                <span className="w-7 h-7 rounded-lg grid place-items-center text-ok" style={{ background: 'var(--okbg)' }}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-ok">{sentCount}</div>
              <div className="text-[11px] mt-1 text-ok font-medium">Successful delivery</div>
            </div>

            {/* Failed */}
            <div className="lift bg-surface border border-line rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Failed</span>
                <span className="w-7 h-7 rounded-lg grid place-items-center text-bad" style={{ background: 'var(--badbg)' }}>
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-bad">{failedCount}</div>
              <div className="text-[11px] mt-1 text-mute">Rejected / SMTP error</div>
            </div>

            {/* Success Rate */}
            <div className="lift bg-surface border border-line rounded-xl p-3.5 sm:p-4 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sub text-xs">
                <span>Success rate</span>
                <span className="w-7 h-7 rounded-lg bg-elev grid place-items-center text-brand">
                  <Percent className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mt-2 text-ink">{rateVal}%</div>
              <div className="mt-2 h-1.5 rounded-full bg-elev overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, rateVal)}%` }}
                />
              </div>
            </div>
          </section>

          {/* Daily Delivery Trends (Combo Bar + Line Chart) */}
          <section className="bg-surface border border-line rounded-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-base font-semibold text-ink">Daily Delivery Trends</h2>
                <p className="text-sub text-xs">Email dispatch volume over the last 7 days</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-sub">
                  <i className="w-2.5 h-2.5 rounded-full bg-brand" /> Total Volume
                </span>
                <span className="flex items-center gap-1.5 text-sub">
                  <i className="w-2.5 h-2.5 rounded-full bg-ok" /> Delivered ({stats.sent})
                </span>
                {stats.failed > 0 && (
                  <span className="flex items-center gap-1.5 text-sub">
                    <i className="w-2.5 h-2.5 rounded-full bg-bad" /> Failed ({stats.failed})
                  </span>
                )}
              </div>
            </div>

            {/* Chart Area with Overlay Line Graph */}
            <div className="relative pt-6 pb-2">
              {/* Overlay SVG Line Graph with Gradient & Glow */}
              <div className="absolute inset-x-0 top-6 bottom-10 px-2 sm:px-6 pointer-events-none">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 700 120" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineTrendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#5F8F9C" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#7FB0BD" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="areaTrendGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#5F8F9C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#5F8F9C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Filled Area under the curve */}
                  <polygon
                    points={`50,110 ${chartDays.map((d, i) => `${(i * 100) + 50},${Math.round(110 - (d.total / maxTotal) * 85)}`).join(' ')} 650,110`}
                    fill="url(#areaTrendGrad)"
                    className="transition-all duration-700"
                  />

                  {/* Trend Polyline */}
                  <polyline
                    fill="none"
                    stroke="url(#lineTrendGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartDays.map((d, i) => `${(i * 100) + 50},${Math.round(110 - (d.total / maxTotal) * 85)}`).join(' ')}
                    className="transition-all duration-700"
                  />

                  {/* Data Points (Glowing Dots) */}
                  {chartDays.map((d, i) => {
                    const cx = (i * 100) + 50;
                    const cy = Math.round(110 - (d.total / maxTotal) * 85);
                    return (
                      <g key={i}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r="5"
                          className="fill-surface stroke-brand stroke-2 shadow-sm transition-all duration-500"
                        />
                        <circle
                          cx={cx}
                          cy={cy}
                          r="2.5"
                          className="fill-brand transition-all duration-500"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* 7 Animated Columns (Bar Graph) */}
              <div className="h-44 flex items-end justify-between gap-1 sm:gap-4 px-1 sm:px-6 border-b border-line">
                {chartDays.map((d, i) => {
                  const heightPercent = Math.max(8, (d.total / maxTotal) * 100);
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative z-10"
                    >
                      {/* Count Badge (Always Visible & Animated) */}
                      <div className="mb-2 text-[10px] sm:text-xs font-semibold text-ink group-hover:scale-110 transition-transform">
                        {d.total}
                      </div>

                      {/* Bar Column with Background Track */}
                      <div className="w-full max-w-[26px] sm:max-w-[42px] h-28 bg-elev/50 rounded-t-lg overflow-hidden flex items-end">
                        <div
                          className="w-full rounded-t-lg bg-gradient-to-t from-brand/70 to-brand hover:from-brand hover:to-brand-light transition-all duration-700 ease-out shadow-sm"
                          style={{
                            height: `${heightPercent}%`,
                            boxShadow: d.total > 0 ? '0 0 12px rgba(95, 143, 156, 0.35)' : 'none'
                          }}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="text-center mt-2.5">
                        <span className="block text-[10px] sm:text-[11px] font-medium text-ink">
                          {d.shortDay}
                        </span>
                        <span className="block text-[8px] sm:text-[9px] text-mute">
                          {d.dayNum}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
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
