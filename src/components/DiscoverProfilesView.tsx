import React, { useState } from 'react';
import {
  User as UserIcon,
  Star,
  CheckCircle2,
  Search,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Shield,
  Heart,
} from 'lucide-react';
import { User, Review } from '../types';

interface DiscoverProfilesViewProps {
  allUsers: User[];
  currentUser: User | null;
  reviews: Review[];
  onSelectUser: (userHandle: string) => void;
  onRateUser: (targetUserId: string, rating: number) => void;
}

export const DiscoverProfilesView: React.FC<DiscoverProfilesViewProps> = ({
  allUsers,
  currentUser,
  reviews,
  onSelectUser,
  onRateUser,
}) => {
  const [searchMember, setSearchMember] = useState('');
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [hoverRatingMap, setHoverRatingMap] = useState<Record<string, number>>({});
  const [ratedFeedbackMap, setRatedFeedbackMap] = useState<Record<string, number>>({});

  const toggleFollow = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowingMap((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleRate = (targetUser: User, star: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onRateUser(targetUser.id, star);
    setRatedFeedbackMap((prev) => ({ ...prev, [targetUser.id]: star }));
    setTimeout(() => {
      setRatedFeedbackMap((prev) => {
        const copy = { ...prev };
        delete copy[targetUser.id];
        return copy;
      });
    }, 2500);
  };

  const filteredUsers = allUsers.filter((u) => {
    if (!searchMember.trim()) return true;
    const q = searchMember.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const matchName = u.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
    const matchUsername = u.username.toLowerCase().includes(q);
    const matchBio = u.bio?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q);
    const matchInterest = u.interests?.some((i) => i.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q));
    return matchName || matchUsername || matchBio || matchInterest;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Descobrir Membros</span>
            <span className="p-1 rounded-lg bg-purple-600/30 text-purple-300 text-xs">Comunidade</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Conheça outros perfis cadastrados, avalie quem você confia e descubra resenhas autênticas.
          </p>
        </div>

        {/* Search profiles */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Buscar por nome, @user ou nicho..."
            value={searchMember}
            onChange={(e) => setSearchMember(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-purple-950/40 border border-purple-900/60 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => {
          const isMe = currentUser?.id === user.id;
          const isFollowing = !!followingMap[user.id];
          const userReviewsCount = reviews.filter((r) => r.userId === user.id || r.userHandle === user.username).length;
          const currentRating = user.rating || 5.0;
          const userRatingCount = user.ratingCount || 1;
          const hoverStar = hoverRatingMap[user.id] || 0;
          const ratedJustNow = ratedFeedbackMap[user.id];

          return (
            <div
              key={user.id}
              onClick={() => onSelectUser(user.username)}
              className="cosmic-card rounded-2xl p-5 border border-purple-900/40 cosmic-card-hover cursor-pointer flex flex-col justify-between space-y-4 relative group"
            >
              <div>
                {/* Header row: Avatar + Name + Follow */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-purple-600 to-amber-400">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover border-2 border-[#140b2a]"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {user.isVerified && (
                        <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-[#140b2a] rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.isAdmin && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-purple-600/40 text-purple-200 border border-purple-500/40">
                            ADM
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-purple-400">@{user.username}</span>
                      <span className="text-[10px] text-zinc-500 block mt-0.5">
                        {userReviewsCount} {userReviewsCount === 1 ? 'avaliação' : 'avaliações'}
                      </span>
                    </div>
                  </div>

                  {!isMe && (
                    <button
                      type="button"
                      onClick={(e) => toggleFollow(user.id, e)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isFollowing
                          ? 'bg-purple-950/70 text-purple-300 border border-purple-800'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/40'
                      }`}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                  )}
                </div>

                {/* Bio snippet */}
                {user.bio && (
                  <p className="text-xs text-zinc-300 line-clamp-2 mt-3 leading-relaxed">
                    "{user.bio}"
                  </p>
                )}

                {/* Interests Pills */}
                {user.interests && user.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {user.interests.slice(0, 3).map((niche) => (
                      <span
                        key={niche}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-950/60 text-purple-300 border border-purple-900/40"
                      >
                        {niche}
                      </span>
                    ))}
                    {user.interests.length > 3 && (
                      <span className="text-[10px] text-zinc-500 self-center">+{user.interests.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom: Profile Star Rating & View button */}
              <div className="pt-3 border-t border-purple-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="text-xs font-black ml-1 text-white">{currentRating.toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">({userRatingCount} avaliações)</span>
                  </div>

                  {ratedJustNow ? (
                    <span className="text-[10px] font-bold text-emerald-400 animate-in fade-in">
                      ✓ Avaliado com {ratedJustNow}★
                    </span>
                  ) : !isMe ? (
                    /* Interactive 5-star rating for this profile */
                    <div
                      className="flex items-center gap-1 bg-purple-950/60 px-2 py-0.5 rounded-lg border border-purple-800/40"
                      title="Avaliar este membro"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[10px] text-zinc-400 mr-0.5">Avaliar:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() =>
                            setHoverRatingMap((prev) => ({ ...prev, [user.id]: star }))
                          }
                          onMouseLeave={() =>
                            setHoverRatingMap((prev) => ({ ...prev, [user.id]: 0 }))
                          }
                          onClick={(e) => handleRate(user, star, e)}
                          className="cursor-pointer transition-transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              (hoverStar || 0) >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between text-xs text-purple-400 group-hover:text-purple-300 font-semibold pt-1">
                  <span>Ver perfil e avaliações</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
