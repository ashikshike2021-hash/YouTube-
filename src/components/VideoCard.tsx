import React from 'react';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  time: string;
  onClick: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ thumbnail, title, channel, views, time, onClick }) => (
  <div className="flex flex-col gap-2 cursor-pointer" onClick={onClick}>
    <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
      <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="flex gap-2">
      <div className="w-9 h-9 rounded-full bg-gray-300 shrink-0"></div>
      <div>
        <h3 className="font-semibold text-sm line-clamp-2">{title}</h3>
        <p className="text-xs text-gray-500">{channel}</p>
        <p className="text-xs text-gray-500">{views} · {time}</p>
      </div>
    </div>
  </div>
);
