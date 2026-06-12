'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AtmosphereEffect from '@/components/ui/AtmosphereEffect';
import StepIndicator from '@/components/create/StepIndicator';
import Step1Guest from '@/components/create/Step1Guest';
import Step2Prescription from '@/components/create/Step2Prescription';
import Step3Ending from '@/components/create/Step3Ending';
import Step4Publish from '@/components/create/Step4Publish';
import { generateCardConfig } from '@/lib/cardVisual';
import { EraType } from '@/types';
import { Archive } from 'lucide-react';

import { PersonaState, Prescription } from '@/types';

const INITIAL_PERSONA: PersonaState = {
  name: '', gender: 'yin', ageGroup: 'adult', job: '', category: '',
};
const INITIAL_PRESCRIPTION: Partial<Prescription> = {
  original: '', name: '', visual: '', ingredients: '', effect: '', price: '',
  desire_code: '①', price_code: 'A', scale: '個',
};

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [era, setEra] = useState<EraType>('joseon');
  const [persona, setPersona] = useState<PersonaState>(INITIAL_PERSONA);
  const [prescription, setPrescription] = useState<Partial<Prescription>>(INITIAL_PRESCRIPTION);
  const [desireContent, setDesireContent] = useState('');
  const [endingTone, setEndingTone] = useState<'warm' | 'cold' | 'open' | ''>('');
  const [endingContent, setEndingContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  const handlePublish = async () => {
    setSaveStatus('saving');
    try {
      const cfg = generateCardConfig(prescription.desire_code ?? '①', era, endingTone || 'open');
      const body = {
        guest_name: persona.name || '익명의 손님',
        guest_status: persona.job,
        era,
        desire_type: prescription.desire_code ?? '①',
        desire_content: desireContent,
        confection_original: prescription.original ?? '',
        confection_name: prescription.name ?? '',
        confection_ingredients: prescription.ingredients ?? '',
        confection_effect: prescription.effect ?? '',
        confection_price: prescription.price ?? '',
        ending_content: endingContent,
        ending_tone: endingTone || 'open',
        card_visual_config: cfg,
      };
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setSaveStatus(data.error ? 'failed' : 'saved');
    } catch {
      setSaveStatus('failed');
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-[#E5E5E5] font-serif overflow-hidden">
      <AtmosphereEffect />

      {/* 네비 */}
      <nav className="fixed top-0 left-0 right-0 z-30 flex justify-between items-center px-6 md:px-12 h-16 bg-transparent">
        <Link href="/?intro=1" className="flex items-center gap-3 hover:opacity-80 transition-all">
          <div className="w-7 h-7 bg-[#C9A84C] rotate-45 flex items-center justify-center">
            <div className="w-3.5 h-3.5 bg-black rotate-[-45deg] flex items-center justify-center font-serif text-[8px] text-[#C9A84C] font-bold">奇</div>
          </div>
          <span className="text-base font-serif italic tracking-tight text-white">Gimyodang <span className="text-xs text-[#C9A84C] font-light not-italic">奇妙堂</span></span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] font-sans">
          <Link href="/gallery" className="text-white/40 hover:text-[#C9A84C] transition-colors flex items-center gap-1">
            <Archive className="w-3.5 h-3.5" /><span>갤러리</span>
          </Link>
          <Link href="/visit" className="text-white/40 hover:text-[#C9A84C] transition-colors">손님 모드</Link>
        </div>
      </nav>

      <main className="relative z-10 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8 space-y-2">
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#C9A84C] font-sans font-bold">이야기 창작 모드</p>
            <h1 className="text-2xl font-serif text-white">그대 손님의 이야기를<br /><span className="text-[#C9A84C]">기묘당 궤짝에 봉인하시오</span></h1>
          </div>

          <StepIndicator currentStep={step} totalSteps={4} />

          <div className="mt-8">
            {step === 1 && (
              <Step1Guest
                era={era}
                persona={persona}
                onChange={(p) => { setPersona(p); if (p.category !== era) setEra(p.category as EraType || era); }}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step2Prescription
                prescription={prescription}
                desireContent={desireContent}
                onDesireContentChange={setDesireContent}
                onChange={setPrescription}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3Ending
                endingContent={endingContent}
                endingTone={endingTone}
                onContentChange={setEndingContent}
                onToneChange={setEndingTone}
                onNext={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step4Publish
                guestName={persona.name}
                confectionName={prescription.name ?? ''}
                endingTone={endingTone}
                status={saveStatus}
                onPublish={handlePublish}
                onBack={() => setStep(3)}
                onGoGallery={() => router.push('/gallery')}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
