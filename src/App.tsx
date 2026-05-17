/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VideoCard } from './components/VideoCard';
import { WatchView } from './components/WatchView';
import { UploadModal } from './components/UploadModal';
import { AuthModal } from './components/AuthModal';
import { CreateChannelModal } from './components/CreateChannelModal';
import { ChannelView } from './components/ChannelView';
import { supabase } from './lib/supabase';

interface VideoData {
  id: string;
  thumbnail: string;
  videoUrl?: string;
  title: string;
  channel: string;
  views: number;
  time: string; // we'll format createdAt into a string locally
}

export default function App() {
  const [view, setView] = useState<'home' | 'watch' | 'channel'>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userChannel, setUserChannel] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [videos, setVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('createdAt', { ascending: false });

      if (!error && data) {
        const vids: VideoData[] = data.map((doc: any) => {
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
          };
        });

        setVideos(vids);
      } else {
        setVideos([]);
      }
    };
    
    fetchVideos();

    const videoSubscription = supabase.channel('public:videos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, payload => {
        fetchVideos();
      })
      .subscribe();

    return () => {
      subscription?.unsubscribe();
      supabase.removeChannel(videoSubscription);
    };
  }, []);

  useEffect(() => {
    if (user) {
      supabase.from('channels').select('*').eq('id', user.id).single().then(({ data }) => {
        setUserChannel(data);
      });
    } else {
      setUserChannel(null);
    }
  }, [user]);

  const handleSignIn = async () => {
    setIsAuthModalOpen(true);
  };
  const handleMyChannelClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    if (userChannel) {
      setView('channel');
    } else {
      setIsCreateChannelOpen(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onUploadClick={() => {
          if (!user) {
            handleSignIn();
          } else {
            setIsUploadModalOpen(true);
          }
        }} 
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onHomeClick={() => setView('home')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          {view === 'home' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()) || v.channel.toLowerCase().includes(searchQuery.toLowerCase())).map((video) => (
                  <VideoCard 
                    key={video.id}
                    thumbnail={video.thumbnail}
                    videoUrl={video.videoUrl}
                    title={video.title}
                    channel={video.channel}
                    views={`${video.views} views`}
                    time={video.time}
                    onClick={() => {
                      setView('watch');
                      setSelectedVideo(video);
                    }}
                  />
                ))}
              </div>
            </>
          ) : view === 'channel' ? (
            <ChannelView 
              channel={userChannel} 
              onVideoClick={(video) => {
                setSelectedVideo(video);
                setView('watch');
              }} 
            />
          ) : (
            <WatchView 
              video={videos.find(v => v.id === selectedVideo?.id) || selectedVideo} 
              user={user} 
              onClose={() => setView('home')} 
              relatedVideos={videos}
              onVideoClick={(video) => setSelectedVideo(video)}
            />
          )}
        </main>
      </div>
      {user && (
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
          userChannel={userChannel}
        />
      )}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
      <CreateChannelModal
        isOpen={isCreateChannelOpen}
        onClose={() => setIsCreateChannelOpen(false)}
        user={user}
        onChannelCreated={(channel) => {
          setUserChannel(channel);
          setView('channel');
        }}
      />
    </div>
  );
}

