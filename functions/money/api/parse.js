// functions/money/api/parse.js
// Cloudflare Pages Function — OpenRouter API 프록시
//
// 환경변수 설정:
//   Cloudflare 대시보드 → Pages → bybrezel → Settings → Environment variables
//   OPENROUTER_API_KEY = sk-or-...
//
// API 키 발급: openrouter.ai → Sign in → Keys → Create key

export async function onRequestPost(context) {
  const apiKey = context.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text } = await context.request.json();

<<<<<<< HEAD
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://bybrezel.com',
        'X-Title': '교민 가계부',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: '가계부 파서. 반드시 JSON만 반환 (백틱/마크다운 없이 순수 JSON):\n규칙: 유로/€=EUR, 원/₩=KRW. 한글숫자변환(오십→50). REWE/EDEKA/Lidl/마트=식비. 식당/음식점=외식. DB/Bahn/지하철/버스=교통. 급여/Gehalt=income+급여. 송금=송금. Sodexo/식비지원=식비지원금. 식권/쿠폰=payMethod:voucher.\n반환 형식: {"title":"","type":"expense또는income","amount":숫자,"currency":"EUR또는KRW","category":"","payMethod":"card또는cash또는voucher","country":"DE또는KR"}',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });
=======
    const prompt = `가계부 파서. 반드시 JSON만 반환 (백틱/마크다운 없이 순수 JSON):
규칙: 유로/€=EUR, 원/₩=KRW. 한글숫자변환(오십→50). REWE/EDEKA/Lidl/마트=식비. 식당/음식점=외식. DB/Bahn/지하철/버스=교통. 급여/Gehalt=income+급여. 송금=송금. Sodexo/식비지원=식비지원금. 식권/쿠폰=payMethod:voucher.
반환 형식: {"title":"","type":"expense또는income","amount":숫자,"currency":"EUR또는KRW","category":"","payMethod":"card또는cash또는voucher","country":"DE또는KR"}
입력: ${text}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
        }),
      }
    );
>>>>>>> 513d9ca8e7b6f3edb4338ed1423bf62b8c5c3204

    const data = await response.json();

    // OpenRouter 응답에서 텍스트 추출
    const raw = data.choices?.[0]?.message?.content || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify({ ok: true, result: parsed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
<<<<<<< HEAD
      JSON.stringify({ ok: false, error: err.message }),
=======
      JSON.stringify({ ok: false, error: err.message, raw: err.stack }),
>>>>>>> 513d9ca8e7b6f3edb4338ed1423bf62b8c5c3204
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405 });
}
