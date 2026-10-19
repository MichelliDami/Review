import { api } from '../api';
import React, { useState } from 'react';
import {
  X,
  Moon,
  Sun,
  Mail,
  User as UserIcon,
  Shield,
  KeyRound,
  Check,
  AlertCircle,
  LogOut,
  Bell,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser,
  allUsers,
  setAllUsers,
  theme,
  setTheme,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'account' | 'password' | 'notifications'>('theme');

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [recoveryCodeSent, setRecoveryCodeSent] = useState(false);

  // Notifications preferences
  const notifLikes = currentUser?.preferences?.likes ?? true;
  const notifComments = currentUser?.preferences?.comments ?? true;
  const notifTrending = currentUser?.preferences?.trending ?? true;
  const updatePreference = (key: 'likes' | 'comments' | 'trending', value: boolean) => {
    if (!currentUser) return;
    const updated = { ...currentUser, preferences: { ...currentUser.preferences, [key]: value } };
    setCurrentUser(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  if (!isOpen || !currentUser) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPasswordInput.length < 8) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('A confirmação da senha não confere com a nova senha.');
      return;
    }

    try {
      await api('/auth/password', { currentPassword: currentPasswordInput, password: newPasswordInput });
    } catch (error: any) { setPasswordError(error.message); return; }

    setPasswordSuccess('Senha alterada com sucesso! Suas credenciais foram atualizadas.');
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
  };

  const handleSendRecoveryEmail = () => {
    setPasswordError('Recupera??o por e-mail ainda n?o configurada. Entre em contato com a administra??o.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl cosmic-card rounded-3xl overflow-hidden border border-purple-800/50 shadow-2xl my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-900/40 flex items-center justify-between bg-[#0e0720]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configurações</h3>
              <p className="text-[11px] text-zinc-400">Personalize sua experiência no Review</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px]">
          {/* Sidebar Menu */}
          <div className="md:col-span-4 p-3 bg-purple-950/30 border-r border-purple-900/40 space-y-1">
            <button
              onClick={() => setActiveTab('theme')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              {theme === 'dark' ? <Moon className="w-4 h-4 text-purple-300" /> : <Sun className="w-4 h-4 text-amber-300" />}
              <span>Aparência & Tema</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Mail className="w-4 h-4 text-purple-300" />
              <span>Dados da Conta</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <KeyRound className="w-4 h-4 text-purple-300" />
              <span>Recuperar / Senha</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'text-zinc-300 hover:text-white hover:bg-purple-900/30'
              }`}
            >
              <Bell className="w-4 h-4 text-purple-300" />
              <span>Notificações</span>
            </button>

            <div className="pt-4 mt-4 border-t border-purple-900/30">
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          </div>

          {/* Tab Content Panel */}
          <div className="md:col-span-8 p-5 sm:p-6 overflow-y-auto max-h-[500px]">
            {/* 1. THEME SETTINGS */}
            {activeTab === 'theme' && (
              <div className="space-y-5 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-white">Tema Visual do Review</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Escolha entre o visual noturno cósmico ou o modo claro minimalista.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Dark Theme Option */}
                  <div
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      theme === 'dark'
                        ? 'border-purple-500 bg-purple-950/60 shadow-lg shadow-purple-900/30'
                        : 'border-purple-900/40 bg-purple-950/20 hover:border-purple-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-purple-900/40 text-purple-300">
                        <Moon className="w-5 h-5" />
                      </div>
                      {theme === 'dark' && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block">Modo Noturno Cósmico</span>
                    <span className="text-[11px] text-zinc-400">Roxo profundo com estrelas</span>
                  </div>

                  {/* Light Theme Option */}
                  <div
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      theme === 'light'
                        ? 'border-purple-500 bg-purple-950/60 shadow-lg shadow-purple-900/30'
                        : 'border-purple-900/40 bg-purple-950/20 hover:border-purple-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                        <Sun className="w-5 h-5" />
                      </div>
                      {theme === 'light' && (
                        <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white block">Modo Claro</span>
                    <span className="text-[11px] text-zinc-400">Clean e minimalista</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 text-xs text-zinc-300">
                  <span className="font-semibold text-purple-300">Dica:</span> O seu tema preferido é salvo na sua conta.
                </div>
              </div>
            )}

            {/* 2. ACCOUNT INFO */}
            {activeTab === 'account' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-white">Dados da Conta</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Informações cadastrais da sua sessão atual.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">E-mail Cadastrado</span>
                      <span className="text-xs font-bold text-white">{currentUser.email}</span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[10px] font-semibold text-emerald-400">
                      Conectado
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Nome de Usuário</span>
                      <span className="text-xs font-bold text-white">@{currentUser.username}</span>
                    </div>
                    {currentUser.isVerified && (
                      <div className="flex items-center gap-1 text-[10px] text-purple-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verificado</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Tipo de Perfil</span>
                      <span className="text-xs font-bold text-white">
                        {currentUser.isAdmin ? 'Administradora Geral' : 'Membro Comunitário'}
                      </span>
                    </div>
                    {currentUser.isAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-600/30 border border-purple-500/40 text-[10px] font-bold text-purple-200">
                        Acesso Total
                      </span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">Verificação de Idade</span>
                      <span className="text-xs font-bold text-white">
                        {currentUser.age} anos (Autorizado +18)
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-full bg-purple-950/50 text-[10px] text-zinc-300">
                      Seguro
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. PASSWORD RECOVERY / CHANGE */}
            {activeTab === 'password' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-white">Segurança e Senha</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Altere sua senha de acesso ou solicite código de recuperação.
                  </p>
                </div>

                {passwordSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-medium">Nova Senha</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 6 dígitos"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        className="w-full px-3 py-2 pr-9 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-medium">Confirmar Nova Senha</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repita a nova senha"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-colors shadow-md shadow-purple-900/40 cursor-pointer"
                  >
                    Atualizar Senha
                  </button>
                </form>

                <div className="pt-3 border-t border-purple-900/30 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white block">Esqueceu a senha?</span>
                    <span className="text-[11px] text-zinc-400">
                      Envie um link de recuperação para {currentUser.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendRecoveryEmail}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 text-xs font-medium text-purple-300 hover:text-white border border-purple-800/40 cursor-pointer transition-colors"
                  >
                    {recoveryCodeSent ? 'Enviado!' : 'Recuperar Senha'}
                  </button>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <h4 className="text-sm font-bold text-white">Preferências de Notificação</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Escolha quais avisos você deseja receber no aplicativo.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">Curtidas nas suas avaliações</span>
                      <span className="text-[11px] text-zinc-400">Avise quando alguém curtir seu post</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifLikes}
                      onChange={(e) => updatePreference('likes', e.target.checked)}
                      className="rounded border-purple-800 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">Comentários e Respostas</span>
                      <span className="text-[11px] text-zinc-400">Quando alguém responder uma avaliação sua</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifComments}
                      onChange={(e) => updatePreference('comments', e.target.checked)}
                      className="rounded border-purple-800 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-white block">Novos produtos em alta</span>
                      <span className="text-[11px] text-zinc-400">Destaques nos seus nichos favoritos</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifTrending}
                      onChange={(e) => updatePreference('trending', e.target.checked)}
                      className="rounded border-purple-800 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
