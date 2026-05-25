import React, { useState } from 'react';

interface VideoItem {
  id: string;
  title: string;
  duration: string;
  publishedAt: string;
}

const PARA_ANALIZ_VIDEOS: VideoItem[] = [
  { id: 'S9pP9qV1uFs', title: 'Sıcak Para Girişi ve Virman Kampanyası Detayları', duration: '14:20', publishedAt: '2 gün önce' },
  { id: 'F3P_MAsN1tA', title: 'Küresel Piyasalar ve Türkiye Ekonomisinde Yeni Yol Haritası', duration: '18:45', publishedAt: '5 gün önce' },
  { id: 'D-X1Uas_e6E', title: 'Döviz Girdisi ve Enflasyonla Mücadelede Kritik Adımlar', duration: '12:10', publishedAt: '1 hafta önce' },
  { id: 'vV1v2S8K1B8', title: 'Altın ve Borsa: Kazanç Kapısı mı, Yoksa Risk mi?', duration: '22:30', publishedAt: '2 hafta önce' },
];

const ATILLA_YESILADA_VIDEOS: VideoItem[] = [
  { id: 'T_S8X8tB2D0', title: 'Atilla Yeşilada: Yaz Ekonomisi ve Beklenen Sıcak Gelişmeler', duration: '15:15', publishedAt: '1 gün önce' },
  { id: 'A_D0v2G1P9s', title: 'Faiz Kararları Sonrası Döviz ve Altın Tahminleri', duration: '19:40', publishedAt: '4 gün önce' },
  { id: 'R_P2U5M1A3o', title: 'Borsada Yeni Rekorlar Mümkün mü? Yatırımcı Tavsiyeleri', duration: '16:50', publishedAt: '1 hafta önce' },
  { id: 'Y_L9tD2E5sA', title: 'Küresel Kriz Senaryoları ve Türkiye\'ye Muhtemel Etkileri', duration: '24:10', publishedAt: '2 hafta önce' },
];

export default function VideoWidget() {
  const [activeTab, setActiveTab] = useState<'para' | 'atilla'>('para');
  const videos = activeTab === 'para' ? PARA_ANALIZ_VIDEOS : ATILLA_YESILADA_VIDEOS;
  const [selectedVideo, setSelectedVideo] = useState<VideoItem>(videos[0]);

  // Update selected video if tab changes
  const handleTabChange = (tab: 'para' | 'atilla') => {
    setActiveTab(tab);
    setSelectedVideo(tab === 'para' ? PARA_ANALIZ_VIDEOS[0] : ATILLA_YESILADA_VIDEOS[0]);
  };

  return (
    <div className="video-widget">
      {/* Widget Header / Title */}
      <div className="widget-header">
        <h2 className="widget-title">ParaAnaliz TV & Ekonomi Gündemi</h2>
        <div className="channel-tabs">
          <button
            className={`tab-btn ${activeTab === 'para' ? 'active' : ''}`}
            onClick={() => handleTabChange('para')}
          >
            ParaAnaliz TV
          </button>
          <button
            className={`tab-btn ${activeTab === 'atilla' ? 'active' : ''}`}
            onClick={() => handleTabChange('atilla')}
          >
            Atilla Yeşilada
          </button>
        </div>
      </div>

      {/* Widget Body */}
      <div className="widget-grid">
        {/* Main Featured Video Player */}
        <div className="main-player">
          <div className="iframe-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=0&rel=0`}
              title={selectedVideo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          <div className="video-info">
            <span className="live-badge">ŞİMDİ OYNATILIYOR</span>
            <h3 className="video-title">{selectedVideo.title}</h3>
            <div className="video-meta">
              <span>{selectedVideo.publishedAt}</span>
              <span className="bullet">•</span>
              <span>{selectedVideo.duration}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Playlist */}
        <div className="playlist">
          <div className="playlist-title">Oynatma Listesi</div>
          <div className="playlist-items scrollable-content">
            {videos.map((video) => {
              const isActive = video.id === selectedVideo.id;
              return (
                <button
                  key={video.id}
                  className={`playlist-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className="thumb-wrapper">
                    <img
                      src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                      alt={video.title}
                      loading="lazy"
                    />
                    <span className="duration">{video.duration}</span>
                    {isActive && (
                      <div className="playing-overlay">
                        <div className="playing-bars">
                          <span className="bar"></span>
                          <span className="bar"></span>
                          <span className="bar"></span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="item-info">
                    <p className="item-title">{video.title}</p>
                    <span className="item-date">{video.publishedAt}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <a
            href={
              activeTab === 'para'
                ? 'https://www.youtube.com/channel/UCURPZbLYwqxOtqmkbMfhYOw'
                : 'https://www.youtube.com/@AT%C4%B0LLAYE%C5%9E%C4%B0LADA'
            }
            target="_blank"
            rel="noopener noreferrer"
            className="view-channel-btn"
          >
            Tüm Videoları Gör
          </a>
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
          overflow: hidden;
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 1rem;
          flex-wrap: wrap;
        }

        .widget-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--foreground);
          margin: 0;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .channel-tabs {
          display: flex;
          background: var(--muted);
          padding: 0.25rem;
          border-radius: 10px;
          gap: 0.25rem;
        }

        .tab-btn {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--muted-foreground);
          padding: 0.4rem 0.85rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-btn:hover {
          color: var(--foreground);
        }

        .tab-btn.active {
          background: var(--card);
          color: var(--primary);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .widget-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.25rem;
        }

        .main-player {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .iframe-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        }

        .iframe-wrapper iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .video-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .live-badge {
          align-self: flex-start;
          font-size: 0.65rem;
          font-weight: 800;
          color: #fff;
          background: #ef4444;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          letter-spacing: 0.05em;
          animation: pulse 2s infinite;
        }

        .video-info .video-title {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.3;
          color: var(--foreground);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .video-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--muted-foreground);
          font-weight: 500;
        }

        .bullet {
          color: var(--border);
        }

        .playlist {
          display: flex;
          flex-direction: column;
          background: var(--muted);
          border-radius: 12px;
          padding: 1rem;
          border: 1px solid var(--border);
        }

        .playlist-title {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--foreground);
          text-transform: uppercase;
          margin-bottom: 0.75rem;
          letter-spacing: 0.05em;
        }

        .playlist-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 250px;
          overflow-y: auto;
          margin-bottom: 1rem;
          padding-right: 0.25rem;
        }

        /* Custom elegant scrollbar */
        .scrollable-content::-webkit-scrollbar {
          width: 5px;
        }
        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollable-content::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background: var(--primary);
        }

        .playlist-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
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
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
        }

        .playlist-item.active .item-title {
          color: var(--primary);
        }

        .thumb-wrapper {
          position: relative;
          width: 80px;
          aspect-ratio: 16 / 9;
          border-radius: 6px;
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
        }

        .thumb-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .playlist-item:hover .thumb-wrapper img {
          transform: scale(1.05);
        }

        .playlist-item .duration {
          position: absolute;
          bottom: 2px;
          right: 2px;
          background: rgba(0, 0, 0, 0.8);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 1px 3px;
          border-radius: 3px;
        }

        .playing-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .playing-bars {
          display: flex;
          align-items: flex-end;
          gap: 2px;
          height: 12px;
        }

        .playing-bars .bar {
          width: 2px;
          background: var(--primary);
          border-radius: 1px;
          animation: bounce-bar 0.8s infinite alternate;
        }

        .playing-bars .bar:nth-child(2) {
          animation-delay: 0.2s;
        }

        .playing-bars .bar:nth-child(3) {
          animation-delay: 0.4s;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .item-title {
          font-size: 0.8rem;
          font-weight: 700;
          line-height: 1.35;
          color: var(--foreground);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-date {
          font-size: 0.7rem;
          color: var(--muted-foreground);
          font-weight: 500;
        }

        .view-channel-btn {
          display: block;
          text-align: center;
          background: var(--card);
          border: 1px solid var(--border);
          color: var(--foreground);
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.5rem;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.2s ease;
          margin-top: auto;
        }

        .view-channel-btn:hover {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          opacity: 1;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes bounce-bar {
          0% { height: 3px; }
          100% { height: 12px; }
        }

        @media (max-width: 768px) {
          .video-widget {
            padding: 1rem;
            margin: 1.5rem 0;
          }

          .widget-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .widget-grid {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }

          .playlist-items {
            max-height: 240px;
          }
        }
      `}</style>
    </div>
  );
}
