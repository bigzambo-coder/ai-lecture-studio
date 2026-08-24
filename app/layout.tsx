import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Lecture Studio",
  description: "강의 기획부터 PPT·워크북까지 연결하는 AI 제작 스튜디오",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
