export default {
  async fetch(request) {
    try {
      const response = await fetch(
        "https://internshala.com/internships/stipend-5000/",
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
            "Referer": "https://www.google.com/",
          }
        }
      );

      const html = await response.text();
      const internships = [];

      const cards = html.split(/id="individual_internship_\d+"/);

      for (let i = 1; i < Math.min(cards.length, 11); i++) {
        const card = cards[i];

        // Title
        const titleMatch = card.match(/class="job-title-href"[^>]*>([^<]+)<\/a>/);

        // Company
        const companyMatch = card.match(/class="company-name"[^>]*>\s*([^<]+)\s*<\/p>/);

        // Stipend ← fixed!
        const stipendMatch = card.match(/<span class='stipend'>([^<]+)<\/span>/);

        // Location ← fixed!
        const locationMatch = card.match(/class="row-1-item locations"[\s\S]*?<a[^>]*>([^<]+)<\/a>/);

        // Duration
        const durationMatch = card.match(/<span>\s*(\d+\s*(?:month|week|year)[^<]*)<\/span>/i);

        // Link
        const linkMatch = card.match(/data-href='([^']+)'/);

        if (titleMatch) {
          internships.push({
            title: titleMatch[1].trim(),
            company: companyMatch ? companyMatch[1].trim() : "Unknown",
            stipend: stipendMatch ? stipendMatch[1].trim() : "Performance based",
            location: locationMatch ? locationMatch[1].trim() : "WFH",
            duration: durationMatch ? durationMatch[1].trim() : "N/A",
            link: linkMatch
              ? `https://internshala.com${linkMatch[1]}`
              : "https://internshala.com/internships/",
          });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          count: internships.length,
          source: "Internshala",
          scraped_at: new Date().toISOString(),
          internships,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err.message, internships: [] }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};