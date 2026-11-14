import React, { useState, useEffect } from 'react';
import { X, Send, Mail, CheckCircle2, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export const SendTestEmailModal = ({ isOpen, onClose, projectId, onEmailSent }) => {
    const toast = useToast();
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [recipient, setRecipient] = useState('');
    const [variablesJson, setVariablesJson] = useState('{\n  "name": "Alex",\n  "otp": "123456"\n}');
    const [loadingTemplates, setLoadingTemplates] = useState(false);
    const [sending, setSending] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (isOpen && projectId) {
            setPreviewUrl(null);
            fetchTemplates();
        }
    }, [isOpen, projectId]);

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const res = await api.get(`/projects/${projectId}/templates`);
            const rawList = res.data?.templates || res.templates || [];
            const activeList = rawList.filter(t => t.status === 'active');
            setTemplates(activeList);
            if (activeList.length > 0) {
                setSelectedTemplateId(activeList[0]._id);
            }
        } catch (err) {
            toast.error('Failed to load templates');
        } finally {
            setLoadingTemplates(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!selectedTemplateId) {
            toast.error('Please select a template');
            return;
        }
        if (!recipient.trim()) {
            toast.error('Please enter a recipient email');
            return;
        }

        let parsedVars = {};
        try {
            if (variablesJson.trim()) {
                parsedVars = JSON.parse(variablesJson);
            }
        } catch (err) {
            toast.error('Invalid JSON in variables field');
            return;
        }

        setSending(true);
        setPreviewUrl(null);

        try {
            const res = await api.post(`/projects/${projectId}/emails/test-send`, {
                templateId: selectedTemplateId,
                to: recipient.trim(),
                variables: parsedVars
            });

            toast.success('Test Email Sent!', 'The email was processed and logged.');

            const preview = res.data?.previewUrl || res.previewUrl;
            if (preview) {
                setPreviewUrl(preview);
            }

            if (onEmailSent) {
                onEmailSent();
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to send test email';
            toast.error('Send Failed', msg);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-surface border border-line rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-sub hover:text-ink transition-colors p-1 cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand grid place-items-center">
                        <Send className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-ink">Send Test Email</h2>
                        <p className="text-xs text-sub">Simulate a transactional email dispatch in 1-click</p>
                    </div>
                </div>

                {/* Ethereal Preview Success Banner */}
                {previewUrl && (
                    <div className="mb-5 p-3.5 bg-ok/10 border border-ok/30 rounded-xl flex items-center justify-between text-xs text-ok">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 shrink-0" />
                            <span>Email delivered to test inbox!</span>
                        </div>
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold underline hover:opacity-80"
                        >
                            View Preview <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                )}

                <form onSubmit={handleSend} className="space-y-4">
                    {/* Template Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Select Template</label>
                        {loadingTemplates ? (
                            <div className="text-xs text-sub py-2">Loading templates...</div>
                        ) : templates.length === 0 ? (
                            <div className="text-xs text-bad bg-bad/10 p-2.5 rounded-lg">
                                No active templates found. Please create and activate a template first.
                            </div>
                        ) : (
                            <select
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className="w-full bg-elev border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                            >
                                {templates.map((tpl) => (
                                    <option key={tpl._id} value={tpl._id}>
                                        {tpl.name} ({tpl.subject})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Recipient Input */}
                    <div>
                        <label className="block text-xs font-semibold text-ink mb-1">Recipient Email (To)</label>
                        <input
                            type="email"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="e.g. developer@example.com"
                            required
                            className="w-full bg-elev border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                        />
                    </div>

                    {/* Variables (JSON) */}
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-semibold text-ink">Variables (JSON)</label>
                            <span className="text-[10px] text-sub">Matches {'{{variable}}'} in template</span>
                        </div>
                        <textarea
                            rows={4}
                            value={variablesJson}
                            onChange={(e) => setVariablesJson(e.target.value)}
                            className="w-full font-mono bg-elev border border-line rounded-xl p-3 text-xs text-ink focus:outline-none focus:border-brand resize-none"
                            placeholder='{ "name": "John" }'
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium text-sub hover:text-ink rounded-xl border border-line hover:bg-elev transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending || templates.length === 0}
                            className="px-4 py-2 text-xs font-medium bg-brand text-white rounded-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Sending...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>Send Test</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};