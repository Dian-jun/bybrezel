type ReceiptPayload = {
  restaurant: {
    name: string;
    address: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    steuer_number: string | null;
    iban: string | null;
  };
  order: {
    id: string;
    guest_name: string | null;
    guest_email: string;
    table_name: string;
    created_at: string;
    items: Array<{
      name: string;
      variantName: string | null;
      quantity: number;
      unitPriceCents: number;
    }>;
  };
};

export async function sendReceiptEmail(payload: ReceiptPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RECEIPT_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    return { sent: false as const, reason: "missing-config" as const };
  }

  const totalCents = payload.order.items.reduce(
    (sum, item) => sum + item.unitPriceCents * item.quantity,
    0
  );

  const itemHtml = payload.order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;">${item.name}${item.variantName ? ` · ${item.variantName}` : ""}</td><td style="padding:8px 0;text-align:center;">${item.quantity}</td><td style="padding:8px 0;text-align:right;">${(item.unitPriceCents * item.quantity / 100).toFixed(2)} EUR</td></tr>`
    )
    .join("");

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;color:#111827;">
      <h1 style="margin:0 0 8px;">${payload.restaurant.name}</h1>
      <p style="margin:0 0 16px;color:#6b7280;">Bestellbestätigung / 주문 확인</p>
      <p style="margin:0 0 8px;">Tisch: ${payload.order.table_name}</p>
      <p style="margin:0 0 8px;">Bestellung: ${payload.order.id}</p>
      <p style="margin:0 0 24px;">Zeit: ${new Date(payload.order.created_at).toLocaleString()}</p>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Artikel</th>
            <th style="text-align:center;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Menge</th>
            <th style="text-align:right;border-bottom:1px solid #e5e7eb;padding-bottom:8px;">Preis</th>
          </tr>
        </thead>
        <tbody>${itemHtml}</tbody>
      </table>
      <p style="margin:24px 0 8px;font-size:18px;font-weight:600;">Gesamt: ${(totalCents / 100).toFixed(2)} EUR</p>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="margin:0 0 6px;">Adresse: ${payload.restaurant.address ?? "-"}</p>
      <p style="margin:0 0 6px;">Steuernummer: ${payload.restaurant.steuer_number ?? "-"}</p>
      <p style="margin:0 0 6px;">IBAN: ${payload.restaurant.iban ?? "-"}</p>
      <p style="margin:0;">Kontakt: ${payload.restaurant.contact_email ?? "-"} / ${payload.restaurant.contact_phone ?? "-"}</p>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: fromEmail,
      to: payload.order.guest_email,
      subject: `${payload.restaurant.name} - Bestellbestätigung`,
      html
    })
  });

  return { sent: response.ok as boolean };
}
