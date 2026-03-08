exports.handler = async function (event) {
  const TOKEN    = process.env.AIRTABLE_TOKEN;
  const BASE_ID  = process.env.AIRTABLE_BASE_ID;
  const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

  if (!TOKEN || !BASE_ID || !TABLE_ID) {
    return { statusCode: 500, body: JSON.stringify({ error: "환경변수가 설정되지 않았습니다." }) };
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }

  const atHeaders = { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" };
  const base   = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_ID)}`;
  const method = event.httpMethod;

  try {
    let url = base;
    let fetchOptions = { method, headers: atHeaders };

    if (method === "GET") {
      const params = new URLSearchParams();
      params.set("filterByFormula", "{approval status} = 'Approved'");
      params.set("sort[0][field]", "submission date");
      params.set("sort[0][direction]", "desc");
      url = base + "?" + params.toString();

    } else if (method === "POST") {
      const body = JSON.parse(event.body || "{}");

      if (body.type === "claim") {
        // 오류 신고: 해당 레코드에 플래그 추가
        url = `${base}/${body.recordId}`;
        fetchOptions.method = "PATCH";
        fetchOptions.body = JSON.stringify({
          fields: {
            "claim reason": String(body.reason || ""),
            "has claim": true
          }
        });
      } else {
        // 정보 또는 질문 제출
        const fields = body.fields || {};
        fields["approval status"] = "Pending";
        // 1번 수정: tags 항상 string으로 보장
        if ("tags" in fields) {
          fields["tags"] = String(fields["tags"] || "").trim();
          if (!fields["tags"]) delete fields["tags"]; // 빈 문자열이면 필드 자체를 제거
        }
        fetchOptions.body = JSON.stringify({ records: [{ fields }] });
      }

    } else if (method === "PATCH") {
      const body = JSON.parse(event.body || "{}");
      if (!body.recordId || typeof body.likes !== "number") {
        return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: "잘못된 요청" }) };
      }
      url = `${base}/${body.recordId}`;
      fetchOptions.body = JSON.stringify({ fields: { likes: body.likes } });

    } else {
      return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "허용되지 않는 메서드" }) };
    }

    const res  = await fetch(url, fetchOptions);
    const data = await res.json();
    return { statusCode: res.status, headers: corsHeaders, body: JSON.stringify(data) };

  } catch (e) {
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) };
  }
};
