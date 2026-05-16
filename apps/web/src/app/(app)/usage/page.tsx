import { AppHeader } from '@/components/AppHeader';

type UsageCard = { label: string; value: string; sub: string; bar: number; tone: 'blue' | 'amber' | 'orange' };

const CARDS: UsageCard[] = [
  { label: 'Sheets Processed', value: '437 / 1000', sub: '43.7% of monthly quota', bar: 43.7, tone: 'blue' },
  { label: 'AI Compute Hours', value: '12.4 hrs', sub: '+2.1h vs last month', bar: 62, tone: 'amber' },
  { label: 'Storage', value: '2.1 GB / 10GB', sub: '21% of total capacity', bar: 21, tone: 'orange' },
];

const BAR_COLOR: Record<UsageCard['tone'], string> = {
  blue: 'bg-blue-600',
  amber: 'bg-amber-500',
  orange: 'bg-orange-500',
};

export default function UsagePage() {
  return (
    <>
      <AppHeader title="Resource Usage" searchPlaceholder="Search…" />
      <div className="flex-1 overflow-auto p-6">
        <p className="mb-4 text-sm text-zinc-500">
          Current billing cycle: May 1 – May 31, 2026
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map((c) => (
            <div key={c.label} className="rounded-lg border border-zinc-200 bg-white p-4">
              <div className="text-[10px] font-medium tracking-wider text-zinc-500 uppercase">
                {c.label}
              </div>
              <div className="mt-1 font-mono text-2xl text-zinc-900">{c.value}</div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  className={`h-full rounded-full ${BAR_COLOR[c.tone]}`}
                  style={{ width: `${c.bar}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-zinc-500">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-zinc-900">Detection Volume (30 Days)</h2>
            <div className="flex overflow-hidden rounded border border-zinc-200 text-xs">
              <button className="bg-white px-2 py-1 text-zinc-600">7D</button>
              <button className="bg-zinc-50 px-2 py-1 font-medium text-blue-700">30D</button>
              <button className="bg-white px-2 py-1 text-zinc-600">YTD</button>
            </div>
          </div>
          <div className="grid h-44 grid-cols-30 items-end gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 30 + ((i * 17) % 60);
              return (
                <div
                  key={i}
                  className="w-full rounded-t bg-blue-100"
                  style={{ height: `${h}%` }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
