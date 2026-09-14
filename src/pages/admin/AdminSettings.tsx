import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  KeyRound, 
  User, 
  CreditCard, 
  Database, 
  Download, 
  RotateCcw, 
  Check, 
  AlertCircle,
  Save,
  Lock,
  Smartphone,
  Globe,
  ExternalLink,
  RefreshCw,
  Cloud,
  Server,
  UploadCloud,
  Copy
} from 'lucide-react';
import { AdminUser } from '../../types';
import { authService } from '../../services/authService';
import { storeDb } from '../../services/storeDb';

interface AdminSettingsProps {
  adminUser: AdminUser | null;
  onProfileUpdated: () => void;
  showToast: (msg: string) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  adminUser,
  onProfileUpdated,
  showToast,
}) => {
  // Profile State
  const [name, setName] = useState(adminUser?.name || 'Administrador FortiMoz');
  const [email, setEmail] = useState(adminUser?.email || 'admin@fortimoz.co.mz');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Payment Gateway Settings (Mock/Config state for M-Pesa, e-Mola, Visa)
  const [mpesaShortcode, setMpesaShortcode] = useState('171717');
  const [mpesaEnv, setMpesaEnv] = useState<'sandbox' | 'production'>('sandbox');
  const [emolaMerchantId, setEmolaMerchantId] = useState('EMOLA-FORTIMOZ-001');
  const [visaEnabled, setVisaEnabled] = useState(true);

  // Supabase State & Migration
  const [supabaseStatus, setSupabaseStatus] = useState<{
    configured: boolean;
    connected?: boolean;
    productCount?: number;
    orderCount?: number;
    storageBucketReady?: boolean;
    error?: string;
  } | null>(null);
  const [checkingSupabase, setCheckingSupabase] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);

  const fetchSupabaseStatus = async () => {
    setCheckingSupabase(true);
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setCheckingSupabase(false);
    }
  };

  useEffect(() => {
    fetchSupabaseStatus();
  }, []);

  const handleStartMigration = async () => {
    setMigrating(true);
    setMigrationResult(null);
    try {
      const res = await fetch('/api/supabase/migrate', { method: 'POST' });
      const data = await res.json();
      setMigrationResult(data);
      if (data.success) {
        showToast('Migração para Supabase concluída com sucesso!');
        fetchSupabaseStatus();
        storeDb.syncWithServer(true);
      } else {
        showToast(data.error || 'Falha ao migrar para o Supabase');
      }
    } catch (err: any) {
      showToast(err.message || 'Erro de rede na migração');
    } finally {
      setMigrating(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await authService.updateProfile(name, email);
    setSavingProfile(false);
    if (res.success) {
      showToast('Perfil do administrador atualizado com sucesso!');
      onProfileUpdated();
    } else {
      showToast(res.error || 'Erro ao atualizar perfil.');
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('A nova palavra-passe e a confirmação não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('A nova palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }

    setSavingPassword(true);
    const res = await authService.changePassword(currentPassword, newPassword);
    setSavingPassword(false);

    if (res.success) {
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Palavra-passe alterada com sucesso! Guardada com segurança no Supabase.');
    } else {
      setPasswordError(res.error || 'Erro ao alterar palavra-passe.');
    }
  };

  const handleExportData = () => {
    const jsonStr = storeDb.exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortimoz_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Cópia de segurança exportada com sucesso em formato JSON.');
  };

  const handleResetData = () => {
    if (window.confirm('Tem a certeza de que deseja repor os dados de exemplo padrão?')) {
      storeDb.resetToDefaults();
      showToast('Base de dados restaurada com os valores padrão.');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Painel de Segurança & Sistema</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Definições & Segurança
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Configure credenciais de acesso, estrutura de pagamentos em Moçambique e cópias de segurança.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Security & Password Change */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-amber-400/15 text-amber-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Alterar Palavra-passe Segura</h3>
              <p className="text-[11px] text-slate-400">Autenticação encriptada e persistida no Supabase Auth</p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Palavra-passe alterada com sucesso!</span>
            </div>
          )}

          <form onSubmit={handleSavePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Palavra-passe Atual
              </label>
              <input
                type="password"
                required
                placeholder="Introduza a sua senha atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nova Palavra-passe
              </label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Confirmar Nova Palavra-passe
              </label>
              <input
                type="password"
                required
                placeholder="Repita a nova palavra-passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{savingPassword ? 'A atualizar...' : 'Atualizar Palavra-passe'}</span>
            </button>
          </form>
        </div>

        {/* Profile Details */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Perfil do Administrador</h3>
              <p className="text-[11px] text-slate-400">Identificação para registo de auditoria e notificações</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Nome do Administrador
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                E-mail de Acesso
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Nível de Acesso:</span>
                <strong className="text-amber-400 font-bold uppercase text-[10px]">Super Administrador</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Estado da Sessão:</span>
                <strong className="text-emerald-400 font-bold text-[10px]">Autenticado</strong>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Alterações do Perfil</span>
            </button>
          </form>
        </div>

      </div>

      {/* Payment Gateways Structure & Backend Integration Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Payment Gateways */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Configuração de Pagamentos (Moçambique)</h3>
              <p className="text-[11px] text-slate-400">Estrutura pronta para conectar APIs do M-Pesa, e-Mola e cartões</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {/* M-Pesa */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span>Vodacom M-Pesa (C2B / B2C)</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                  Ativo no Checkout
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Shortcode Padrão: <strong className="text-white font-mono">{mpesaShortcode}</strong>
              </div>
            </div>

            {/* e-Mola */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                  <span>Movitel e-Mola</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                  Ativo no Checkout
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Merchant ID: <strong className="text-white font-mono">{emolaMerchantId}</strong>
              </div>
            </div>

            {/* Bank Transfers */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>Transferência Bancária (BIM / BCI / Standard Bank)</span>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                  Ativo
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                Instruções de IBAN e NIB geradas automaticamente no pedido
              </div>
            </div>
          </div>
        </div>

        {/* Database & Supabase Integration */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Base de Dados & Supabase</h3>
                <p className="text-[11px] text-slate-400">Migração, sincronização e armazenamento em nuvem</p>
              </div>
            </div>

            <button
              onClick={fetchSupabaseStatus}
              disabled={checkingSupabase}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Recarregar estado do Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingSupabase ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Supabase Status Banner */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Status Supabase (Produção)</span>
                </div>
                {supabaseStatus?.connected ? (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Conectado
                  </span>
                ) : supabaseStatus?.configured ? (
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                    A Conectar...
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-bold">
                    Aguardando .env
                  </span>
                )}
              </div>

              {/* Status details grid */}
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Tabela Produtos</span>
                  <strong className="text-white font-bold text-xs">
                    {supabaseStatus?.productsCount !== undefined
                      ? `${supabaseStatus.productsCount} no Supabase`
                      : supabaseStatus?.productCount !== undefined
                      ? `${supabaseStatus.productCount} no Supabase`
                      : 'Pronto'}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Tabela Pedidos</span>
                  <strong className="text-white font-bold text-xs">
                    {supabaseStatus?.ordersCount !== undefined
                      ? `${supabaseStatus.ordersCount} no Supabase`
                      : supabaseStatus?.orderCount !== undefined
                      ? `${supabaseStatus.orderCount} no Supabase`
                      : '0 pedidos'}
                  </strong>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-slate-400 block text-[10px]">Bucket Imagens</span>
                  <strong className="text-white font-bold text-xs">
                    {supabaseStatus?.storageReady || supabaseStatus?.storageBucketReady ? 'product-images (OK)' : 'Configurado'}
                  </strong>
                </div>
              </div>

              {supabaseStatus?.error && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-200">Atenção ao Acesso no Supabase:</strong> {supabaseStatus.error}
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    Para liberar o acesso da loja pública e do backend com RLS ativo, execute o script SQL abaixo no SQL Editor do Supabase:
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-emerald-300 select-all overflow-x-auto">
                    GRANT SELECT ON TABLE public.products TO anon;
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href="https://supabase.com/dashboard/project/ixubqdyqjxqpmnbwfhhi/sql/new"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-bold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Abrir SQL Editor no Supabase</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Migration Trigger Button */}
              <div className="pt-1">
                <button
                  onClick={handleStartMigration}
                  disabled={migrating}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {migrating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>A Migrar Dados e Imagens para Supabase...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4 text-slate-950" />
                      <span>Executar Migração dos Dados para o Supabase</span>
                    </>
                  )}
                </button>
              </div>

              {/* Migration Log Summary Box */}
              {migrationResult && (
                <div className={`p-3 rounded-xl border text-[11px] space-y-1.5 ${
                  migrationResult.success ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200' : 'bg-red-950/40 border-red-500/30 text-red-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {migrationResult.success ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                    <span>{migrationResult.message || (migrationResult.success ? 'Migração concluída!' : 'Erro na migração')}</span>
                  </div>
                  {migrationResult.summary && (
                    <div className="text-[10px] text-slate-300 space-y-0.5 pt-1 border-t border-slate-800/60 font-mono">
                      <div>• Produtos migrados: {migrationResult.summary.productsInsertedOrUpdated}</div>
                      <div>• Imagens enviadas para Storage: {migrationResult.summary.imagesUploaded}</div>
                      <div>• Pedidos migrados: {migrationResult.summary.ordersInserted}</div>
                      {migrationResult.summary.errors?.length > 0 && (
                        <div className="text-red-400">• Avisos: {migrationResult.summary.errors.length}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Local backup controls */}
            <div className="pt-1 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleExportData}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Exportar Dados (JSON)</span>
              </button>

              <button
                onClick={handleResetData}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar Padrões</span>
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
