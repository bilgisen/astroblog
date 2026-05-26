async function getRealVideoIds() {
  const query = encodeURIComponent('site:youtube.com "@paraanaliz827" watch');
  const url = `https://www.google.com/search?q=${query}&num=20`;
  
  console.log('Searching Google for real ParaAnaliz video links...');
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // Find all occurrences of watch?v=[ID]
    const watchRegex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
    const matches = [...html.matchAll(watchRegex)];
    
    const uniqueIds = [...new Set(matches.map(m => m[1]))];
    console.log('Found video IDs:', uniqueIds);
  } catch (e) {
    console.error('Error during Google scraping:', e);
  }
}

getRealVideoIds();
