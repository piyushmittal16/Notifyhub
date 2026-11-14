import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Plus, FileCode2, Eye, Trash2, Power, Code2, Copy, Check, Terminal, X, Code } from 'lucide-react';

export const TemplatesPage = () => {
  const { selectedProject } = useProject();
  const toast = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('marketing');
  const [htmlContent, setHtmlContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Integration Snippet Modal State
  const [snippetModalTemplate, setSnippetModalTemplate] = useState(null);
  const [snippetTab, setSnippetTab] = useState('nodejs'); // 'nodejs' | 'python' | 'curl'
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Live preview test variables
  const [mockVars, setMockVars] = useState({ name: 'Alex', otp: '482901', link: 'https://notifyhub.com/verify' });

  // Fetch templates for selected project
  const fetchTemplates = async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      const res = await api.get(`/projects/${selectedProject._id}/templates`);
      setTemplates(res.data?.templates || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [selectedProject]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setName('');
    setSubject('Welcome to our service!');
    setCategory('authentication');
    setHtmlContent('<h2>Hello {{name}},</h2>\n<p>Your one-time password is: <b>{{otp}}</b></p>');
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTemplate(t);
    setName(t.name);
    setSubject(t.subject);
    setCategory(t.category || 'marketing');
    setHtmlContent(t.html || '');
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!name || !subject || !htmlContent) {
      toast.error('Validation Error', 'Name, Subject, and HTML Content are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate) {
        // Edit existing (Sends 'html' key matching backend)
        const res = await api.patch(`/templates/${editingTemplate._id}`, {
          name: name.trim(),
          subject: subject.trim(),
          category,
          html: htmlContent,
        });
        const updated = res.data?.template || { ...editingTemplate, name: name.trim(), subject: subject.trim(), category, html: htmlContent };
        setTemplates((prev) => prev.map((t) => (t._id === editingTemplate._id ? { ...t, ...updated } : t)));
        toast.success('Template Updated', `"${name}" updated successfully.`);
      } else {
        // Create new (Sends 'html' key matching backend)
        const res = await api.post(`/projects/${selectedProject._id}/templates`, {
          name: name.trim(),
          subject: subject.trim(),
          category,
          html: htmlContent,
          status: 'active',
        });
        const newTemplate = res.data?.template;
        if (newTemplate) {
          // ⚡ Instant Real-Time UI Update
          setTemplates((prev) => [newTemplate, ...prev]);
        }
        toast.success('Template Created', `"${name}" is active.`);
      }
      setIsEditorOpen(false);
      await fetchTemplates();
    } catch (err) {
      toast.error('Failed to save', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'draft' : 'active';
    try {
      await api.patch(`/templates/${id}/status`, { status: nextStatus });
      setTemplates((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: nextStatus } : t))
      );
      toast.success('Status Changed', `Template is now ${nextStatus}.`);
    } catch (err) {
      toast.error('Failed', err.message);
    }
  };

  const handleDelete = async (id, tName) => {
    if (window.confirm(`Delete template "${tName}"?`)) {
      try {
        await api.delete(`/templates/${id}`);
        setTemplates((prev) => prev.filter((t) => t._id !== id));
        toast.warn('Deleted', `Template "${tName}" deleted.`);
      } catch (err) {
        toast.error('Failed', err.message);
      }
    }
  };

  const copyTemplateId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Copied!', 'Template ID copied to clipboard.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Interpolate HTML preview with simulated mock variables
  const getRenderedPreview = () => {
    let rendered = htmlContent;
    Object.keys(mockVars).forEach((key) => {
      rendered = rendered.replaceAll(`{{${key}}}`, mockVars[key]);
    });
    return rendered;
  };

  // Generate code snippet based on selected tab
  const getCodeSnippet = (t) => {
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/emails/send`;
    if (snippetTab === 'nodejs') {
      return `// 📦 Node.js (fetch)
const response = await fetch('${apiUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'YOUR_PROJECT_API_KEY' // 🔑 Replace with your project API key
  },
  body: JSON.stringify({
    templateId: '${t._id}',
    to: 'customer@example.com',
    variables: {
      name: 'Alex',
      otp: '482901'
    }
  })
});
const data = await response.json();
console.log(data);`;
    }

    if (snippetTab === 'python') {
      return `# 🐍 Python (requests)
import requests

url = "${apiUrl}"
headers = {
    "x-api-key": "YOUR_PROJECT_API_KEY",
    "Content-Type": "application/json"
}
payload = {
    "templateId": "${t._id}",
    "to": "customer@example.com",
    "variables": {
        "name": "Alex",
        "otp": "482901"
    }
}
response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
    }

    // cURL
    return `curl -X POST "${apiUrl}" \\
  -H "x-api-key: YOUR_PROJECT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "templateId": "${t._id}",
    "to": "customer@example.com",
    "variables": {
      "name": "Alex",
      "otp": "482901"
    }
  }'`;
  };

  if (!selectedProject) {
    return (
      <div className="bg-surface border border-line rounded-2xl p-12 text-center max-w-md mx-auto mt-10">
        <p className="text-sub text-xs">Please select a project first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Templates</h1>
          <p className="text-sub text-xs mt-1">
            Email templates for <b className="text-ink font-medium">{selectedProject.name}</b>
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sk h-40" />
          <div className="sk h-40" />
          <div className="sk h-40" />
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center max-w-md mx-auto mt-10">
          <FileCode2 className="w-10 h-10 text-mute mx-auto mb-3" />
          <h3 className="font-semibold text-ink text-base">No templates found</h3>
          <p className="text-sub text-xs mt-1 mb-4">Create your first HTML template with dynamic variables.</p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 cursor-pointer"
          >
            Create Template
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const isActive = tpl.status === 'active';
            return (
              <div
                key={tpl._id}
                className="lift bg-surface border border-line rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <b className="font-semibold text-ink text-sm truncate">{tpl.name}</b>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        isActive ? 'text-ok' : 'text-warn'
                      }`}
                      style={{ background: isActive ? 'var(--okbg)' : 'var(--elev)' }}
                    >
                      ● {tpl.status}
                    </span>
                  </div>
                  <p className="text-sub text-xs truncate mb-2">Subject: {tpl.subject}</p>

                  {/* 🔑 Template ID Display & Copy Button */}
                  <div className="flex items-center justify-between gap-1 p-1.5 bg-elev rounded-lg border border-line text-[11px] font-mono text-mute my-2">
                    <span className="truncate">ID: {tpl._id}</span>
                    <button
                      onClick={() => copyTemplateId(tpl._id)}
                      className="p-1 hover:text-ink transition-colors cursor-pointer shrink-0"
                      title="Copy Template ID"
                    >
                      {copiedId === tpl._id ? <Check className="w-3.5 h-3.5 text-ok" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  {/* 🔌 Integration Code Button */}
                  <button
                    onClick={() => {
                      setSnippetModalTemplate(tpl);
                      setCopiedSnippet(false);
                    }}
                    className="flex items-center gap-1 text-[11px] font-medium text-brand hover:underline cursor-pointer"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>Get Code</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tpl)}
                      className="p-1.5 rounded-lg border border-line hover:bg-elev text-sub hover:text-ink transition-colors cursor-pointer"
                      title="Edit / Preview Template"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(tpl._id, tpl.status)}
                      className={`p-1.5 rounded-lg border border-line hover:bg-elev transition-colors cursor-pointer ${
                        isActive ? 'text-ok' : 'text-mute'
                      }`}
                      title={isActive ? 'Mark as Draft' : 'Activate'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl._id, tpl.name)}
                      className="p-1.5 rounded-lg border border-line hover:bg-bad/10 text-mute hover:text-bad transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔌 Integration Code Snippet Modal */}
      {snippetModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand" />
                <h3 className="font-bold text-ink text-sm">
                  Integrate "{snippetModalTemplate.name}"
                </h3>
              </div>
              <button
                onClick={() => setSnippetModalTemplate(null)}
                className="text-mute hover:text-ink p-1 rounded-lg hover:bg-elev"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-sub font-medium">Select Language:</span>
                <div className="flex rounded-lg border border-line p-0.5 bg-elev">
                  <button
                    onClick={() => setSnippetTab('nodejs')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      snippetTab === 'nodejs' ? 'bg-surface text-ink font-semibold shadow-xs' : 'text-sub'
                    }`}
                  >
                    Node.js
                  </button>
                  <button
                    onClick={() => setSnippetTab('python')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      snippetTab === 'python' ? 'bg-surface text-ink font-semibold shadow-xs' : 'text-sub'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    onClick={() => setSnippetTab('curl')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      snippetTab === 'curl' ? 'bg-surface text-ink font-semibold shadow-xs' : 'text-sub'
                    }`}
                  >
                    cURL
                  </button>
                </div>
              </div>

              {/* Code Box */}
              <div className="relative">
                <pre className="p-3.5 rounded-xl border border-line bg-elev font-mono text-[11px] text-ink overflow-x-auto leading-relaxed max-h-64">
                  {getCodeSnippet(snippetModalTemplate)}
                </pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getCodeSnippet(snippetModalTemplate));
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="absolute top-2.5 right-2.5 px-2 py-1 rounded-lg bg-surface border border-line text-[10px] font-medium text-ink hover:bg-elev cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  {copiedSnippet ? <Check className="w-3 h-3 text-ok" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-elev/50 border border-line text-[11px] text-sub leading-normal">
                💡 <b>Endpoint:</b> <code className="font-mono text-ink">POST {import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/emails/send</code> with header <code className="font-mono text-ink">x-api-key</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Split-Pane Template Studio Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-5xl h-[90vh] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-line shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-ink text-base">
                  {editingTemplate ? `Edit Template: ${name}` : 'New Email Template Studio'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-mute hover:text-ink p-1 rounded-lg hover:bg-elev transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Split Content: Left Editor | Right Live Preview */}
            <div className="flex-1 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-line min-h-0 overflow-y-auto">
              {/* Left: Code Editor */}
              <form onSubmit={handleSaveTemplate} className="p-6 flex flex-col gap-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-sub block mb-1">Template Name</label>
                    <input
                      type="text"
                      placeholder="e.g. welcome-email"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-sub block mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
                    >
                      <option value="authentication">Authentication</option>
                      <option value="marketing">Marketing</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-sub block mb-1">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
                    required
                  />
                </div>

                <div className="flex-1 flex flex-col min-h-[220px]">
                  <label className="text-xs font-semibold text-sub block mb-1">HTML Source Code</label>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="<div>Hello {{name}}!</div>"
                    className="w-full flex-1 p-3 rounded-xl border border-line bg-elev font-mono text-xs text-ink focus:border-brand focus:outline-none resize-none leading-relaxed"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 rounded-xl border border-line text-xs font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save & Publish Template'}
                  </button>
                </div>
              </form>

              {/* Right: Live Email Simulator */}
              <div className="p-6 bg-elev flex flex-col gap-4 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-sub">Simulated Recipient Preview</div>
                  <span className="text-[10px] text-mute font-mono">Realtime Live Preview</span>
                </div>

                {/* Email Client Window Mockup */}
                <div className="bg-surface border border-line rounded-xl shadow-lg flex-1 flex flex-col overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-line bg-elev/50 text-[11px] text-sub flex flex-col gap-1">
                    <div><b>From:</b> NotifyHub &lt;noreply@notifyhub.com&gt;</div>
                    <div><b>Subject:</b> {subject}</div>
                  </div>
                  <div
                    className="p-5 flex-1 overflow-y-auto prose dark:prose-invert text-xs max-w-none"
                    dangerouslySetInnerHTML={{ __html: getRenderedPreview() }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
