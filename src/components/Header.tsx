import React from 'react';
import { Menu, Video, User, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onUploadClick: () => void;
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onHomeClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick, user, onSignIn, onSignOut, onHomeClick, searchQuery = '', onSearchChange }) => (
  <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-black border-b border-[#333333]">
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-gray-800 rounded-full text-white">
        <Menu size={24} />
      </button>
      <div className="font-bold text-xl flex items-center gap-1 cursor-pointer tracking-tight" onClick={onHomeClick}>
        <div className="bg-red-600 text-white p-1 rounded-lg mr-1 text-[10px] leading-3 flex items-center justify-center w-6 h-6">▶</div>
        YouTube
      </div>
    </div>
    <div className="flex-1 max-w-2xl px-4 flex justify-center">
      <div className="w-full max-w-[600px] flex items-center bg-[#121212] rounded-full px-4 py-2 border border-[#333333] focus-within:border-blue-500 focus-within:bg-black transition-colors">
        <input 
          type="text" 
          placeholder="Search" 
          value={searchQuery}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          className="w-full bg-transparent focus:outline-none text-sm placeholder-gray-400 text-white" 
        />
      </div>
    </div>
    <div className="flex items-center gap-4 text-white">
      <button onClick={onUploadClick} className="p-2 hover:bg-gray-800 rounded-full" title="Upload Video"><Video size={24} /></button>
      {user ? (
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
          ) : (
            <button className="p-2 hover:bg-gray-800 rounded-full"><User size={24} /></button>
          )}
          <button onClick={onSignOut} className="p-2 hover:bg-gray-800 rounded-full" title="Sign out"><LogOut size={20} /></button>
        </div>
      ) : (
        <button 
          onClick={onSignIn}
          className="flex items-center gap-2 border border-[#333333] hover:bg-gray-800 text-blue-500 px-3 py-1.5 rounded-full font-medium"
        >
          <User size={20} />
          Sign in
        </button>
      )}
    </div>
  </header>
);
