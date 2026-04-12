// functions/money/api/parse.js
// Cloudflare Pages Function — Anthropic API 프록시
//
// 환경변수 설정:
//   Cloudflare 대시보드 → Pages → bybrezel → Settings → Environment variables
//   ANTHROPIC_API_KEY = sk-ant-...
//
// API 키 발급: console.anthropic.com → API Keys → Create Key

export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { text } = await context.request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: '가계부 파서. 반드시 JSON만 반환 (백틱/마크다운 없이 순수 JSON):\n규칙:\n- title: 상호명/항목명만 간결하게 추출. 예) "rewe에서 50유로 카드로"→"REWE", "넷플릭스 구독료"→"Netflix", "엄마한테 송금"→"엄마 송금", "학원비 결제"→"학원비"\n- type: expense 또는 income\n- amount: 숫자만. 한글숫자변환(오십→50, 백→100, 만→10000)\n- currency: 유로/€=EUR, 원/₩/만원=KRW\n- category: 식비/외식/교통/의료/쇼핑/카페/구독/공과금/송금/급여/식비지원금/여행/기타 중 하나. REWE/EDEKA/Lidl/마트=식비. 식당=외식. DB/Bahn/지하철/버스=교통. 급여/Gehalt=income+급여. Sodexo/식비지원=식비지원금. 목록에 없으면 기타.\n- payMethod: card/cash/voucher. 식권/쿠폰=voucher\n- country: DE 또는 KR\n반환 형식: {"title":"","type":"","amount":숫자,"currency":"","category":"","payMethod":"","country":""}',
        messages: [{ role: 'user', content: text }],
      }),
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return new Response(JSON.stringify({ ok: true, result: parsed }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405 });
}
