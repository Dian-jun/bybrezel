exports.handler = async function (event) {
  const TOKEN    = process.env.AIRTABLE_TOKEN;
  const BASE_ID  = process.env.AIRTABLE_BASE_ID;
  const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

  if (!TOKEN || !BASE_ID || !TABLE_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "환경변수가 설정되지 않았습니다." }) };
  }

  const headers = {
    "Authorization": `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  };

  const base = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_ID)}`;
  const method = event.httpMethod;

  try {
    let url = base;
    let options = { method, headers };

    if (method === "GET") {
      // Public: only return approved records
      const params = new URLSearchParams();
      params.set("filterByFormula", "{approval status} = TRUE()");
      params.set("sort[0][field]", "submission date");
      params.set("sort[0][direction]", "desc");
      url = base + "?" + params.toString();
    } else if (method === "POST") {
      // Submit new record (always unapproved)
      const body = JSON.parse(event.body || "{}");
      const fields = body.fields || {};
      // Force approval status to false regardless of what client sends
      fields["approval status"] = false;
      options.body = JSON.stringify({ records: [{ fields }] });
    } else if (method === "PATCH") {
      // Only allow updating likes field
      const body = JSON.parse(event.body || "{}");
      const recordId = body.recordId;
      const likes = body.likes;
      if (!recordId || typeof likes !== "number") {
        return { statusCode: 400, body: JSON.stringify({ error: "잘못된 요청입니다." }) };
      }
      url = `${base}/${recordId}`;
      options.body = JSON.stringify({ fields: { likes } });
    } else {
      return { statusCode: 405, body: JSON.stringify({ error: "허용되지 않는 메서드입니다." }) };
    }

    const res = await fetch(url, options);
    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
