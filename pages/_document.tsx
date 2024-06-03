import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full">
      <Head />
      <body className="bg-background font-sans antialiased h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
