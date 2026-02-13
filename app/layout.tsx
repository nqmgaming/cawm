import type { Metadata } from "next";
import { Fredoka, Quicksand, Caveat } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Come Along With Me 💛",
  description:
    "mình có một vòng nhạc muốn gửi cho bạn. Nghe cùng mình chút nhé?",
  openGraph: {
    title: "Come Along With Me 💛",
    description: "mình có một vòng nhạc muốn gửi cho bạn.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${fredoka.variable} ${quicksand.variable} ${caveat.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
