async function findRenderer() {
  const url = 'https://www.youtube.com/@paraanaliz827/videos';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    let index = 0;
    while (true) {
      index = html.indexOf('"videoId":"iok25t588cs"', index);
      if (index === -1) break;
      console.log('Occurence of videoId at index:', index);
      const start = Math.max(0, index - 500);
      const end = Math.min(html.length, index + 1000);
      const snippet = html.slice(start, end);
      if (snippet.includes('videoRenderer') || snippet.includes('title')) {
        console.log('--- Found renderer block around index:', index);
        console.log(snippet);
        break;
      }
      index += 1;
    }
  } catch (e) {
    console.error(e);
  }
}

findRenderer();
