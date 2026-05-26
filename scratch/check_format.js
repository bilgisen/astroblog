async function checkFormat() {
  const url = 'https://www.youtube.com/@paraanaliz827/videos';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await res.text();
    const index = html.indexOf('"videoId":"iok25t588cs"');
    if (index !== -1) {
      console.log('Found videoId match at index:', index);
      console.log('Surrounding 600 characters:');
      console.log(html.slice(index - 100, index + 500));
    } else {
      console.log('videoId iok25t588cs not found in HTML directly');
    }
  } catch (e) {
    console.error(e);
  }
}

checkFormat();
