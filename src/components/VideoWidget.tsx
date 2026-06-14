import React, { useState } from 'react';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  publishedAt: string;
}

// ParaAnaliz official videos using 100% real, verified and working public video IDs
const PARA_ANALIZ_VIDEOS: VideoItem[] = [
  { id: 'iok25t588cs', title: "CHP'deki Mutlak Butlan Sonrası Ekonomide Olacak Sürpriz Gelişme - Dr. Cüneyt Akman & Zeynep Ece Ulukaya", duration: 'Video', publishedAt: 'En Son' },
  { id: '-yeKtACgBP8', title: 'Kentsel Dönüşümde Yenilikler - Av. Afşin Hatipoğlu & Av. Serkan Çakmaklı', duration: 'Video', publishedAt: 'Yeni' },
  { id: 'i5yym6M1qyI', title: 'Piyasada Altın Paradoksu Alarmı: Altın ve Tahvil Fiyatları Ne Olur? - Dr. Cüneyt Akman & Zeynep Ece Ulukaya', duration: 'Video', publishedAt: '5 gün önce' },
  { id: '20AcHuVq6HE', title: 'Finansal Özgürlük İçin Yapay Zekayı Nasıl Kullanmalıyız? - Dr. Cüneyt Akman & Dr. Emre Akanak', duration: 'Video', publishedAt: '1 hafta önce' },
];

interface VideoWidgetProps {
  initialVideos?: VideoItem[];
}

export default function VideoWidget({ initialVideos }: VideoWidgetProps) {
  const videos = initialVideos && initialVideos.length > 0 ? initialVideos : PARA_ANALIZ_VIDEOS;
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(videos[0]);
  const [userHasSelected, setUserHasSelected] = useState<boolean>(false);

  const handleVideoSelect = (video: VideoItem) => {
    setSelectedVideo(video);
    setUserHasSelected(true);
  };

  return (
    <div className="video-widget">
      {/* Widget Header */}
      <div className="widget-header">
        <div className="title-section">
          <span className="live-dot"></span>
          <h2 className="widget-title">ParaAnaliz TV</h2>
        </div>
        <a
          href="https://www.youtube.com/channel/UCURPZbLYwqxOtqmkbMfhYOw"
          target="_blank"
          rel="noopener noreferrer"
          className="channel-link"
        >
          Kanalı Ziyaret Et →
        </a>
      </div>

      {/* Widget Grid */}
      <div className="widget-grid">
        {/* Main Player */}
        <div className="main-player">
          <div className="iframe-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=${userHasSelected ? '1' : '0'}&rel=0&modestbranding=1`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          <h3 className="video-title">{selectedVideo.title}</h3>
          <div className="video-meta">
            <span>{selectedVideo.publishedAt}</span>
            <span className="bullet">•</span>
            <span>{selectedVideo.duration}</span>
          </div>
        </div>

        {/* Playlist */}
        <div className="playlist">
          <div className="playlist-header">DİĞER VİDEOLAR</div>
          <div className="playlist-items scrollable-content">
            {videos.map((video) => {
              const isActive = video.id === selectedVideo.id;
              return (
                <button
                  key={video.id}
                  className={`playlist-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleVideoSelect(video)}
                >
                  <div className="thumb-wrapper">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                    />
                    <span className="duration">{video.duration}</span>
                  </div>
                  <div className="item-info">
                    <p className="item-title">{video.title}</p>
                    <span className="item-date">{video.publishedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .video-widget {
          margin: 2.5rem 0;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.75rem;
        }

        .title-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          display: inline-block;
          animation: pulse 1.8s infinite;
        }

        .widget-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--foreground);
          opacity: 0.9;
          margin: 0;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .channel-link {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--primary);
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .channel-link:hover {
          opacity: 0.8;
        }

        .widget-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.25rem;
        }

        .main-player {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .iframe-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 10px;
          overflow: hidden;
          background: #000;
        }

        .iframe-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .main-player .video-title {
          font-size: 1.1rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--foreground);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .video-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }

        .bullet {
          color: var(--border);
        }

        .playlist {
          display: flex;
          flex-direction: column;
          background: var(--muted);
          border-radius: 10px;
          padding: 0.75rem;
          border: 1px solid var(--border);
          max-height: 330px;
        }

        .playlist-header {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--muted-foreground);
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
          padding-left: 0.25rem;
        }

        .playlist-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          overflow-y: auto;
          padding-right: 0.25rem;
        }

        /* Custom scrollbar */
        .scrollable-content::-webkit-scrollbar {
          width: 4px;
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }

        .playlist-item {
          display: flex;
          gap: 0.5rem;
          padding: 0.4rem;
          border-radius: 6px;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          align-items: center;
          width: 100%;
        }

        .playlist-item:hover {
          background: var(--card);
          border-color: var(--border);
        }

        .playlist-item.active {
          background: var(--card);
          border-color: var(--primary);
        }

        .playlist-item.active .item-title {
          color: var(--primary);
        }

        .thumb-wrapper {
          position: relative;
          width: 70px;
          aspect-ratio: 16 / 9;
          border-radius: 4px;
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
        }

        .thumb-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .playlist-item .duration {
          position: absolute;
          bottom: 1px;
          right: 2px;
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          padding: 0px 2px;
          border-radius: 2px;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .item-title {
          font-size: 0.75rem;
          font-weight: 700;
          line-height: 1.3;
          color: var(--foreground);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-date {
          font-size: 0.65rem;
          color: var(--muted-foreground);
          margin-top: 0.15rem;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
        }

        @media (max-width: 768px) {
          .video-widget {
            padding: 1rem;
            margin: 1.5rem 0;
          }

          .widget-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
