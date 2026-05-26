

async function test() {
  const channelId = 'UCURPZbLYwqxOtqmkbMfhYOw';
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  console.log('Fetching:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const xml = await res.text();
    console.log('XML length:', xml.length);
    console.log('First 1000 chars of XML:', xml.slice(0, 1500));
    
    // Parse entries
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const matches = [...xml.matchAll(entryRegex)];
    console.log('Number of entries found:', matches.length);
    
    for (let i = 0; i < Math.min(matches.length, 3); i++) {
      const entryContent = matches[i][1];
      const videoIdMatch = entryContent.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = entryContent.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = entryContent.match(/<published>([^<]+)<\/published>/);
      console.log(`Entry ${i}:`);
      console.log('  videoId:', videoIdMatch ? videoIdMatch[1] : 'null');
      console.log('  title:', titleMatch ? titleMatch[1] : 'null');
      console.log('  published:', publishedMatch ? publishedMatch[1] : 'null');
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
