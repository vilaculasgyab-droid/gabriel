import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  WifiOff,
  Clock
} from 'lucide-react';
import { authService, AuthErrorCode } from '../../services/authService';
import { FortiMozLogo } from '../../components/CategoryIcon';
import { getSafeErrorMessage } from '../../utils/error';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateToStore }) => {
  const [email, setEmail] = useState('vialnculofelix845@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState<AuthErrorCode | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setErrorCode(null);
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(getSafeErrorMessage(res.error, 'Credenciais inválidas.'));
        setErrorCode(res.errorCode || 'UNEXPECTED_ERROR');
      }
    } catch (err: unknown) {
      setErrorMessage(getSafeErrorMessage(err, 'Ocorreu um erro ao contactar o servidor.'));
      setErrorCode('UNEXPECTED_ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Back to store button */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center z-10">
        <button
          onClick={onNavigateToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl backdrop-blur-md cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja FortiMoz</span>
        </button>

        <div className="flex items-center gap-1 text-[11px] text-amber-400/80 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sessão Segura</span>
        </div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
            <FortiMozLogo className="h-12 w-auto" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Área Administrativa Privada</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Acesso à Gestão FortiMoz
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Introduza as suas credenciais de administrador para gerir produtos, stock, pedidos e clientes.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {errorMessage && (
            <div className={`mb-5 p-4 rounded-xl border text-xs flex items-start gap-3 animate-in shake ${
              errorCode === 'CONNECTION_ERROR' 
                ? 'bg-amber-950/70 border-amber-800/80 text-amber-200' 
                : errorCode === 'RATE_LIMITED'
                ? 'bg-red-950/80 border-red-800 text-red-200'
                : 'bg-red-950/80 border-red-800 text-red-200'
            }`}>
              <div className="flex-shrink-0 mt-0.5">
                {errorCode === 'CONNECTION_ERROR' ? (
                  <WifiOff className="w-4 h-4 text-amber-400" />
                ) : errorCode === 'RATE_LIMITED' ? (
                  <Clock className="w-4 h-4 text-red-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="space-y-1">
                <div className="font-bold text-[13px]">
                  {errorCode === 'INVALID_CREDENTIALS' && 'Credenciais Inválidas'}
                  {errorCode === 'RATE_LIMITED' && 'Tentativas Excedidas'}
                  {errorCode === 'CONNECTION_ERROR' && 'Falha de Conexão'}
                  {errorCode === 'SERVER_ERROR' && 'Erro no Servidor de Autenticação'}
                  {errorCode === 'UNEXPECTED_ERROR' && 'Erro de Autenticação'}
                </div>
                <div className="text-[11px] leading-relaxed text-slate-300">
                  {getSafeErrorMessage(errorMessage)}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                E-mail do Administrador
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vialnculofelix845@gmail.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Palavra-passe
                </label>
                <span className="text-[11px] text-slate-500">Credenciais FortiMoz</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>A verificar credenciais...</span>
                </div>
              ) : (
                <>
                  <span>Entrar no Painel Administrativo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Information Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Conta de Administrador:
                </span>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  Sessão Segura HttpOnly
                </span>
              </div>
              <div className="font-mono text-left bg-slate-900 p-2.5 rounded-lg text-[11px] text-slate-300 select-all border border-slate-800/80">
                <div>E-mail: <strong className="text-amber-400">vialnculofelix845@gmail.com</strong></div>
                <div className="text-[10px] text-slate-400 mt-0.5">Acesso restrito à equipa autorizada da FortiMoz.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Autenticação e sessão protegidas pelo servidor da FortiMoz.</span>
        </div>
      </div>
    </div>
  );
};
