'use client';
import { useEffect } from 'react';
import { useSettings, PageKey } from '@/contexts/SettingsContext';

/** 서버 컴포넌트 페이지에서도 관리자 패널의 편집 대상 페이지를 동기화하기 위한 클라이언트 브릿지 */
export default function PageKeySync({ page }: { page: PageKey }) {
  const { setActivePage } = useSettings();
  useEffect(() => { setActivePage(page); }, [page, setActivePage]);
  return null;
}
