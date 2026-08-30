const RAPIDAPI_KEY = "{RAPID_API_KEY}";

export default {
  async fetch(request) {
    try {

      // ── 1. RemoteOK (free public API) ───────────────────
      const remoteokRes = await fetch(
        "https://remoteok.com/api?tag=dev",
        {
          headers: {
            "User-Agent": "JugaadOS-Bot/1.0",
            "Accept": "application/json",
          }
        }
      );
      const remoteokData = await remoteokRes.json();
      const remoteokJobs = (Array.isArray(remoteokData) ? remoteokData : [])
        .filter(j => j.position)
        .slice(0, 5)
        .map(job => ({
          title: job.position || "Unknown",
          company: job.company || "Unknown",
          salary: job.salary || "Not listed",
          tags: (job.tags || []).slice(0, 3).join(", "),
          link: job.url || "https://remoteok.com",
          posted: job.date ? new Date(job.date).toLocaleDateString("en-IN") : "Recent",
          source: "RemoteOK",
        }));

      // ── 2. JSearch — Remote Jobs (fixed) ────────────────
      const remoteRes = await fetch(
        "https://jsearch.p.rapidapi.com/search?query=remote+react+node+developer&page=1&num_pages=1&date_posted=week",
        {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          }
        }
      );
      const remoteData = await remoteRes.json();
      const remoteJobs = (remoteData?.data || [])
        .slice(0, 5)
        .map(job => ({
          title: job.job_title || "Unknown",
          company: job.employer_name || "Unknown",
          salary: job.job_salary_string
            ? job.job_salary_string
            : job.job_min_salary
            ? `$${job.job_min_salary} - $${job.job_max_salary}`
            : "Not listed",
          tags: (job.job_required_skills || []).slice(0, 3).join(", ") || "Check listing",
          link: job.job_apply_link || "#",
          posted: job.job_posted_at || "Recent",
          source: job.job_publisher || "LinkedIn/Indeed",
        }));

      // ── 3. WeWorkRemotely RSS (fixed parser) ─────────────
      const wwrRes = await fetch(
        "https://weworkremotely.com/categories/remote-programming-jobs.rss",
        { headers: { "User-Agent": "JugaadOS-Bot/1.0" } }
      );
      const wwrXml = await wwrRes.text();
      const wwrJobs = [];
      const items = wwrXml.match(/<item>([\s\S]*?)<\/item>/g) || [];

      items.slice(0, 5).forEach(item => {
        // Try CDATA first then plain
        let titleFull = "";
        const cdataMatch = item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/);
        const plainMatch = item.match(/<title>([\s\S]*?)<\/title>/);
        titleFull = cdataMatch ? cdataMatch[1].trim() : plainMatch ? plainMatch[1].trim() : "";

        // Link
        const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
        const link = linkMatch ? linkMatch[1].trim() : "https://weworkremotely.com";

        // WWR format is "Company: Job Title"
        let company = "Unknown";
        let title = titleFull;

        if (titleFull.includes(": ")) {
          const parts = titleFull.split(": ");
          company = parts[0].trim();
          title = parts.slice(1).join(": ").trim();
        } else if (titleFull.includes(" at ")) {
          const parts = titleFull.split(" at ");
          title = parts[0].trim();
          company = parts[1].trim();
        }

        // Decode HTML entities
        title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#\d+;/g, "");
        company = company.replace(/&amp;/g, "&").replace(/&#\d+;/g, "");

        if (title) {
          wwrJobs.push({
            title,
            company,
            salary: "Not listed",
            tags: "Remote",
            link,
            posted: "Recent",
            source: "WeWorkRemotely",
          });
        }
      });

      const allRemote = [...remoteokJobs, ...remoteJobs, ...wwrJobs];

      return new Response(
        JSON.stringify({
          success: true,
          count: allRemote.length,
          breakdown: {
            remoteok: remoteokJobs.length,
            jsearch: remoteJobs.length,
            weworkremotely: wwrJobs.length,
          },
          source: "RemoteOK + JSearch + WeWorkRemotely",
          scraped_at: new Date().toISOString(),
          remote_jobs: allRemote,
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
        JSON.stringify({ success: false, error: err.message, remote_jobs: [] }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};