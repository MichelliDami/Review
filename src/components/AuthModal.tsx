import React, { useState } from 'react';
import {
  X,
  Eye,
  EyeOff,
  User as UserIcon,
  Lock,
  Mail,
  Calendar,
  MapPin,
  Check,
  AlertCircle,
  BookOpen,
  Utensils,
  Film,
  Sparkles,
  Smartphone,
  Shirt,
  Home,
  Gamepad2,
  Plane,
  PartyPopper,
  Flame,
  Music,
  ShieldAlert,
} from 'lucide-react';
import { ReviewPlatformIllustration } from './ReviewPlatformIllustration';
import { User } from '../types';
import { api } from '../api';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
  allUsers: User[];
  setAllUsers: React.Dispatch<React.SetStateAction<User[]>>;
  isGate?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  allUsers,
  setAllUsers,
  isGate = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register form state (Step 1)
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBirthDate, setRegBirthDate] = useState('');
  const [ageError, setAgeError] = useState('');

  // Register form state (Step 2)
  const [regCep, setRegCep] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regState, setRegState] = useState('');
  const [regNeighborhood, setRegNeighborhood] = useState('');

  // Register form state (Step 3: Interesses - exactly matching Image 3)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Livros',
    'Restaurantes',
    'Filmes e séries',
    'Beleza',
    'Tecnologia',
    'Viagens',
  ]);



  // Age calculation helper (+18 requirement)
  const calculateAge = (dateString: string): number => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const [submitting, setSubmitting] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      const user = await api<User>('/auth/login', { identifier: loginIdentifier, password: loginPassword });
      onLoginSuccess(user);
      onClose();
    } catch (error: any) { setErrorMessage(error.message); }
    finally { setSubmitting(false); }
  };

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    setAgeError('');

    if (!regBirthDate) {
      setAgeError('Por favor, informe sua data de nascimento.');
      return;
    }

    const age = calculateAge(regBirthDate);
    if (age < 18) {
      setAgeError('Acesso proibido para menores de 18 anos. O Review é uma rede social restrita a maiores de 18 anos.');
      return;
    }

    setRegisterStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterStep(3);
  };

  const toggleInterest = (name: string) => {
    if (selectedInterests.includes(name)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== name));
    } else {
      setSelectedInterests([...selectedInterests, name]);
    }
  };

  const handleFinishRegister = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
    const age = calculateAge(regBirthDate) || 20;
    const cleanUsername = regUsername.replace('@', '').trim() || regName.toLowerCase().replace(/\s+/g, '.');

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: regName || 'Novo Usuário',
      username: cleanUsername,
      email: regEmail,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      isVerified: false,
      isAdmin: false,
      age: age,
      bio: `Novo explorador de avaliações no Review! Apaixonado por ${selectedInterests.slice(0, 2).join(' e ')}.`,
      reviewCount: 0,
      followersCount: 0,
      followingCount: 0,
      interests: selectedInterests,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const registered = await api<User>('/auth/register', { ...newUser, password: regPassword, birthDate: regBirthDate, location: { cep: regCep, city: regCity, state: regState, neighborhood: regNeighborhood } });
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
    onLoginSuccess(registered);
    onClose();
    } catch (error: any) { setErrorMessage(error.message); }
    finally { setSubmitting(false); }
  };

  const availableInterests = [
    { name: 'Livros', icon: BookOpen },
    { name: 'Restaurantes', icon: Utensils },
    { name: 'Filmes e séries', icon: Film },
    { name: 'Beleza', icon: Sparkles },
    { name: 'Tecnologia', icon: Smartphone },
    { name: 'Moda', icon: Shirt },
    { name: 'Casa', icon: Home },
    { name: 'Jogos', icon: Gamepad2 },
    { name: 'Viagens', icon: Plane },
    { name: 'Eventos', icon: PartyPopper },
    { name: 'Perfumes', icon: Flame },
    { name: 'Músicas', icon: Music },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl cosmic-card rounded-3xl overflow-hidden border border-purple-800/40 shadow-2xl my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Close button (only shown if not in mandatory gate mode) */}
        {!isGate && (
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-5 right-5 z-20 p-2 text-zinc-400 hover:text-white rounded-full bg-purple-950/60 hover:bg-purple-900/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header Branding */}
        <div className="pt-6 px-8 sm:px-12 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black tracking-tight text-white">Review</span>
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          </div>
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {mode === 'login' ? (
              <>
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                    Bem-vinda
                    <br />
                    de volta! 👋
                  </h2>
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed max-w-xs">
                    Entre na sua conta para descobrir avaliações reais de pessoas reais.
                  </p>
                </div>
                {/* 3D Glowing Podium Illustration */}
                <div className="w-full flex justify-center py-2">
                  <ReviewPlatformIllustration className="scale-95 sm:scale-105" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                      Faça parte
                      <br />
                      do Review.
                    </h2>
                    <span className="text-2xl">💜</span>
                  </div>
                  <p className="text-zinc-300 text-sm leading-relaxed max-w-sm">
                    Crie sua conta e descubra um universo de avaliações feitas por pessoas reais.
                  </p>
                </div>

                {/* Bullets matching Image 3 */}
                <div className="space-y-3 text-left w-full max-w-sm">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/30">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
                      ★
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">
                      Avalie produtos e experiências
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/30">
                    <div className="w-7 h-7 rounded-lg bg-fuchsia-600/30 flex items-center justify-center text-fuchsia-300">
                      ♥
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">
                      Descubra o que realmente vale a pena
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-purple-950/40 border border-purple-900/30">
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300">
                      ★
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-zinc-200">
                      Compartilhe suas experiências
                    </span>
                  </div>
                </div>

                <div className="w-full flex justify-center pt-2">
                  <ReviewPlatformIllustration className="scale-90" />
                </div>
              </>
            )}
          </div>

          {/* ================= RIGHT COLUMN (FORMS) ================= */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#140c2a]/90 border border-purple-800/40 shadow-xl">
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}


              {mode === 'login' ? (
                /* LOGIN FORM (Matching Image 1) */
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-black text-white">Login</h3>
                    <p className="text-sm text-purple-300 mt-1 flex items-center gap-1.5">
                      Que bom te ver por aqui! 💜
                    </p>
                  </div>

                  {/* Identifier Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 block">
                      E-mail ou nome de usuário
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                      <input
                        id="login-identifier-input"
                        type="text"
                        required
                        placeholder="Digite seu e-mail ou usuário"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300 block">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                      <input
                        id="login-password-input"
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Digite sua senha"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me & Forgot Password */}
                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-purple-800 text-purple-600 focus:ring-purple-500"
                      />
                      <span>Lembrar de mim</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrorMessage('Recupera??o por e-mail ainda n?o configurada. Entre em contato com a administra??o.')}
                      className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="submit-login-btn"
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/40 hover:shadow-purple-600/60 transition-all cursor-pointer"
                  >
                    Entrar
                  </button>

                  {/* Switch to Register */}
                  <p className="text-center text-xs text-zinc-400 pt-2">
                    Ainda não tem uma conta?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setRegisterStep(1);
                      }}
                      className="text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                    >
                      Criar conta
                    </button>
                  </p>
                </form>
              ) : (
                /* REGISTER MULTI-STEP WIZARD (Matching Image 3) */
                <div className="space-y-6">
                  {/* Step Indicators */}
                  <div className="flex items-center justify-between relative pb-2 border-b border-purple-900/40">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          registerStep >= 1 ? 'bg-purple-600 text-white' : 'bg-purple-950 text-zinc-400'
                        }`}
                      >
                        1
                      </div>
                      <span className={`text-xs font-semibold ${registerStep === 1 ? 'text-white' : 'text-zinc-400'}`}>
                        Seus dados
                      </span>
                    </div>

                    <div className="h-[1px] w-8 sm:w-16 bg-purple-900" />

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          registerStep >= 2 ? 'bg-purple-600 text-white' : 'bg-purple-950 text-zinc-400'
                        }`}
                      >
                        2
                      </div>
                      <span className={`text-xs font-semibold ${registerStep === 2 ? 'text-white' : 'text-zinc-400'}`}>
                        Endereço
                      </span>
                    </div>

                    <div className="h-[1px] w-8 sm:w-16 bg-purple-900" />

                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          registerStep === 3 ? 'bg-purple-600 text-white' : 'bg-purple-950 text-zinc-400'
                        }`}
                      >
                        3
                      </div>
                      <span className={`text-xs font-semibold ${registerStep === 3 ? 'text-white' : 'text-zinc-400'}`}>
                        Interesses
                      </span>
                    </div>
                  </div>

                  {/* STEP 1: Seus dados (With +18 Age Validation Mandate!) */}
                  {registerStep === 1 && (
                    <form onSubmit={handleStep1Next} className="space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">1. Informações Pessoais</h4>
                        <p className="text-xs text-purple-300">
                          Preencha seus dados para criar o seu perfil no Review.
                        </p>
                      </div>

                      {ageError && (
                        <div className="p-3 rounded-xl bg-red-950/70 border border-red-600 text-red-200 text-xs flex items-start gap-2.5">
                          <ShieldAlert className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
                          <div>
                            <p className="font-bold">Validação de Idade (+18 anos)</p>
                            <p className="text-[11px] mt-0.5">{ageError}</p>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">Nome completo</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Nicole Stackoski"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">Nome de usuário (@)</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: nicole.s"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs text-zinc-300">E-mail</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                          <input
                            type="email"
                            required
                            placeholder="seu@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">Senha</label>
                          <input
                            type="password"
                            required
                            placeholder="Mínimo 6 caracteres"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        {/* Birth date with age notice */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-xs text-zinc-300">Data de Nascimento</label>
                            <span className="text-[10px] text-amber-300 font-bold">+18 anos</span>
                          </div>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60" />
                            <input
                              type="date"
                              required
                              value={regBirthDate}
                              onChange={(e) => {
                                setRegBirthDate(e.target.value);
                                setAgeError('');
                              }}
                              className="w-full pl-9 pr-3 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-xs text-purple-300 hover:text-white cursor-pointer"
                        >
                          Já tem conta? Entrar
                        </button>
                        <button
                          type="submit"
                    disabled={submitting}
                          className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer"
                        >
                          Próximo: Endereço →
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: Endereço */}
                  {registerStep === 2 && (
                    <form onSubmit={handleStep2Next} className="space-y-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">2. Seu Endereço</h4>
                        <p className="text-xs text-purple-300">
                          Usado para recomendar restaurantes, eventos e lojas próximas a você.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">CEP</label>
                          <input
                            type="text"
                            placeholder="01310-100"
                            value={regCep}
                            onChange={(e) => setRegCep(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">Cidade</label>
                          <input
                            type="text"
                            placeholder="São Paulo"
                            value={regCity}
                            onChange={(e) => setRegCity(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">Estado (UF)</label>
                          <input
                            type="text"
                            placeholder="SP"
                            value={regState}
                            onChange={(e) => setRegState(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs text-zinc-300">Bairro</label>
                          <input
                            type="text"
                            placeholder="Bela Vista"
                            value={regNeighborhood}
                            onChange={(e) => setRegNeighborhood(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-purple-950/40 border border-purple-900/60 rounded-xl text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </div>

                      <div className="pt-3 flex justify-between items-center">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(1)}
                          className="text-xs text-purple-300 hover:text-white cursor-pointer"
                        >
                          ← Voltar
                        </button>
                        <button
                          type="submit"
                    disabled={submitting}
                          className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-500 transition-colors cursor-pointer"
                        >
                          Próximo: Interesses →
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: Interesses (Exact layout from Image 3!) */}
                  {registerStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xl font-black text-white">O que você gosta?</h4>
                        <p className="text-xs text-purple-300 mt-0.5">
                          Selecione os assuntos que você gostaria de descobrir e avaliar. 💜
                        </p>
                      </div>

                      {/* Selectable categories grid from Image 3 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {availableInterests.map((interest) => {
                          const isSelected = selectedInterests.includes(interest.name);
                          const Icon = interest.icon;
                          return (
                            <button
                              key={interest.name}
                              type="button"
                              onClick={() => toggleInterest(interest.name)}
                              className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-950/80 border-purple-500 text-white shadow-md shadow-purple-900/30'
                                  : 'bg-purple-950/20 border-purple-900/40 text-zinc-300 hover:bg-purple-900/30'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Icon
                                  className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-zinc-400'}`}
                                />
                                <span>{interest.name}</span>
                              </div>

                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                  isSelected ? 'bg-purple-600 text-white' : 'border border-purple-800/60'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom action buttons */}
                      <div className="pt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(2)}
                          className="px-4 py-2.5 text-xs text-purple-300 hover:text-white rounded-xl bg-purple-950/40 hover:bg-purple-900/40 cursor-pointer"
                        >
                          ← Voltar
                        </button>
                        <button
                          id="finish-register-btn"
                          type="button"
                          onClick={handleFinishRegister}
                        disabled={submitting}
                          className="flex-1 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/40 transition-all cursor-pointer text-center"
                        >
                          Criar minha conta →
                        </button>
                      </div>

                      <p className="text-center text-xs text-zinc-400 pt-1">
                        Já possui uma conta?{' '}
                        <button
                          type="button"
                          onClick={() => setMode('login')}
                          className="text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                        >
                          Fazer login
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info matching Image 1 */}
        <div className="px-8 sm:px-12 py-4 bg-[#090514]/80 border-t border-purple-900/30 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
          <span>© 2024 Review. Todos os direitos reservados.</span>
          <div className="flex items-center gap-4">
            <span className="hover:text-zinc-400 cursor-pointer">Termos de Uso</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Privacidade</span>
            <span>•</span>
            <span className="hover:text-zinc-400 cursor-pointer">Ajuda</span>
          </div>
        </div>
      </div>
    </div>
  );
};
