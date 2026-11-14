import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Plus, Key, Trash2, FolderKanban, Check, Power, Pencil, X } from 'lucide-react';

export const ProjectsPage = () => {
  const { 
    projects, 
    selectedProject, 
    selectProject, 
    toggleProjectStatus, 
    regenerateApiKey, 
    deleteProject, 
    updateProject,
    openCreateProject 
  } = useProject();
  const toast = useToast();

  const [activeKeyModal, setActiveKeyModal] = useState(null); // Newly regenerated key
  const [copiedKey, setCopiedKey] = useState(false);

  // Edit Project Modal state
  const [editModal, setEditModal] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleOpenEdit = (proj) => {
    setEditModal(proj);
    setEditName(proj.name);
    setEditDesc(proj.description || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Validation', 'Project name is required.');
      return;
    }

    setUpdating(true);
    try {
      await updateProject(editModal._id, { name: editName.trim(), description: editDesc.trim() });
      setEditModal(null);
    } catch (err) {
      // handled
    } finally {
      setUpdating(false);
    }
  };

  const handleRegenerate = async (id, name) => {
    if (window.confirm(`Are you sure you want to regenerate the API key for "${name}"? The old key will stop working immediately!`)) {
      try {
        const data = await regenerateApiKey(id);
        setActiveKeyModal({ name, key: data.apiKey });
      } catch (err) {
        // handled in context
      }
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteProject(id);
      } catch (err) {
        // handled in context
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Projects</h1>
          <p className="text-sub text-xs mt-1">Manage tenant applications, names, and API keys</p>
        </div>
        <button
          onClick={openCreateProject}
          className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center max-w-md mx-auto mt-12">
          <FolderKanban className="w-10 h-10 text-mute mx-auto mb-3" />
          <h3 className="font-semibold text-ink text-base">No projects found</h3>
          <p className="text-sub text-xs mt-1 mb-4">Create your first project to start creating templates and sending emails.</p>
          <button
            onClick={openCreateProject}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 cursor-pointer"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isCurrent = selectedProject?._id === proj._id;
            const isActive = proj.status === 'active';

            return (
              <div
                key={proj._id}
                className={`lift bg-surface border rounded-xl p-5 flex flex-col justify-between transition-all ${
                  isCurrent ? 'border-brand shadow-md ring-1 ring-brand/20' : 'border-line'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-ink text-base truncate flex-1">{proj.name}</h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                        isActive ? 'text-ok' : 'text-warn'
                      }`}
                      style={{ background: isActive ? 'var(--okbg)' : 'var(--elev)' }}
                    >
                      ● {proj.status}
                    </span>
                  </div>

                  <p className="text-sub text-xs line-clamp-2 min-h-[32px]">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                  {/* Select button */}
                  {isCurrent ? (
                    <span className="text-xs text-brand font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Active Project
                    </span>
                  ) : (
                    <button
                      onClick={() => selectProject(proj)}
                      className="text-xs text-sub hover:text-ink font-medium cursor-pointer transition-colors"
                    >
                      Select Project
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {/* Edit Project Name / Desc */}
                    <button
                      onClick={() => handleOpenEdit(proj)}
                      className="p-1.5 rounded-lg border border-line hover:bg-elev text-sub hover:text-ink transition-colors cursor-pointer"
                      title="Edit Project Name"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Status toggle */}
                    <button
                      onClick={() => toggleProjectStatus(proj._id, isActive ? 'inactive' : 'active')}
                      className={`p-1.5 rounded-lg border border-line hover:bg-elev transition-colors cursor-pointer ${
                        isActive ? 'text-ok' : 'text-mute'
                      }`}
                      title={isActive ? 'Deactivate' : 'Activate'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    {/* Regenerate Key */}
                    <button
                      onClick={() => handleRegenerate(proj._id, proj.name)}
                      className="p-1.5 rounded-lg border border-line hover:bg-elev text-sub hover:text-ink transition-colors cursor-pointer"
                      title="Regenerate API Key"
                    >
                      <Key className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(proj._id, proj.name)}
                      className="p-1.5 rounded-lg border border-line hover:bg-bad/10 text-mute hover:text-bad transition-colors cursor-pointer"
                      title="Delete Project"
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

      {/* Edit Project Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-line mb-4">
              <h3 className="font-bold text-ink text-base">Edit Project</h3>
              <button onClick={() => setEditModal(null)} className="text-mute hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-sub block mb-1">Project Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-sub block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-line bg-surface text-ink text-xs focus:border-brand focus:outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(null)}
                  className="px-4 py-2 rounded-xl border border-line text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-medium hover:opacity-95 disabled:opacity-50 cursor-pointer"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Regenerated Key Display Modal */}
      {activeKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-line rounded-2xl w-full max-w-md p-5 shadow-2xl">
            <h3 className="font-bold text-ink text-base mb-1">New Key Generated</h3>
            <p className="text-sub text-xs mb-4">
              API key for <b className="text-ink">{activeKeyModal.name}</b> has been updated. Save it now!
            </p>
            <div className="p-3 bg-elev border border-line rounded-xl font-mono text-xs text-ink break-all select-all mb-4">
              {activeKeyModal.key}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeKeyModal.key);
                  setCopiedKey(true);
                  setTimeout(() => setCopiedKey(false), 2000);
                }}
                className="flex-1 py-2 rounded-xl bg-brand text-white text-xs font-medium cursor-pointer"
              >
                {copiedKey ? 'Copied to Clipboard!' : 'Copy Key'}
              </button>
              <button
                onClick={() => setActiveKeyModal(null)}
                className="px-4 py-2 rounded-xl border border-line bg-surface text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
