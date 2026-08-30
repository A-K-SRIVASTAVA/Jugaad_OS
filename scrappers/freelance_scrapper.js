export default {
  async fetch(request) {
    try {
      const response = await fetch(
        "https://www.reddit.com/r/forhire/search.json?q=hiring+remote&sort=new&limit=15&restrict_sr=1",
        {
          headers: {
            "User-Agent": "JugaadOS-Bot/1.0 (by /u/jugaad_os)",
            "Accept": "application/json",
          }
        }
      );

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Reddit returned ${response.status}`);
      }

      const text = await response.text();

      // Safely parse JSON
      let redditData;
      try {
        redditData = JSON.parse(text);
      } catch(e) {
        throw new Error(`JSON parse failed: ${text.substring(0, 100)}`);
      }

      const posts = redditData?.data?.children || [];

      const gigs = posts
        .filter(p => p?.data?.title?.toLowerCase().includes("[hiring]"))
        .slice(0, 5)
        .map(p => ({
          title: (p.data.title || "")
            .replace(/\[hiring\]/gi, "")
            .replace(/&amp;/g, "and")
            .replace(/[^\w\s.,@:/\-$]/g, " ")
            .trim(),
          budget: extractBudget(p.data.title || ""),
          description: (p.data.selftext || "").substring(0, 100),
          link: `https://reddit.com${p.data.permalink}`,
          posted: new Date((p.data.created_utc || 0) * 1000).toLocaleDateString("en-IN"),
        }));

      return new Response(
        JSON.stringify({
          success: true,
          count: gigs.length,
          source: "Reddit r/forhire",
          scraped_at: new Date().toISOString(),
          gigs: gigs.length > 0 ? gigs : getDefaultGigs(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

    } catch (err) {
      // Return default gigs on error so workflow doesn't break
      return new Response(
        JSON.stringify({
          success: true,
          count: 3,
          source: "Reddit r/forhire",
          scraped_at: new Date().toISOString(),
          gigs: getDefaultGigs(),
          error_note: err.message,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};

function extractBudget(title) {
  const match = title.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?|\$[\d]+[kK]/);
  return match ? match[0] : "Negotiable";
}

function getDefaultGigs() {
  return [
    {
      title: "Check Reddit r/forhire for latest gigs",
      budget: "Various",
      description: "Visit Reddit for latest freelance opportunities",
      link: "https://reddit.com/r/forhire",
      posted: new Date().toLocaleDateString("en-IN"),
    }
  ];
}