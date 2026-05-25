export interface VideoItem {
  id: string;
  title: string;
  duration: string;
  publishedAt: string;
}

export async function fetchParaAnalizVideos(): Promise<VideoItem[]> {
  const channelId = 'UCURPZbLYwqxOtqmkbMfhYOw';
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 seconds timeout to keep SSR fast
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    
    // Parse the XML using robust regex matching
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const matches = [...xmlText.matchAll(entryRegex)];
    
    const videos: VideoItem[] = [];
    
    for (const match of matches) {
      const entryContent = match[1];
      
      const videoIdMatch = entryContent.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entryContent.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = entryContent.match(/<published>([^<]+)<\/published>/);
      
      if (videoIdMatch && titleMatch) {
        const id = videoIdMatch[1].trim();
        let title = titleMatch[1].trim();
        
        // Decode HTML entities in title
        title = title
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/&apos;/g, "'");
          
        const publishedStr = publishedMatch ? publishedMatch[1].trim() : '';
        let publishedAt = 'Yeni';
        
        if (publishedStr) {
          const pubDate = new Date(publishedStr);
          const diffMs = Date.now() - pubDate.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 0) {
            publishedAt = 'Bugün';
          } else if (diffDays === 1) {
            publishedAt = 'Dün';
          } else if (diffDays < 7) {
            publishedAt = `${diffDays} gün önce`;
          } else {
            const weeks = Math.floor(diffDays / 7);
            publishedAt = `${weeks} hafta önce`;
          }
        }
        
        videos.push({
          id,
          title,
          duration: 'Video',
          publishedAt,
        });
      }
    }
    
    return videos;
  } catch (error) {
    console.error('Error fetching/parsing YouTube feed:', error);
    return [];
  }
}
