import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '초록모아 · 가드닝 정보 공유', description: '작은 새싹부터 나만의 정원까지. 함께 배우고 나누는 즐거운 가드닝 커뮤니티.' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="ko"><body>{children}</body></html>}
