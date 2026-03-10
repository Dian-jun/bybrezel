export async function onRequest(context) {
  const TOKEN    = context.env.AIRTABLE_TOKEN;
  const BASE_ID  = context.env.AIRTABLE_BASE_ID;
  const TABLE_ID = context.env.AIRTABLE_MEETUP_TABLE_ID;
  const request  = context.request;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (request.method === "OPTIONS") {
    return new Response("", { status: 200, headers: corsHeaders });
  }

  if (!TOKEN || !BASE_ID || !TABLE_ID) {
    return new Response(
      JSON.stringify({ error: "환경변수가 설정되지 않았습니다." }),
      { status: 500, headers: corsHeaders }
    );
  }

  const atHeaders = {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };
  const base = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_ID)}`;

  try {
    if (request.method === "GET") {
      const params = new URLSearchParams();
      params.set("filterByFormula", "{approval status} = 'Approved'");
      params.set("sort[0][field]", "submission_date");
      params.set("sort[0][direction]", "desc");
      params.set("maxRecords", "100");

      const url = `${base}?${params.toString()}`;
      const res  = await fetch(url, { method: "GET", headers: atHeaders });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { ...corsHeaders, "Cache-Control": "public, max-age=300" },
      });
    }

    if (request.method === "POST") {
      const body   = await request.json().catch(() => ({}));
      const fields = body.fields || {};
      fields["approval status"] = "Pending";

      const res = await fetch(base, {
        method: "POST",
        headers: atHeaders,
        body: JSON.stringify({ records: [{ fields }], typecast: true }),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        status: res.status,
        headers: corsHeaders,
      });
    }

    return new Response(
      JSON.stringify({ error: "허용되지 않는 메서드" }),
      { status: 405, headers: corsHeaders }
    );

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
