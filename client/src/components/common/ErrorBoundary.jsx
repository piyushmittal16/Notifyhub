import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught a render error:', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-bg flex items-center justify-center p-4">
                    <div className="bg-surface border border-line rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                        <div className="w-12 h-12 rounded-xl bg-bad/10 text-bad grid place-items-center mx-auto mb-4 border border-bad/20">
                            <AlertTriangle className="w-6 h-6" />
                        </div>

                        <h2 className="text-lg font-bold text-ink mb-1">Something went wrong</h2>
                        <p className="text-sub text-xs leading-relaxed mb-6">
                            An unexpected client error occurred. Don't worry, your data and settings are completely safe.
                        </p>

                        <button
                            onClick={this.handleReload}
                            className="w-full py-2.5 rounded-xl bg-brand text-white font-medium text-xs hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Reload Application</span>
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}