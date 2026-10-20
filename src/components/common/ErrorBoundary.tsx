import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in CelebraSphere AI:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('celebrasphere_active_plan_v1');
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
          <div className="max-w-md w-full bg-slate-800 border border-rose-500/30 rounded-2xl p-8 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Workspace Recovery Mode</h1>
              <p className="text-sm text-slate-400">
                CelebraSphere AI encountered an unexpected rendering error. Your workspace can be restored cleanly to the default Royal Wedding preset.
              </p>
            </div>
            {this.state.error && (
              <pre className="p-3 bg-slate-950/80 rounded-lg text-xs text-rose-300 font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-600 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white rounded-xl font-medium shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Workspace to Default Preset
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
