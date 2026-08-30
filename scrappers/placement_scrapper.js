const RAPIDAPI_KEY = "{RAPID_API_KEY}";

export default {
  async fetch(request) {
    try {

      // ── 1. Unstop Jobs ──────────────────────────────────
      const unstopRes = await fetch(
        "https://unstop.com/api/public/opportunity/search-result?opportunity=jobs&per_page=5&oppstatus=open",
        {
          headers: {
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
            "Referer": "https://unstop.com/jobs",
          }
        }
      );
      const unstopData = await unstopRes.json();
      const unstopJobs = (unstopData?.data?.data || []).slice(0, 5).map(job => ({
        title: job.title || "Unknown",
        company: job.organisation?.name || "Unknown",
        location: job.region === "online" ? "Remote" : "India",
        salary: "Check site",
        link: `https://unstop.com/${job.public_url}`,
        posted: job.updated_at ? new Date(job.updated_at).toLocaleDateString("en-IN") : "Recent",
        source: "Unstop",
      }));

      // ── 2. JSearch — Fresher Jobs India ─────────────────
      const fresherRes = await fetch(
        "https://jsearch.p.rapidapi.com/search?query=fresher+software+engineer+India&page=1&num_pages=1&date_posted=3days",
        {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          }
        }
      );
      const fresherData = await fresherRes.json();
      const fresherJobs = (fresherData?.data || []).slice(0, 5).map(job => ({
        title: job.job_title || "Unknown",
        company: job.employer_name || "Unknown",
        location: job.job_is_remote ? "Remote" : (job.job_city || "India"),
        salary: job.job_salary_string || job.job_min_salary ? `$${job.job_min_salary}-${job.job_max_salary}` : "Not listed",
        link: job.job_apply_link || "#",
        posted: job.job_posted_at || "Recent",
        source: job.job_publisher || "LinkedIn/Indeed",
      }));

      // ── 3. JSearch — CS Graduate India ──────────────────
      const gradRes = await fetch(
        "https://jsearch.p.rapidapi.com/search?query=entry+level+developer+India+remote&page=1&num_pages=1&date_posted=week",
        {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          }
        }
      );
      const gradData = await gradRes.json();
      const gradJobs = (gradData?.data || []).slice(0, 5).map(job => ({
        title: job.job_title || "Unknown",
        company: job.employer_name || "Unknown",
        location: job.job_is_remote ? "Remote" : (job.job_city || "India"),
        salary: job.job_salary_string || "Not listed",
        link: job.job_apply_link || "#",
        posted: job.job_posted_at || "Recent",
        source: job.job_publisher || "LinkedIn/Indeed",
      }));

      const allJobs = [...unstopJobs, ...fresherJobs, ...gradJobs];

      return new Response(
        JSON.stringify({
          success: true,
          count: allJobs.length,
          source: "Unstop + LinkedIn + Indeed + Glassdoor",
          scraped_at: new Date().toISOString(),
          placements: allJobs,
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
        JSON.stringify({ success: false, error: err.message, placements: [] }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};