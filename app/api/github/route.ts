import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("portfolio_system_settings")
    .select("github_username, github_token")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let accounts: { username: string; token: string }[] = [];

  try {
    if (settings?.github_token && settings.github_token.startsWith('[')) {
      accounts = JSON.parse(settings.github_token);
    } else {
      accounts = [{
        username: settings?.github_username || process.env.GITHUB_USERNAME || "revanapriyandi",
        token: settings?.github_token || process.env.GITHUB_TOKEN || "",
      }];
    }
  } catch {
    accounts = [{
      username: settings?.github_username || process.env.GITHUB_USERNAME || "revanapriyandi",
      token: settings?.github_token || process.env.GITHUB_TOKEN || "",
    }];
  }

  // Filter out completely empty accounts
  accounts = accounts.filter(a => a.username || a.token);

  if (accounts.length === 0) {
    accounts = [{ username: "revanapriyandi", token: "" }];
  }

  try {
    const reposPromises = accounts.map(async (acc) => {
      const headers: HeadersInit = {
        "Accept": "application/vnd.github+json",
        ...(acc.token ? { "Authorization": `Bearer ${acc.token}` } : {}),
      };
      
      const reposUrl = acc.token 
        ? "https://api.github.com/user/repos?type=all&per_page=100&sort=updated" 
        : `https://api.github.com/users/${acc.username}/repos?per_page=100&sort=updated`;
        
      const res = await fetch(reposUrl, { headers, next: { revalidate: 3600 } });
      if (!res.ok) return [];
      const data = await res.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((r: any) => ({ ...r, _account: acc }));
    });

    // Fetch primary user details (from the first account)
    const primaryAccount = accounts[0];
    const primaryHeaders: HeadersInit = {
      "Accept": "application/vnd.github+json",
      ...(primaryAccount.token ? { "Authorization": `Bearer ${primaryAccount.token}` } : {}),
    };
    const userUrl = primaryAccount.token ? "https://api.github.com/user" : `https://api.github.com/users/${primaryAccount.username}`;
    const userPromise = fetch(userUrl, { headers: primaryHeaders, next: { revalidate: 3600 } }).then(r => r.ok ? r.json() : null);

    let contributions = null;
    let totalContributions = 0;

    // Fetch contributions via GraphQL for the primary account
    if (primaryAccount.token && primaryAccount.username) {
      try {
        const gqlQuery = `
          query {
            user(login: "${primaryAccount.username}") {
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
          headers: primaryHeaders,
          body: JSON.stringify({ query: gqlQuery }),
          next: { revalidate: 3600 },
        });
        if (gqlRes.ok) {
          const gqlData = await gqlRes.json();
          const calendar = gqlData?.data?.user?.contributionsCollection?.contributionCalendar;
          if (calendar) {
            totalContributions = calendar.totalContributions;
            const days: { date: string; count: number }[] = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            calendar.weeks.forEach((week: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              week.contributionDays.forEach((day: any) => {
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

    const [allReposArrays, user] = await Promise.all([
      Promise.all(reposPromises),
      userPromise,
    ]);

    // Flatten repos and remove exact duplicates based on html_url
    const reposMap = new Map();
    for (const reposArray of allReposArrays) {
      for (const r of reposArray) {
        if (!reposMap.has(r.html_url)) {
          reposMap.set(r.html_url, r);
        }
      }
    }
    const repos = Array.from(reposMap.values());

    const calculatedPrivate = repos.filter((r) => r.private).length;
    const finalPrivateCount = user?.total_private_repos ?? calculatedPrivate;

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
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
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
      user: user ? {
        login: user.login,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar_url,
        followers: user.followers,
        following: user.following,
        publicRepos: user.public_repos,
        privateRepos: finalPrivateCount,
        profileUrl: user.html_url,
      } : { login: accounts[0].username },
      stats: { 
        totalStars, 
        totalForks, 
        totalRepos: repos.length,
        publicRepos: repos.filter(r => !r.private).length || user?.public_repos || 0,
        privateRepos: finalPrivateCount,
        totalContributions
      },
      languages,
      repos: repos.map((r) => ({
        name: r.name,
        full_name: r.full_name,
        description: r.description,
        language: r.language,
        url: r.html_url,
        private: r.private,
        updatedAt: r.updated_at,
        owner: r.owner?.login,
        _token: r._account?.token || ""
      })),
      topRepos,
      contributions,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
