async function scrapeChannel() {
  const url = 'https://www.youtube.com/@paraanaliz827/videos';
  console.log('Fetching YouTube channel videos page:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    const html = await res.text();
    console.log('HTML loaded. Length:', html.length);
    
    // Look for videoId inside ytInitialData or the HTML body
    // Typical format in JSON: "videoId":"iok25t588cs" or "/watch?v=iok25t588cs"
    const videoIdRegex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const matches = [...html.matchAll(videoIdRegex)];
    const uniqueIds = [...new Set(matches.map(m => m[1]))];
    
    console.log('Extracted unique videoId list:', uniqueIds);
    
    // Let's also extract titles
    // In YouTube page source, titles are often located near the videoId.
    // Let's print the first 5 video IDs
    const finalVideos = uniqueIds.slice(0, 8);
    console.log('Top 8 video IDs:', finalVideos);
  } catch (e) {
    console.error('Error:', e);
  }
}

scrapeChannel();
