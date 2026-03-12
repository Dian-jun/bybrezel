export async function onRequest(context) {
  const TOKEN = context.env.AIRTABLE_TOKEN;
  const BASE_ID = context.env.AIRTABLE_BASE_ID;
  const TABLE_ID = context.env.AIRTABLE_TABLE_ID;
  const request = context.request;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
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
  const method = request.method;
 
  try {
    let url = base;
    let fetchOptions = { method, headers: atHeaders };

    if (method === "GET") {
      const params = new URLSearchParams();
      params.set("filterByFormula", "{approval status} = 'Approved'");
      params.set("sort[0][field]", "submission date");
      params.set("sort[0][direction]", "desc");
      params.set("maxRecords", "50");
      url = `${base}?${params.toString()}`;
    
      const cache = caches.default; 
      const cacheKey = new Request(url, { method: "GET" });
      const cached = await cache.match(cacheKey);
    
      if (cached) {
        return new Response(cached.body, {
          status: cached.status,
          headers: {
            ...corsHeaders,
            "Cache-Control": "public, max-age=300, s-maxage=300"
          },
        });
      }

      const res = await fetch(url, fetchOptions);
      const data = await res.json();
      const response = new Response(JSON.stringify(data), {
        status: res.status,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      });

      if (res.ok) {
        context.waitUntil(cache.put(cacheKey, response.clone()));
      }
      return response;
    }

    if (method === "POST") {
      const body = await request.json().catch(() => ({}));

      if (body.type === "claim") {
        if (!body.recordId) {
          return new Response(
            JSON.stringify({ error: "recordId가 필요합니다." }),
            { status: 400, headers: corsHeaders }
          );
        }

        url = `${base}/${body.recordId}`;
        fetchOptions.method = "PATCH";
        fetchOptions.body = JSON.stringify({
          fields: {
            "claim reason": String(body.reason || ""),
            "has claim": true,
          },
        });
      } else {
        const fields = body.fields || {};
        fields["approval status"] = "Pending";

        if ("tags" in fields) {
          const parsedTags = String(fields.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);

          if (parsedTags.length > 0) {
            fields.tags = parsedTags;
          } else {
            delete fields.tags;
          }
        }

        fetchOptions.method = "POST";
        fetchOptions.body = JSON.stringify({
          records: [{ fields }],
          typecast: true,
        });
      }
    } else if (method === "PATCH") {
      const body = await request.json().catch(() => ({}));
      if (!body.recordId || typeof body.likes !== "number") {
        return new Response(
          JSON.stringify({ error: "잘못된 요청" }),
          { status: 400, headers: corsHeaders }
        );
      }
      url = `${base}/${body.recordId}`;
      fetchOptions.method = "PATCH";
      fetchOptions.body = JSON.stringify({ fields: { likes: body.likes } });
    } else {
      return new Response(
        JSON.stringify({ error: "허용되지 않는 메서드" }),
        { status: 405, headers: corsHeaders }
      );
    }

    const res = await fetch(url, fetchOptions);
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: corsHeaders,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
