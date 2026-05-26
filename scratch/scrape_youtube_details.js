async function scrapeChannelWithDetails() {
  const url = 'https://www.youtube.com/@paraanaliz827/videos';
  console.log('Fetching YouTube channel videos page with details:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    
    // Find the ytInitialData JSON object which contains the detailed list of videos
    const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});\s*<\/script>/);
    if (!match) {
      console.log('Could not find ytInitialData in HTML');
      return;
    }
    
    const ytInitialData = JSON.parse(match[1]);
    
    // Drill down into the JSON structure of a channel's videos tab
    // ytInitialData.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content.richGridRenderer.contents
    const tabs = ytInitialData?.contents?.twoColumnBrowseResultsRenderer?.tabs;
    if (!tabs) {
      console.log('Tabs not found in ytInitialData');
      return;
    }
    
    // Find the videos tab (usually tab with richGridRenderer or tabRenderer containing content)
    let richGrid = null;
    for (const tab of tabs) {
      const grid = tab?.tabRenderer?.content?.richGridRenderer;
      if (grid) {
        richGrid = grid;
        break;
      }
    }
    
    if (!richGrid) {
      console.log('Rich grid not found in tabs');
      return;
    }
    
    const contents = richGrid.contents || [];
    const videos = [];
    
    for (const content of contents) {
      const item = content?.richItemRenderer?.content?.videoRenderer;
      if (!item) continue;
      
      const id = item.videoId;
      const title = item.title?.runs?.[0]?.text || item.title?.accessibility?.accessibilityData?.label;
      const publishedAt = item.publishedTimeText?.simpleText || 'Yeni';
      const duration = item.lengthText?.simpleText || 'Video';
      
      if (id && title) {
        videos.push({
          id,
          title: title.trim(),
          duration,
          publishedAt: publishedAt.trim()
        });
      }
    }
    
    console.log('Parsed Videos:');
    console.log(JSON.stringify(videos.slice(0, 6), null, 2));
  } catch (e) {
    console.error('Error:', e);
  }
}

scrapeChannelWithDetails();
