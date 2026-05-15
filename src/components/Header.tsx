import React from 'react';
import { Menu, Video, Bell, User, LogOut } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  onUploadClick: () => void;
  user?: FirebaseUser | null;
  onSignIn?: () => void;
  onSignOut?: () => void;
  onHomeClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadClick, user, onSignIn, onSignOut, onHomeClick }) => (
  <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-white">
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-gray-100 rounded-full">
        <Menu size={24} />
      </button>
      <div className="font-bold text-xl flex items-center gap-1 cursor-pointer" onClick={onHomeClick}>
        <div className="bg-red-600 text-white p-1 rounded-lg">▶</div>
        YouTube
      </div>
    </div>
    <div className="flex-1 max-w-2xl px-4">
      <input type="text" placeholder="Search" className="w-full px-4 py-2 border border-blue-300 rounded-full focus:outline-none focus:border-blue-500" />
    </div>
    <div className="flex items-center gap-4">
      <button onClick={onUploadClick} className="p-2 hover:bg-gray-100 rounded-full" title="Upload Video"><Video size={24} /></button>
      <button className="p-2 hover:bg-gray-100 rounded-full"><Bell size={24} /></button>
      {user ? (
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
          ) : (
            <button className="p-2 hover:bg-gray-100 rounded-full"><User size={24} /></button>
          )}
          <button onClick={onSignOut} className="p-2 hover:bg-gray-100 rounded-full" title="Sign out"><LogOut size={20} /></button>
        </div>
      ) : (
        <button 
          onClick={onSignIn}
          className="flex items-center gap-2 border border-gray-300 hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium"
        >
          <User size={20} />
          Sign in
        </button>
      )}
    </div>
  </header>
);
