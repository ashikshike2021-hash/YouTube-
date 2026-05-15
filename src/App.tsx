/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoCard } from './components/VideoCard';
import { FilterBar } from './components/FilterBar';
import { WatchView } from './components/WatchView';
import { UploadModal } from './components/UploadModal';
import { db, auth, signIn, logOut } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { handleFirestoreError, OperationType } from './lib/error';

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
  const [view, setView] = useState<'home' | 'watch'>('home');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  const [videos, setVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const valQuery = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubVideos = onSnapshot(valQuery, (snapshot) => {
      const vids: VideoData[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        let timeStr = 'Just now';
        
        if (data.createdAt) {
          const secondsDiff = Math.floor((Date.now() - (data.createdAt?.toMillis ? data.createdAt.toMillis() : data.createdAt)) / 1000);
          if (secondsDiff < 60) timeStr = `${secondsDiff} seconds ago`;
          else if (secondsDiff < 3600) timeStr = `${Math.floor(secondsDiff / 60)} minutes ago`;
          else if (secondsDiff < 86400) timeStr = `${Math.floor(secondsDiff / 3600)} hours ago`;
          else timeStr = `${Math.floor(secondsDiff / 86400)} days ago`;
        }

        vids.push({
          id: doc.id,
          thumbnail: data.thumbnail,
          videoUrl: data.videoUrl,
          title: data.title,
          channel: data.channel,
          views: data.views,
          time: timeStr,
        });
      });
      if (vids.length === 0) {
        setVideos([
          {
            id: 'mock1',
            thumbnail: 'https://picsum.photos/seed/1/320/180',
            title: 'Sample Video - Big Buck Bunny',
            channel: 'Blender Foundation',
            views: 1000000,
            time: '10 years ago',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          {
            id: 'mock2',
            thumbnail: 'https://picsum.photos/seed/2/320/180',
            title: 'Elephant Dream',
            channel: 'Blender Foundation',
            views: 500000,
            time: '5 years ago',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
          },
          {
            id: 'mock3',
            thumbnail: 'https://picsum.photos/seed/3/320/180',
            title: 'For Bigger Blazes',
            channel: 'Google',
            views: 200000,
            time: '2 years ago',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'mock4',
            thumbnail: 'https://picsum.photos/seed/4/320/180',
            title: 'For Bigger Joyrides',
            channel: 'Google',
            views: 150000,
            time: '1 year ago',
            videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
          }
        ]);
      } else {
        setVideos(vids);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'videos');
    });

    return () => {
      unsubAuth();
      unsubVideos();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onUploadClick={() => {
          if (!user) {
            signIn();
          } else {
            setIsUploadModalOpen(true);
          }
        }} 
        user={user}
        onSignIn={signIn}
        onSignOut={logOut}
        onHomeClick={() => setView('home')}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onHomeClick={() => setView('home')} currentView={view} />
        <main className="flex-1 overflow-y-auto p-4">
          {view === 'home' ? (
            <>
              <FilterBar />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {videos.map((video) => (
                  <VideoCard 
                    key={video.id}
                    thumbnail={video.thumbnail}
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
          ) : (
            <WatchView video={selectedVideo} />
          )}
        </main>
      </div>
      {user && (
        <UploadModal 
          isOpen={isUploadModalOpen} 
          onClose={() => setIsUploadModalOpen(false)} 
        />
      )}
    </div>
  );
}

