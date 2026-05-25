async function test() {
  const slugs = Array.from({length: 10}, (_, i) => `slide-${String(i + 1).padStart(2, '0')}`).join(',');
  const url = `https://paback.paraanaliz.workers.dev/api/news?where[tags.slug][in]=${slugs}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Found matching docs count for slide-* slugs:", data.totalDocs);
}

test();
