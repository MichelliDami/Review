import React, { useEffect, useState } from 'react';
import {
  X,
  Camera,
  Upload,
  User as UserIcon,
  Sparkles,
  Check,
  AlertCircle,
} from 'lucide-react';
import { User } from '../types';
import confetti from 'canvas-confetti';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSaveProfile: (updatedUser: User) => void;
}

const AVAILABLE_NICHES = [
  'Perfumes',
  'Tecnologia',
  'Beleza',
  'Moda',
  'Restaurantes',
  'Filmes e Séries',
  'Músicas',
  'Livros',
  'Casa',
  'Eventos',
  'Games',
  'Viagens',
  'Lojas',
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile,
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [interests, setInterests] = useState<string[]>(currentUser?.interests || []);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setName(currentUser.name);
    setUsername(currentUser.username);
    setBio(currentUser.bio || '');
    setAvatar(currentUser.avatar);
    setInterests(currentUser.interests || []);
    setErrorMessage('');
  }, [isOpen, currentUser?.id]);

  if (!isOpen || !currentUser) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('A imagem deve ter no máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleNiche = (niche: string) => {
    if (interests.includes(niche)) {
      setInterests(interests.filter((i) => i !== niche));
    } else {
      setInterests([...interests, niche]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }

    const cleanUsername = username.replace('@', '').trim().toLowerCase();
    if (!cleanUsername) {
      setErrorMessage('Por favor, informe um nome de usuário.');
      return;
    }

    const updated: User = {
      ...currentUser,
      name: name.trim(),
      username: cleanUsername,
      bio: bio.trim(),
      avatar: avatar,
      interests: interests,
    };

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    onSaveProfile(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg cosmic-card rounded-3xl overflow-hidden border border-purple-800/50 shadow-2xl my-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-purple-900/40 flex items-center justify-between bg-[#0e0720]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-300">
              <UserIcon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Editar Perfil</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-purple-950/70 hover:bg-purple-900 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Avatar Section (Device Upload) */}
          <div className="flex flex-col items-center justify-center space-y-3 pb-2">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-amber-400 shadow-xl overflow-hidden">
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full rounded-full object-cover border-2 border-[#120826]"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Upload badge trigger */}
              <label
                htmlFor="avatar-device-upload"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg cursor-pointer transition-transform hover:scale-110"
                title="Carregar foto do dispositivo"
              >
                <Camera className="w-4 h-4" />
                <input
                  id="avatar-device-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <label
              htmlFor="avatar-device-upload"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Carregar nova foto do seu dispositivo</span>
            </label>
          </div>

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Nome Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              placeholder="Seu nome"
            />
          </div>

          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Nome de usuário</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-purple-400">@</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                placeholder="usuario"
              />
            </div>
          </div>

          {/* Bio Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">Biografia (Bio)</label>
              <span className="text-[11px] text-zinc-400">{bio.length}/160</span>
            </div>
            <textarea
              rows={3}
              maxLength={160}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escreva algo sobre você, seus gostos, nichos favoritos ou produtos que você avalia..."
              className="w-full p-3 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 leading-relaxed"
            />
          </div>

          {/* Favorite Niches */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Seus Nichos Favoritos de Avaliação
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_NICHES.map((niche) => {
                const isSelected = interests.includes(niche);
                return (
                  <button
                    key={niche}
                    type="button"
                    onClick={() => toggleNiche(niche)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600 text-white font-bold shadow-sm'
                        : 'bg-purple-950/40 text-zinc-400 border border-purple-900/40 hover:bg-purple-900/40 hover:text-zinc-200'
                    }`}
                  >
                    {niche}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white bg-purple-950/50 hover:bg-purple-900/50 cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/40 cursor-pointer transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
