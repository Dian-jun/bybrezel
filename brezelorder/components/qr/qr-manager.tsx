"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

type TableRecord = {
  id: string;
  name: string;
  code: string;
};

async function buildTableQrCard(url: string, tableLabel: string, size: number) {
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: size,
    color: {
      dark: "#111827",
      light: "#FFFFFF"
    }
  });

  const image = new Image();
  image.src = qrDataUrl;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return qrDataUrl;

  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, size, size);
  context.drawImage(image, 0, 0, size, size);

  const badgeSize = Math.round(size * 0.2);
  const badgeX = (size - badgeSize) / 2;
  const badgeY = (size - badgeSize) / 2;
  const radius = Math.round(badgeSize * 0.18);

  context.fillStyle = "#FFFFFF";
  context.beginPath();
  context.roundRect(
    badgeX - size * 0.018,
    badgeY - size * 0.018,
    badgeSize + size * 0.036,
    badgeSize + size * 0.036,
    radius
  );
  context.fill();

  context.fillStyle = "#111111";
  context.beginPath();
  context.roundRect(badgeX, badgeY, badgeSize, badgeSize, radius);
  context.fill();

  context.fillStyle = "#FFFFFF";
  context.font = `700 ${Math.round(badgeSize * 0.48)}px Inter, Arial, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(tableLabel, size / 2, size / 2 + 1);

  return canvas.toDataURL("image/png");
}

export function QrManager({
  slug,
  tables,
  appUrl,
  locale
}: {
  slug: string;
  tables: TableRecord[];
  appUrl: string;
  locale: Locale;
}) {
  const [images, setImages] = useState<Record<string, string>>({});
  const qrEntries = useMemo(
    () =>
      tables.map((table) => ({
        ...table,
        url: `${appUrl}/r/${slug}/table/${table.code}`
      })),
    [appUrl, slug, tables]
  );

  useEffect(() => {
    let cancelled = false;

    async function buildImages() {
      const pairs = await Promise.all(
        qrEntries.map(async (entry) => [
          entry.id,
          await buildTableQrCard(entry.url, entry.name, 512)
        ])
      );

      if (!cancelled) {
        setImages(Object.fromEntries(pairs));
      }
    }

    buildImages();

    return () => {
      cancelled = true;
    };
  }, [qrEntries]);

  async function downloadSingle(url: string, tableName: string) {
    const dataUrl = await buildTableQrCard(url, tableName, 720);

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${tableName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
    link.click();
  }

  async function downloadPdf() {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    let y = 18;
    let x = 15;

    for (let i = 0; i < qrEntries.length; i += 1) {
      const entry = qrEntries[i];
      const qrDataUrl = await buildTableQrCard(entry.url, entry.name, 420);

      pdf.setDrawColor(229, 231, 235);
      pdf.roundedRect(x, y, 85, 65, 6, 6);
      pdf.setFontSize(16);
      pdf.text(entry.name, x + 8, y + 12);
      pdf.setFontSize(9);
      pdf.text(
        locale === "ko" ? "스캔해서 Brezel Order 열기" : "Scannen und Brezel Order öffnen",
        x + 8,
        y + 18
      );
      pdf.addImage(qrDataUrl, "PNG", x + 8, y + 22, 32, 32);
      pdf.setFontSize(8);
      pdf.text(entry.url, x + 8, y + 58, { maxWidth: 70 });

      x += 95;
      if (x > 110) {
        x = 15;
        y += 75;
      }

      if (y > 230 && i < qrEntries.length - 1) {
        pdf.addPage();
        x = 15;
        y = 18;
      }
    }

    pdf.save(`brezel-order-${slug}-qr-sheet.pdf`);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={downloadPdf}>
          {locale === "ko" ? "인쇄용 PDF 다운로드" : "Druckbares PDF herunterladen"}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {qrEntries.map((entry) => (
          <div key={entry.id} className="surface p-5">
            <p className="text-lg font-semibold">{entry.name}</p>
            <p className="mt-2 text-xs text-stone-500">{entry.url}</p>
            <div className="mt-4 rounded-3xl border border-line bg-stone-50 p-4">
              {/* Using an external QR canvas keeps generation client-side for easy downloads. */}
              <img
                alt={`QR code for ${entry.name}`}
                className="mx-auto h-48 w-48 rounded-2xl bg-white p-3"
                src={images[entry.id]}
              />
            </div>
            <div className="mt-4">
              <Button fullWidth onClick={() => downloadSingle(entry.url, entry.name)}>
                {locale === "ko" ? "PNG 다운로드" : "PNG herunterladen"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
