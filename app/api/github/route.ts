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
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${USERNAME}/repos?sort=stars&per_page=100`, { headers, next: { revalidate: 3600 } }),
    ]);

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
    }[] = reposRes.ok ? await reposRes.json() : [];

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
        profileUrl: user.html_url,
      },
      stats: { totalStars, totalForks, totalRepos: repos.length },
      languages,
      topRepos,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
