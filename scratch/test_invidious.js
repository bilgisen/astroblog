import fetch from 'node-fetch'; // wait, we don't need node-fetch because we have global fetch in Node 22

async function test() {
  const channelId = 'UCURPZbLYwqxOtqmkbMfhYOw';
  const url = `https://yewtu.be/feed/channel/${channelId}`;
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const xml = await res.text();
    console.log('XML length:', xml.length);
    console.log('First 1000 chars of XML:', xml.slice(0, 1000));
    
    // Parse entries
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    const matches = [...xml.matchAll(entryRegex)];
    console.log('Number of entries found:', matches.length);
    
    for (let i = 0; i < Math.min(matches.length, 3); i++) {
      const entryContent = matches[i][1];
      const videoIdMatch = entryContent.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || entryContent.match(/<link[^>]*href="[^"]*v=([^"&]+)"/);
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
