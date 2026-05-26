async function test() {
  const rssUrl = encodeURIComponent('https://www.youtube.com/feeds/videos.xml?channel_id=UCURPZbLYwqxOtqmkbMfhYOw');
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
  console.log('Fetching:', url);
  try {
    const res = await fetch(url);
    const json = await res.json();
    console.log('Status:', json.status);
    if (json.status === 'ok') {
      console.log('Feed Title:', json.feed.title);
      console.log('Items Count:', json.items.length);
      for (let i = 0; i < Math.min(json.items.length, 3); i++) {
        const item = json.items[i];
        console.log(`Item ${i}:`);
        console.log('  title:', item.title);
        console.log('  link:', item.link);
        console.log('  pubDate:', item.pubDate);
        // Extract video ID from link (e.g., https://www.youtube.com/watch?v=iok25t588cs)
        const videoId = item.link.match(/v=([^&]+)/)?.[1];
        console.log('  videoId:', videoId);
      }
    } else {
      console.log('Error from rss2json:', json.message);
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
