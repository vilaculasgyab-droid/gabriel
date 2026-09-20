import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';
import { getSafeErrorMessage } from '../../utils/error';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: unknown;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: unknown, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] Exceção capturada no painel administrativo:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleGoToStore = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      const title = this.props.fallbackTitle || 'Ocorreu um erro ao carregar o Painel Administrativo.';
      const message =
        this.props.fallbackMessage ||
        'O painel administrativo encontrou uma falha temporária de visualização. Os seus dados, pedidos e produtos continuam em segurança.';
      const technicalDetails = this.state.error ? getSafeErrorMessage(this.state.error) : '';

      return (
        <div
          id="admin-error-boundary"
          className="min-h-[400px] w-full flex items-center justify-center p-6 bg-slate-950/80 rounded-3xl border border-slate-800/80 my-4"
        >
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/10">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">{title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{message}</p>
            </div>

            {/* Error detail in collapsible or subtle box - guaranteed safe string */}
            {technicalDetails ? (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-left">
                <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider mb-1">
                  Detalhes Técnicos
                </div>
                <div className="text-xs font-mono text-red-400 break-words line-clamp-4 select-text">
                  {technicalDetails}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>

              <button
                type="button"
                onClick={this.handleHardReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Recarregar Página</span>
              </button>

              {this.props.showHomeButton && (
                <button
                  type="button"
                  onClick={this.handleGoToStore}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-medium border border-slate-800 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar à Loja</span>
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
