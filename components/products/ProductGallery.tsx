"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, ChevronLeft, ChevronRight, X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string | null;
  title: string;
}

export function ProductGallery({ images, videoUrl, title }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const hasMedia = images.length > 0 || videoUrl;
  const totalMedia = images.length + (videoUrl ? 1 : 0);

  if (!hasMedia) {
    return (
      <div className="aspect-square w-full bg-muted rounded-xl flex items-center justify-center">
        <span className="text-6xl"></span>
      </div>
    );
  }

  const handleNext = () => setSelectedIndex((prev) => (prev + 1) % totalMedia);
  const handlePrev = () => setSelectedIndex((prev) => (prev - 1 + totalMedia) % totalMedia);

  const isVideoSelected = videoUrl && selectedIndex === 0;
  const currentImage = !isVideoSelected ? images[videoUrl ? selectedIndex - 1 : selectedIndex] : null;

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square w-full bg-muted rounded-xl overflow-hidden group">
        {isVideoSelected ? (
          <div 
            className="absolute inset-0 bg-black flex items-center justify-center cursor-pointer"
            onClick={() => setShowVideoModal(true)}
          >
            <video src={videoUrl!} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <Play className="w-16 h-16 text-white fill-white" />
            </div>
          </div>
        ) : currentImage ? (
          <Image
            src={currentImage}
            alt={`${title} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
        ) : null}

        {/* Navigation Arrows */}
        {totalMedia > 1 && (
          <>
            <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {totalMedia > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {videoUrl && (
            <button
              onClick={() => setSelectedIndex(0)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${selectedIndex === 0 ? 'border-primary' : 'border-transparent'}`}
            >
              <video src={videoUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </button>
          )}
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(videoUrl ? idx + 1 : idx)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                (videoUrl ? selectedIndex === idx + 1 : selectedIndex === idx) ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Video Modal */}
      {showVideoModal && videoUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setShowVideoModal(false)}>
          <button className="absolute top-4 right-4 text-white">
            <X className="w-8 h-8" />
          </button>
          <video src={videoUrl} controls autoPlay className="max-w-4xl max-h-[80vh] w-full" />
        </div>
      )}
    </div>
  );
}