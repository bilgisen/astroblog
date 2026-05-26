async function scrapeSimple() {
  const url = 'https://www.youtube.com/@paraanaliz827/videos';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // Let's search for "videoRenderer":{
    const parts = html.split('"videoRenderer":{');
    const videos = [];
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const idMatch = part.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      const titleMatch = part.match(/"title":\s*\{\s*"runs":\s*\[\s*\{\s*"text":\s*"([^"]+)"/);
      const lengthMatch = part.match(/"lengthText":\s*\{\s*"accessibility":\s*\{\s*"accessibilityData":\s*\{\s*"label":\s*"([^"]+)"/);
      const simpleLengthMatch = part.match(/"lengthText":\s*\{\s*"simpleText":\s*"([^"]+)"/);
      const publishedMatch = part.match(/"publishedTimeText":\s*\{\s*"simpleText":\s*"([^"]+)"/);
      
      if (idMatch && titleMatch) {
        const id = idMatch[1];
        let title = titleMatch[1];
        // Clean title unicode escapes like \u0026
        title = JSON.parse(`"${title.replace(/"/g, '\\"')}"`);
        const duration = simpleLengthMatch ? simpleLengthMatch[1] : (lengthMatch ? lengthMatch[1] : 'Video');
        const publishedAt = publishedMatch ? publishedMatch[1] : 'Yeni';
        
        videos.push({ id, title, duration, publishedAt });
      }
    }
    
    // Deduplicate
    const seen = new Set();
    const uniqueVideos = [];
    for (const v of videos) {
      if (!seen.has(v.id)) {
        seen.add(v.id);
        uniqueVideos.push(v);
      }
    }
    
    console.log(JSON.stringify(uniqueVideos.slice(0, 6), null, 2));
  } catch (e) {
    console.error(e);
  }
}

scrapeSimple();
