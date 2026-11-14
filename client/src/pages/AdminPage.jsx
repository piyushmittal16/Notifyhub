import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, FolderGit2, Power, Search, Shield, User } from 'lucide-react';

export const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('developers'); // 'developers' | 'admins' | 'projects'
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  // Fetch Admin Analytics & Users
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/admin/analytics'),
        api.get('/admin/users'),
        api.get('/admin/projects'),
      ]);

      if (analyticsRes.data?.analytics) setAnalytics(analyticsRes.data.analytics);
      if (usersRes.data) setUsersList(usersRes.data);
      if (projectsRes.data) setProjectsList(projectsRes.data);
    } catch (err) {
      toast.error('Failed to load admin data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (targetUser) => {
    if (targetUser._id === currentUser._id) {
      toast.warn('Blocked Action', 'Admins cannot change their own account status.');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'blocked' : 'active';
    if (window.confirm(`Are you sure you want to mark ${targetUser.name} as ${nextStatus}?`)) {
      try {
        await api.patch(`/admin/users/${targetUser._id}/status`, { status: nextStatus });
        setUsersList((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, status: nextStatus } : u))
        );
        toast.success('Status Updated', `User is now ${nextStatus}.`);
      } catch (err) {
        toast.error('Action Failed', err.message);
      }
    }
  };

  const developers = usersList.filter((u) => u.role === 'developer');
  const admins = usersList.filter((u) => u.role === 'admin');

  const displayedUsers = (activeTab === 'developers' ? developers : admins).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand" />
          <h1 className="text-2xl font-bold text-ink tracking-tight">Admin Console</h1>
        </div>
        <p className="text-sub text-xs mt-1">Platform management, security, and tenant overview</p>
      </div>

      {/* Global Platform Metrics */}
      {analytics && (
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lift bg-surface border border-line rounded-xl p-4">
            <span className="text-sub text-xs">Total Developers</span>
            <div className="text-2xl font-bold text-ink mt-1">{analytics.users?.developers || 0}</div>
            <div className="text-[11px] text-ok mt-1">{analytics.users?.activeUsers || 0} active users</div>
          </div>
          <div className="lift bg-surface border border-line rounded-xl p-4">
            <span className="text-sub text-xs">Total Projects</span>
            <div className="text-2xl font-bold text-ink mt-1">{analytics.projects?.totalProjects || 0}</div>
            <div className="text-[11px] text-mute mt-1">{analytics.projects?.activeProjects || 0} active</div>
          </div>
          <div className="lift bg-surface border border-line rounded-xl p-4">
            <span className="text-sub text-xs">Platform Emails</span>
            <div className="text-2xl font-bold text-ink mt-1">{analytics.emails?.totalEmails || 0}</div>
            <div className="text-[11px] text-ok mt-1">{analytics.emails?.sentEmails || 0} delivered</div>
          </div>
          <div className="lift bg-surface border border-line rounded-xl p-4">
            <span className="text-sub text-xs">Global Success Rate</span>
            <div className="text-2xl font-bold text-brand mt-1">{analytics.emails?.successRate || '100%'}</div>
            <div className="text-[11px] text-mute mt-1">Platform Health</div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="flex border-b border-line gap-4 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab('developers');
            setSearchUser('');
          }}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'developers' ? 'border-b-2 border-brand text-brand' : 'text-sub hover:text-ink'
          }`}
        >
          <User className="w-4 h-4" /> Developers ({developers.length})
        </button>
        <button
          onClick={() => {
            setActiveTab('admins');
            setSearchUser('');
          }}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'admins' ? 'border-b-2 border-brand text-brand' : 'text-sub hover:text-ink'
          }`}
        >
          <Shield className="w-4 h-4" /> Admins ({admins.length})
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'projects' ? 'border-b-2 border-brand text-brand' : 'text-sub hover:text-ink'
          }`}
        >
          <FolderGit2 className="w-4 h-4" /> All Projects ({projectsList.length})
        </button>
      </div>

      {/* Users / Admins Table */}
      {(activeTab === 'developers' || activeTab === 'admins') && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <input
                type="text"
                placeholder={activeTab === 'developers' ? 'Search developer...' : 'Search admin...'}
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-mute absolute left-2.5 top-2.5" />
            </div>
            <span className="text-xs text-mute">
              Showing {displayedUsers.length} {activeTab === 'developers' ? 'developers' : 'admins'}
            </span>
          </div>

          <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-elev border-b border-line text-sub font-semibold">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {displayedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-mute text-xs">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((u) => {
                    const isBlocked = u.status === 'blocked';
                    const isSelf = u._id === currentUser?._id;
                    return (
                      <tr key={u._id} className="hover:bg-elev/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-ink flex items-center gap-1.5">
                            {u.name}
                            {isSelf && <span className="text-[10px] text-brand bg-elev px-1.5 py-0.2 rounded font-normal">(You)</span>}
                          </div>
                          <div className="text-mute text-[11px]">{u.email}</div>
                        </td>
                        <td className="py-3 px-4 capitalize font-medium text-sub">{u.role}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isBlocked ? 'text-bad' : 'text-ok'
                            }`}
                            style={{ background: isBlocked ? 'var(--badbg)' : 'var(--okbg)' }}
                          >
                            ● {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-mute">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <button
                              onClick={() => handleToggleUserStatus(u)}
                              className={`p-1.5 rounded-lg border border-line hover:bg-elev text-xs cursor-pointer transition-colors ${
                                isBlocked ? 'text-ok' : 'text-bad'
                              }`}
                              title={isBlocked ? 'Unblock User' : 'Block User'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Projects Overview */}
      {activeTab === 'projects' && (
        <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-elev border-b border-line text-sub font-semibold">
              <tr>
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {projectsList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-mute text-xs">
                    No projects found on the platform.
                  </td>
                </tr>
              ) : (
                projectsList.map((p) => (
                  <tr key={p._id} className="hover:bg-elev/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-ink">{p.name}</td>
                    <td className="py-3 px-4">
                      <div className="text-ink">{p.userId?.name || 'Unknown'}</div>
                      <div className="text-mute text-[11px]">{p.userId?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.status === 'active' ? 'text-ok' : 'text-warn'
                        }`}
                        style={{ background: p.status === 'active' ? 'var(--okbg)' : 'var(--elev)' }}
                      >
                        ● {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-mute">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
