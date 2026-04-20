// functions/money/api/receipt.js
// Cloudflare Pages Function — 영수증 스캔 API
//
// 환경변수 설정:
//   Cloudflare 대시보드 → Pages → bybrezel → Settings → Environment variables
//   ANTHROPIC_API_KEY = sk-ant-...
//
// parse.js와 동일한 API 키 사용

export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'API key not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { image, mimeType } = await context.request.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: image
              }
            },
            {
              type: 'text',
              text: `이 영수증을 분석해서 다음 정보를 JSON 형식으로 추출해주세요:

{
  "storeName": "가게명",
  "date": "YYYY-MM-DD 형식의 날짜",
  "totalAmount": 숫자 (합계 금액),
  "currency": "EUR 또는 KRW",
  "items": [
    {"name": "품목명", "amount": 금액},
    {"name": "품목명", "amount": 금액}
  ],
  "category": "식비, 교통, 쇼핑, 의료, 공과금, 주거, 문화, 기타 중 하나",
  "paymentMethod": "영수증에서 결제 수단 추출 - EC-Karte/Girocard면 debit, Visa/Mastercard면 credit, Bar/Cash면 cash, 없으면 null"
}

참고사항:
- 독일어/영어 영수증 모두 처리
- 날짜는 반드시 YYYY-MM-DD 형식으로 (예: 2026-04-20)
- 금액은 숫자만 (EUR나 € 기호 제외)
- category는 가게명을 보고 적절히 추측:
  * REWE, Edeka, Lidl, Aldi → 식비
  * DM, Rossmann → 쇼핑
  * Deutsche Bahn, 지하철 → 교통
  * Apotheke → 의료
- items는 최대 10개까지만 (많으면 주요 항목만)
- JSON만 반환 (백틱이나 마크다운 없이 순수 JSON)`
            }
          ]
        }]
      }),
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text || '';
    
    // JSON 추출 (백틱 제거)
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Receipt scan error:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestGet() {
  return new Response('Method not allowed', { status: 405 });
}
