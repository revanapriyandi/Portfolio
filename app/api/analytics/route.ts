import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  // Read GA credentials from DB settings
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("portfolio_system_settings")
    .select("ga4_property_id, ga_credentials_json")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const propertyId = settings?.ga4_property_id || process.env.GA4_PROPERTY_ID;
  const credentialsJson = settings?.ga_credentials_json || process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!propertyId || !credentialsJson) {
    return NextResponse.json({ configured: false, data: [] });
  }

  try {
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const credentials = JSON.parse(credentialsJson);
    const client = new BetaAnalyticsDataClient({ credentials });

    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "28daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "screenPageViews" },
        { name: "sessions" },
        { name: "activeUsers" },
      ],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    });

    const data = (response.rows ?? []).map((row) => ({
      date: row.dimensionValues?.[0]?.value ?? "",
      pageviews: parseInt(row.metricValues?.[0]?.value ?? "0"),
      sessions: parseInt(row.metricValues?.[1]?.value ?? "0"),
      users: parseInt(row.metricValues?.[2]?.value ?? "0"),
    }));

    const totals = data.reduce(
      (acc, d) => ({
        pageviews: acc.pageviews + d.pageviews,
        sessions: acc.sessions + d.sessions,
        users: acc.users + d.users,
      }),
      { pageviews: 0, sessions: 0, users: 0 }
    );

    return NextResponse.json({ configured: true, data, totals });
  } catch (error) {
    return NextResponse.json({ configured: false, error: String(error), data: [] });
  }
}
