import React, { useState, useEffect } from 'react';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  channel: string;
  views: string | number;
  time: string;
  duration?: string;
  videoUrl?: string;
  onClick: () => void;
}

const getDurationBasedOnTitle = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const mins = Math.max(1, Math.abs(hash) % 25);
  const secs = Math.abs(hash) % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const VideoCard: React.FC<VideoCardProps> = ({ thumbnail, title, channel, views, time, duration, videoUrl, onClick }) => {
  const [realDuration, setRealDuration] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUrl) return;
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const durationSeconds = video.duration;
      if (durationSeconds && !isNaN(durationSeconds) && durationSeconds !== Infinity) {
        const mins = Math.floor(durationSeconds / 60);
        const secs = Math.floor(durationSeconds % 60);
        setRealDuration(`${mins}:${secs.toString().padStart(2, '0')}`);
      }
    };
    video.src = videoUrl;
    
    return () => {
      video.removeAttribute('src');
      video.load();
    };
  }, [videoUrl]);

  return (
    <div className="flex flex-col gap-3 cursor-pointer group" onClick={onClick}>
      <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden relative border border-gray-100">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {realDuration || duration || getDurationBasedOnTitle(title)}
        </div>
      </div>
      <div className="flex gap-3 px-1">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 shrink-0 flex items-center justify-center text-gray-500 font-bold uppercase text-lg border border-gray-200 shadow-sm mt-1">
          {channel.charAt(0)}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-[15px] leading-tight line-clamp-2 text-gray-900 group-hover:text-red-600 transition-colors">{title}</h3>
          <p className="text-[13px] text-gray-500 mt-1 font-medium">{channel}</p>
          <p className="text-[13px] text-gray-500 font-medium">{views} · {time}</p>
        </div>
      </div>
    </div>
  );
};
