import React, { useState, useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { db, auth, storage } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { handleFirestoreError, OperationType } from '../lib/error';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !auth.currentUser || !videoFile) return;
    
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `videos/${auth.currentUser.uid}/${Date.now()}_${videoFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        }, 
        (error) => {
          console.error("Upload failed", error);
          setIsUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, 'videos'), {
            title,
            thumbnail: thumbnailPreview || 'https://picsum.photos/seed/999/320/180',
            videoUrl: downloadURL,
            channel: auth.currentUser?.displayName || 'You',
            views: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            ownerId: auth.currentUser?.uid
          });
          setTitle('');
          setThumbnailPreview(null);
          setVideoFile(null);
          setProgress(0);
          setIsUploading(false);
          onClose();
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'videos');
      setIsUploading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Upload Video</h2>
          <button onClick={onClose} disabled={isUploading} className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
          <div className="flex flex-col gap-6">
            <input 
              type="file" 
              accept="video/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoFile(file);
                  if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
                }
              }}
            />
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UploadCloud size={32} className="text-gray-500" />
              </div>
              <p className="text-lg font-medium mb-1">{videoFile ? videoFile.name : 'Select video files to upload'}</p>
              <p className="text-sm text-gray-500 mb-4">Your videos will be private until you publish them.</p>
              {!videoFile && <button type="button" className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium">SELECT FILES</button>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (required)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title that describes your video" 
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden" 
                  id="thumbnail-upload"
                />
                <label 
                  htmlFor="thumbnail-upload"
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 cursor-pointer text-sm"
                >
                  Upload image
                </label>
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="h-16 rounded object-cover" />
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3 pt-4 border-t items-center">
            {isUploading && (
              <div className="flex-1 mr-4">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{Math.round(progress)}% uploaded</p>
              </div>
            )}
            <button type="button" onClick={onClose} disabled={isUploading} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-md disabled:opacity-50">Cancel</button>
            <button 
              type="submit" 
              className={`px-4 py-2 text-sm font-medium rounded-md text-white ${title && videoFile && !isUploading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
              disabled={!title || !videoFile || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
