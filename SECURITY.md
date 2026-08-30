# Security Policy

## Supported Versions

Jugaad OS is a single, actively-maintained self-hosted project (n8n workflows + Cloudflare Workers scrapers) rather than a versioned library, so security fixes are applied to the latest code on the `main` branch only.

| Version         | Supported          |
| ---------------- | ------------------- |
| `main` (latest) | :white_check_mark: |
| Older commits / forks | :x:           |

If you're running a fork or an older checkout, please pull the latest `main` before reporting an issue — it may already be fixed.

## Reporting a Vulnerability

If you discover a security vulnerability in Jugaad OS (for example, in the n8n workflows, the Cloudflare Worker scrapers, Supabase functions/RLS policies, or credential handling), please report it privately rather than opening a public GitHub issue.

**How to report:**

* Email: reach out via the contact on the maintainer's GitHub profile — [A-K-SRIVASTAVA](https://github.com/A-K-SRIVASTAVA)
* Or use GitHub's [private vulnerability reporting](https://github.com/A-K-SRIVASTAVA/jugaad-os/security/advisories/new) feature on this repository, if enabled

**Please include:**

* A clear description of the vulnerability and its potential impact
* Steps to reproduce (a minimal example is ideal)
* Which component is affected (n8n workflow, a specific Cloudflare Worker, Supabase schema/functions, Telegram bot handling, etc.)

**What to expect:**

* **Acknowledgement:** within 3–5 days of your report
* **Status updates:** at least once every 7 days while the issue is being investigated
* **If accepted:** a fix will be prioritized, and you'll be credited in the fix's changelog/commit unless you prefer to remain anonymous
* **If declined:** you'll receive an explanation of why it's not considered a vulnerability (e.g. expected behavior, out of scope, or already mitigated)

**Please do not:**

* Publicly disclose the issue before a fix has been released
* Test against production credentials, other users' Telegram data, or the live Supabase instance — use a local/self-hosted setup with your own API keys instead

## Scope Notes

Since this project relies on third-party services (Telegram, Groq, Supabase, Cloudflare Workers, RapidAPI/JSearch, Reddit, Internshala, Unstop, RemoteOK, WeWorkRemotely), vulnerabilities originating purely from those external services should be reported to them directly. Reports involving how Jugaad OS integrates with or handles data from these services (e.g. credential exposure, injection via scraped content, insecure storage) are in scope here.
