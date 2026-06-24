import type { Metadata } from "next";
import { cookies } from "next/headers";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bybrezel.com"),
  title: {
    default: "Brezel Order",
    template: "%s | Brezel Order"
  },
  description:
    "QR ordering for German restaurants. Accept orders faster, reduce wait time, and support staff with a mobile-first workflow."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("brezel-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang="de" data-theme={theme}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cal+Sans&family=Calistoga&family=Libre+Baskerville:ital@0;1&family=Marcellus&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
