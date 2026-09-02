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
  KeyRound,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { authService } from '../../services/authService';
import { ProSegurancaLogo } from '../../components/CategoryIcon';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateToStore }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setErrorMessage(res.error || 'Credenciais inválidas.');
      }
    } catch {
      setErrorMessage('Ocorreu um erro ao processar a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemoCredentials = () => {
    const hint = authService.getDefaultCredentialsHint();
    setEmail(hint.email);
    setPassword(hint.passwordHint);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onNavigateToStore}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Loja Pública</span>
        </button>
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl mb-4">
            <ProSegurancaLogo inverted={true} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Área Administrativa Privada</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Acesso à Gestão ProSegurança
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Introduza as suas credenciais de administrador para gerir produtos, stock, pedidos e clientes.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2.5 animate-in shake">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
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
                  placeholder="admin@proseguranca.co.mz"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Palavra-passe Segura
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-11 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 cursor-pointer"
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
                  <span>A autenticar com segurança...</span>
                </div>
              ) : (
                <>
                  <span>Entrar no Painel Administrativo</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Helper credentials box */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 flex flex-col gap-2">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Conta de Administrador Padrão:
                </span>
                <button
                  type="button"
                  onClick={handleFillDemoCredentials}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Preencher dados
                </button>
              </div>
              <div className="font-mono text-left bg-slate-900 p-2 rounded-lg text-[10px] text-slate-300 select-all">
                <div>E-mail: <strong>admin@proseguranca.co.mz</strong></div>
                <div>Senha: <strong>ProSeguranca@2026</strong></div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Assurance Footer */}
        <div className="mt-6 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Sessão encriptada e protegida contra acessos não autorizados.</span>
        </div>
      </div>
    </div>
  );
};
