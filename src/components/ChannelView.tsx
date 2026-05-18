import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { VideoCard } from './VideoCard';

export const ChannelView = ({ channel, onVideoClick }: { channel: any, onVideoClick: (video: any) => void }) => {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    if (!channel?.id) return;
    
    const fetchVideos = async () => {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('ownerId', channel.id)
        .order('createdAt', { ascending: false });
        
      if (data) {
        setVideos(data.map((doc: any) => {
          let timeStr = 'Just now';
          if (doc.createdAt) {
            const secondsDiff = Math.floor((Date.now() - new Date(doc.createdAt).getTime()) / 1000);
            if (secondsDiff < 60) timeStr = `${secondsDiff} seconds ago`;
            else if (secondsDiff < 3600) timeStr = `${Math.floor(secondsDiff / 60)} minutes ago`;
            else if (secondsDiff < 86400) timeStr = `${Math.floor(secondsDiff / 3600)} hours ago`;
            else timeStr = `${Math.floor(secondsDiff / 86400)} days ago`;
          }

          return {
            id: doc.id,
            thumbnail: doc.thumbnail,
            videoUrl: doc.videoUrl,
            title: doc.title,
            channel: doc.channel,
            views: doc.views,
            time: timeStr,
          }
        }));
      }
    };
    
    fetchVideos();
  }, [channel?.id]);

  return (
    <div className="p-8 w-full max-w-7xl mx-auto text-white">
      <div className="flex items-center gap-6 mb-12 border-b border-[#333333] pb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
          {channel?.name?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{channel?.name}</h1>
          {channel?.description && <p className="text-gray-400">{channel.description}</p>}
          <p className="text-gray-400 mt-2 text-sm font-medium">{videos.length} videos</p>
        </div>
      </div>
      
      <h3 className="text-xl font-bold mb-6">Videos</h3>
      
      {videos.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          This channel hasn't uploaded any videos yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map(video => (
            <VideoCard key={video.id} {...video} views={`${video.views} views`} onClick={() => onVideoClick(video)} />
          ))}
        </div>
      )}
    </div>
  );
};
