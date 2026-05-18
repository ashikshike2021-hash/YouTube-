import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Share2, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { VideoCard } from './VideoCard';

export const WatchView = ({ video, user, onClose, relatedVideos = [], onVideoClick }: { video: any, user: any, onClose?: () => void, relatedVideos?: any[], onVideoClick?: (video: any) => void }) => {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    if (!video?.id || video.id.startsWith('mock')) return;

    let isViewCounted = false;
    const viewTimer = setTimeout(async () => {
      if (isViewCounted) return;
      isViewCounted = true;
      // Optimistically increment views (may fail if RLS prevents it without RPC, but we'll try)
      if (typeof video.views === 'number') {
        await supabase.from('videos').update({ views: video.views + 1 }).eq('id', video.id);
      }
    }, 5000); // count as a view after 5 seconds

    return () => clearTimeout(viewTimer);
  }, [video?.id]);

  useEffect(() => {
    if (!video?.id || video.id.startsWith('mock')) return;

    const fetchInteractions = async () => {
      // Fetch comments
      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('video_id', video.id)
        .order('created_at', { ascending: false });
      
      if (commentsData) setComments(commentsData);

      // Fetch likes count
      const { count: likes } = await supabase
        .from('video_likes')
        .select('*', { count: 'exact', head: true })
        .eq('video_id', video.id)
        .eq('type', 'like');
      
      if (likes !== null) setLikesCount(likes);

      // Check if user liked
      if (user) {
        const { data: myLike } = await supabase
          .from('video_likes')
          .select('*')
          .eq('video_id', video.id)
          .eq('user_id', user.id)
          .single();
        
        if (myLike && myLike.type === 'like') {
          setHasLiked(true);
        }
      }
    };

    fetchInteractions();
  }, [video?.id, user]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !video?.id) return;
    
    const newCommentObj = {
      video_id: video.id,
      user_id: user.id,
      user_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Anonymous',
      text: newComment,
    };

    const { data, error } = await supabase.from('comments').insert([newCommentObj]).select();
    if (!error && data) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
  };

  const handleToggleLike = async () => {
    if (!user || !video?.id || video.id.startsWith('mock')) return;

    if (hasLiked) {
      await supabase.from('video_likes').delete().eq('video_id', video.id).eq('user_id', user.id);
      setHasLiked(false);
      setLikesCount(p => Math.max(0, p - 1));
    } else {
      await supabase.from('video_likes').upsert({ video_id: video.id, user_id: user.id, type: 'like' });
      setHasLiked(true);
      setLikesCount(p => p + 1);
    }
  };

  return (
  <div className="flex flex-col lg:flex-row gap-8 p-4 max-w-7xl mx-auto relative">
    <div className="flex-[2.5]">
      {onClose && (
        <button 
          onClick={onClose}
          className="mb-4 inline-flex items-center gap-2 p-2 bg-[#1a1a1a] hover:bg-[#333333] rounded-full transition-colors text-white"
        >
          <ArrowLeft size={20} />
          <span className="font-medium text-sm pr-2">Back</span>
        </button>
      )}
      <div className="aspect-video bg-black rounded-3xl overflow-hidden relative shadow-lg">
        <video 
          src={video?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          controls 
          autoPlay 
          className="w-full h-full object-contain"
          poster={video?.thumbnail || 'https://picsum.photos/seed/1/1280/720'}
        />
      </div>
      
      <h1 className="text-[22px] font-bold mt-5 text-white leading-tight">{video?.title || 'Video Title Here'}</h1>
      
      <div className="flex flex-wrap items-center gap-4 mt-3 pb-6 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold tracking-widest text-lg shadow-md cursor-pointer hover:opacity-80">
            {video?.channel?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div className="cursor-pointer hover:underline">
            <h3 className="font-bold text-[15px] text-white">{video?.channel || 'Channel Name'}</h3>
            <p className="text-[13px] text-gray-400">Subscribers</p>
          </div>
        </div>
        
        <button className="bg-white text-black hover:bg-gray-200 px-5 py-2.5 rounded-full font-semibold ml-2 transition-colors duration-200 shadow-sm text-[14px]">
          Subscribe
        </button>
        
        <div className="flex items-center gap-2 ml-auto text-white">
          <div className="flex bg-[#1a1a1a] rounded-full items-center">
            <button onClick={handleToggleLike} className={`flex items-center gap-2 px-4 py-2 hover:bg-[#333333] rounded-l-full transition-colors text-[14px] font-medium border-r border-[#333333] ${hasLiked ? 'text-blue-400' : ''}`}>
              <ThumbsUp size={18} fill={hasLiked ? 'currentColor' : 'none'} />
              {likesCount > 0 ? likesCount : 'Like'}
            </button>
            <button className="px-4 py-2 hover:bg-[#333333] rounded-r-full transition-colors">
              <ThumbsDown size={18} />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#333333] px-4 py-2 rounded-full transition-colors text-[14px] font-medium">
            <Share2 size={18} /> Share
          </button>
          <button className="bg-[#1a1a1a] hover:bg-[#333333] p-2.5 rounded-full transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
      
      <div className="bg-[#1a1a1a] rounded-2xl p-4 mt-6 text-[14px] text-white">
        <p className="font-semibold mb-1">{video?.views || 0} views</p>
      </div>

      <div className="mt-8 text-white">
        <h3 className="text-xl font-bold mb-4">{comments.length} Comments</h3>
        
        {user ? (
          <form className="flex gap-4 mb-8" onSubmit={handlePostComment}>
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="w-full border-b border-[#333333] focus:border-white outline-none py-1 bg-transparent text-white"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              {newComment && (
                <div className="flex justify-end gap-2 mt-2">
                  <button type="button" onClick={() => setNewComment('')} className="px-4 py-2 hover:bg-gray-800 rounded-full font-medium">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-full font-medium">Comment</button>
                </div>
              )}
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-400 mb-8">Sign in to add a comment.</p>
        )}

        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-800 text-gray-300 flex items-center justify-center font-bold shrink-0 uppercase">
                {(comment.user_name || 'U').charAt(0)}
              </div>
              <div>
                <p className="text-[13px] font-semibold mb-1">
                  {comment.user_name} <span className="text-gray-400 font-normal ml-1">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </p>
                <p className="text-[14px] text-gray-200">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="flex-1 flex flex-col gap-4 mt-8 lg:mt-0 text-white">
      <h3 className="font-bold text-lg mb-2">Related Videos</h3>
      <div className="flex flex-col gap-4">
        {relatedVideos.filter(v => v.id !== video?.id).map((v) => (
          <VideoCard
            key={v.id}
            thumbnail={v.thumbnail}
            videoUrl={v.videoUrl}
            title={v.title}
            channel={v.channel}
            views={`${v.views} views`}
            time={v.time}
            onClick={() => onVideoClick && onVideoClick(v)}
          />
        ))}
      </div>
    </div>
  </div>
  );
};
