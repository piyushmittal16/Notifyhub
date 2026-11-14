import React, { useState } from 'react';
import { useProject } from '../../context/ProjectContext';
import { X, Copy, Check, KeyRound, AlertTriangle } from 'lucide-react';

export const CreateProjectModal = ({ onClose }) => {
  const { createProject } = useProject();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // One-time API Key display state
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createProject({ name: name.trim(), description: description.trim() });
      if (result.apiKey) {
        setGeneratedKey(result.apiKey);
      } else {
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-line rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2 font-semibold text-ink text-base">
            <span className="w-7 h-7 rounded-lg bg-elev grid place-items-center text-brand">
              <KeyRound className="w-4 h-4" />
            </span>
            {generatedKey ? 'API Key Generated' : 'Create New Project'}
          </div>
          <button
            onClick={onClose}
            className="text-mute hover:text-ink p-1 rounded-lg hover:bg-elev transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {generatedKey ? (
            /* 🔑 Step 2: One-Time API Key Screen */
            <div className="space-y-4">
              <div className="flex gap-2.5 p-3 rounded-xl border border-warn/30 bg-warn/10 text-warn text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <b className="font-semibold block mb-0.5">Save this key now!</b>
                  For your security, this raw secret key will <u>never</u> be shown again. Store it in your backend's <code className="font-mono bg-surface px-1 py-0.5 rounded">.env</code> file.
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-mute uppercase tracking-wider block mb-1.5">
                  Project API Key
                </label>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-line bg-elev font-mono text-xs text-ink break-all">
                  <span className="flex-1 select-all">{generatedKey}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-line bg-surface hover:bg-elev text-ink transition-colors cursor-pointer shrink-0"
                    title="Copy Key"
                  >
                    {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-brand text-white font-medium text-sm hover:opacity-95 transition-opacity cursor-pointer mt-2"
              >
                I have safely stored my key
              </button>
            </div>
          ) : (
            /* 📝 Step 1: Project Details Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl border border-bad/30 bg-bad/10 text-bad text-xs">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-sub block mb-1.5">
                  Project Name <span className="text-bad">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. My E-commerce App"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus:border-brand focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-sub block mb-1.5">
                  Description <span className="text-mute font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Transactional emails for user onboarding and checkout..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-line bg-surface text-ink text-sm focus:border-brand focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-line bg-surface text-sub hover:bg-elev hover:text-ink text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
