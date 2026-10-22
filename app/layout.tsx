import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '초록모아 · 가드닝 정보 공유', description: '사진으로 식물의 증상을 살펴보고 맞춤 관리법을 찾아보는 가드닝 커뮤니티.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
