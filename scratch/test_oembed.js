async function testOembed() {
  const ids = ['iok25t588cs', '-yeKtACgBP8', 'i5yym6M1qyI', '20AcHuVq6HE'];
  for (const id of ids) {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`;
    try {
      const res = await fetch(url);
      const json = await res.json();
      console.log(`Video ${id}:`);
      console.log('  title:', json.title);
      console.log('  author:', json.author_name);
    } catch (e) {
      console.error(`Error for ${id}:`, e);
    }
  }
}

testOembed();
