'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { uraFiscalFunBanner } from '@/images';
import { triggerHapticFeedback } from '@/utils/ui';
import { LEARN_CATEGORY_DEFAULTS } from '@/data/learn-defaults';
import { useToast } from '@/contexts/ToastContext';

type LearnCategory = {
  id: string;
  slug: string;
  title: string;
  icon: string;
  summary: string;
  topics: string[];
  lessons: Array<{ title: string; content: string }>;
  sortOrder?: number;
  enabled?: boolean;
};

const FALLBACK_CATEGORIES: LearnCategory[] = LEARN_CATEGORY_DEFAULTS.map((x) => ({
  id: x.slug,
  slug: x.slug,
  title: x.title,
  icon: x.icon,
  summary: x.summary,
  topics: x.topics,
  lessons: x.lessons,
  sortOrder: x.sortOrder,
  enabled: x.enabled ?? true,
}));

export default function Learn() {
  const showToast = useToast();
  const [categories, setCategories] = useState<LearnCategory[]>(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/learn/categories');
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load');
        if (cancelled) return;
        const next = (Array.isArray(data?.categories) ? data.categories : []).map((x: any) => ({
          id: String(x.id ?? x.slug ?? ''),
          slug: String(x.slug ?? x.id ?? ''),
          title: String(x.title ?? 'Untitled'),
          icon: String(x.icon ?? 'i'),
          summary: String(x.summary ?? ''),
          topics: Array.isArray(x.topics) ? x.topics.map((t: unknown) => String(t)) : [],
          lessons: Array.isArray(x.lessons) ? x.lessons.map((l: any) => ({ title: String(l?.title ?? 'Lesson'), content: String(l?.content ?? '') })) : [],
          sortOrder: Number(x.sortOrder ?? 0),
          enabled: x.enabled !== false,
        }));
        setCategories(next.length > 0 ? next : FALLBACK_CATEGORIES);
      } catch {
        if (!cancelled) showToast('Using offline learn content fallback', 'error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const selectedCategory = useMemo(
    () => categories.find((x) => x.id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId]
  );

  return (
    <div className="bg-[#0f3c86] min-h-screen pb-24">
      <div className="px-4 pt-4">
        <h1 className="text-white text-2xl font-bold tracking-tight">Tax Education</h1>
        <p className="text-blue-100 text-sm mt-1">Choose a sector card to open full-screen learning content.</p>

        <div className="mt-3 rounded-xl overflow-hidden border border-[#3f6db5]">
          <Image
            src={uraFiscalFunBanner}
            alt="Tax education banner"
            width={1024}
            height={682}
            className="w-full h-24 object-cover"
            sizes="(max-width: 576px) 100vw, 576px"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setSelectedCategoryId(category.id);
              }}
              className="rounded-xl border border-[#8bb4ef]/35 bg-[#f4f8ff] px-3 py-3 text-left hover:border-[#f3ba2f] transition-colors"
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-[#dbe9ff] text-[10px] font-bold uppercase text-[#204887]">
                  {category.icon}
                </span>
                <p className="text-[#16427f] text-[15px] leading-tight font-semibold">{category.title}</p>
              </div>
            </button>
          ))}
        </div>
        {loading ? <p className="mt-3 text-xs text-blue-100">Loading live learn content...</p> : null}
      </div>

      {selectedCategory ? (
        <div className="fixed inset-0 z-50 bg-[#0b1220] text-white overflow-auto">
          <div className="sticky top-0 bg-[#0b1220]/95 backdrop-blur border-b border-[#25324c] px-4 py-3 flex items-center justify-between">
            <h2 className="font-bold text-lg">{selectedCategory.title}</h2>
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback(window);
                setSelectedCategoryId(null);
              }}
              className="rounded-lg border border-[#3b4a6b] px-3 py-1.5 text-sm text-gray-200 hover:border-[#f3ba2f]"
            >
              Close
            </button>
          </div>

          <div className="px-4 py-4 space-y-4">
            <div className="rounded-xl border border-[#2e3d5f] bg-[#141f35] p-4">
              <p className="text-sm text-gray-200 leading-relaxed">{selectedCategory.summary}</p>
            </div>

            <div className="rounded-xl border border-[#2e3d5f] bg-[#141f35] p-4">
              <h3 className="font-semibold text-white">What you will learn</h3>
              <ul className="mt-2 space-y-2">
                {selectedCategory.topics.map((topic) => (
                  <li key={topic} className="text-sm text-gray-200 flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#f3ba2f] flex-shrink-0" />
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-[#2e3d5f] bg-[#141f35] p-4">
              <h3 className="font-semibold text-white">Lessons</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                {(selectedCategory.lessons?.length ? selectedCategory.lessons : [{ title: 'Quick guide', content: 'Content will be added by admin.' }]).map((lesson, idx) => (
                  <div key={`${lesson.title}-${idx}`} className="rounded-lg border border-[#33476d] bg-[#0f1a2f] px-3 py-2 text-left">
                    <p className="text-sm font-semibold text-white">{lesson.title}</p>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed">{lesson.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
