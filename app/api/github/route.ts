import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  // Read GitHub credentials from DB settings
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("portfolio_system_settings")
    .select("github_username, github_token")
    .limit(1)
    .single();

  const USERNAME = settings?.github_username || process.env.GITHUB_USERNAME || "revanapriyandi";
  const TOKEN = settings?.github_token || process.env.GITHUB_TOKEN;

  const headers: HeadersInit = {
    "Accept": "application/vnd.github+json",
    ...(TOKEN ? { "Authorization": `Bearer ${TOKEN}` } : {}),
  };

  try {
    const userUrl = TOKEN ? "https://api.github.com/user" : `https://api.github.com/users/${USERNAME}`;
    const reposUrl = TOKEN 
      ? "https://api.github.com/user/repos?type=all&per_page=100&sort=updated" 
      : `https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`;

    const [userRes, reposRes] = await Promise.all([
      fetch(userUrl, { headers, next: { revalidate: 3600 } }),
      fetch(reposUrl, { headers, next: { revalidate: 3600 } }),
    ]);

    let contributions = null;
    let totalContributions = 0;

    // Fetch contributions via GraphQL if TOKEN is present (required for GraphQL)
    if (TOKEN && USERNAME) {
      try {
        const gqlQuery = `
          query {
            user(login: "${USERNAME}") {
              contributionsCollection {
                contributionCalendar {
                  totalContributions
                  weeks {
                    contributionDays {
                      contributionCount
                      date
                    }
                  }
                }
              }
            }
          }
        `;
        const gqlRes = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers,
          body: JSON.stringify({ query: gqlQuery }),
          next: { revalidate: 3600 },
        });
        if (gqlRes.ok) {
          const gqlData = await gqlRes.json();
          const calendar = gqlData?.data?.user?.contributionsCollection?.contributionCalendar;
          if (calendar) {
            totalContributions = calendar.totalContributions;
            // Flatten weeks into a single array of days
            const days: { date: string; count: number }[] = [];
            calendar.weeks.forEach((week: { contributionDays: { date: string; contributionCount: number }[] }) => {
              week.contributionDays.forEach((day: { date: string; contributionCount: number }) => {
                days.push({ date: day.date, count: day.contributionCount });
              });
            });
            contributions = days;
          }
        }
      } catch (err) {
        console.error("GraphQL Contributions Error:", err);
      }
    }

    if (!userRes.ok) {
      return NextResponse.json({ error: "GitHub API error" }, { status: userRes.status });
    }

    const user = await userRes.json();
    const repos: {
      name: string;
      description: string | null;
      stargazers_count: number;
      forks_count: number;
      language: string | null;
      html_url: string;
      updated_at: string;
      private: boolean;
    }[] = reposRes.ok ? await reposRes.json() : [];

    const calculatedPrivate = repos.filter((r) => r.private).length;
    const finalPrivateCount = user.total_private_repos ?? calculatedPrivate;

    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);

    const langMap: Record<string, number> = {};
    repos.forEach((r) => {
      if (r.language) langMap[r.language] = (langMap[r.language] ?? 0) + 1;
    });
    const languages = Object.entries(langMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));

    const topRepos = repos
      .filter((r) => r.stargazers_count > 0 || r.forks_count > 0)
      .slice(0, 6)
      .map((r) => ({
        name: r.name,
        description: r.description,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        url: r.html_url,
        updatedAt: r.updated_at,
      }));

    return NextResponse.json({
      user: {
        login: user.login,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar_url,
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        privateRepos: finalPrivateCount,
        profileUrl: user.html_url,
      },
      stats: { 
        totalStars, 
        totalForks, 
        totalRepos: repos.length,
        publicRepos: repos.filter(r => !r.private).length || user.public_repos || 0,
        privateRepos: finalPrivateCount,
        totalContributions
      },
      languages,
      topRepos,
      contributions,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
