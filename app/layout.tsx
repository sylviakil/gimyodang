import type { Metadata } from 'next';
import './globals.css';
import { SettingsProvider } from '@/contexts/SettingsContext';
import AdminPanel from '@/components/ui/AdminPanel';

export const metadata: Metadata = {
  title: '기묘당 (奇妙堂) — 욕망을 처방하는 단과자 가게',
  description: '조선 단과자를 매개로 인간의 욕망을 거래하는 AI NPC 연화(蓮花)와 대화하세요.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <SettingsProvider>
          {children}
          <AdminPanel />
        </SettingsProvider>
      </body>
    </html>
  );
}
