import React from 'react';
import { User as UserIcon } from 'lucide-react';

export interface UserAvatarProps {
  name?: string;
  role?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  isOnline?: boolean;
}

// Consistent vibrant background color based on name
const COLOR_VARIANTS = [
  'bg-blue-600 text-white',
  'bg-indigo-600 text-white',
  'bg-violet-600 text-white',
  'bg-emerald-600 text-white',
  'bg-teal-600 text-white',
  'bg-sky-600 text-white',
  'bg-cyan-600 text-white',
  'bg-purple-600 text-white',
  'bg-amber-600 text-white',
  'bg-slate-700 text-white',
];

export const getAvatarColor = (name?: string): string => {
  if (!name) return 'bg-slate-600 text-white';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_VARIANTS.length;
  return COLOR_VARIANTS[index];
};

export const getInitials = (name?: string): string => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm font-extrabold',
  lg: 'w-12 h-12 text-base font-extrabold',
  xl: 'w-16 h-16 text-xl font-black',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name = '',
  size = 'md',
  className = '',
  showStatus = false,
  isOnline = true,
}) => {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`relative shrink-0 inline-flex items-center justify-center uppercase select-none rounded-full shadow-2xs border border-white/20 font-sans tracking-wide ${sizeClass} ${colorClass} ${className}`}
      title={name}
    >
      {initials ? initials : <UserIcon className="w-1/2 h-1/2 text-white" />}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-white shadow-2xs ${
            size === 'xs' || size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'
          } ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}
        />
      )}
    </div>
  );
};
