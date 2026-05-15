export const WatchView = ({ video }: { video: any }) => (
  <div className="flex flex-col lg:flex-row gap-6 p-4">
    <div className="flex-1">
      <div className="aspect-video bg-black rounded-xl overflow-hidden relative">
        <video 
          src={video?.videoUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
          controls 
          autoPlay 
          className="w-full h-full object-contain"
          poster={video?.thumbnail || 'https://picsum.photos/seed/1/1280/720'}
        />
      </div>
      <h1 className="text-xl font-bold mt-4">{video?.title || 'Video Title Here'}</h1>
      <div className="flex items-center gap-4 mt-2">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-600 text-white font-bold text-lg">
          {video?.channel?.charAt(0)?.toUpperCase() || 'C'}
        </div>
        <div>
          <h3 className="font-semibold">{video?.channel || 'Channel Name'}</h3>
          <p className="text-sm text-gray-500">1M subscribers</p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-full font-medium ml-auto">Subscribe</button>
      </div>
    </div>
    <div className="lg:w-96 flex flex-col gap-4">
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
      <div className="h-24 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);
