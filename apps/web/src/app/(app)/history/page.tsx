import { AppHeader } from '@/components/AppHeader';

type Row = {
  type: string;
  project: string;
  user: string;
  when: string;
  status: 'completed' | 'success' | 'logged' | 'failed' | 'processing';
};

const ROWS: Row[] = [
  { type: 'AI Detection Run', project: 'West Wing Expansion', user: 'System (Auto)', when: '2026-05-16 14:32:01', status: 'completed' },
  { type: 'Quantities Export', project: 'ICU Renovation Phase 2', user: 'Alex Smith', when: '2026-05-16 11:15:44', status: 'success' },
  { type: 'New Project Created', project: 'Outpatient Clinic', user: 'Maria Johnson', when: '2026-05-15 09:05:12', status: 'logged' },
  { type: 'Drawing Upload Failed', project: 'Pediatrics Wing', user: 'Alex Smith', when: '2026-05-15 16:45:00', status: 'failed' },
  { type: 'AI Detection Run', project: 'Pediatrics Wing', user: 'System (Auto)', when: '2026-05-15 16:50:22', status: 'processing' },
];

const STATUS_STYLE: Record<Row['status'], string> = {
  completed: 'bg-emerald-100 text-emerald-700',
  success: 'bg-emerald-100 text-emerald-700',
  logged: 'bg-zinc-100 text-zinc-700',
  failed: 'bg-rose-100 text-rose-700',
  processing: 'bg-amber-100 text-amber-700',
};

export default function HistoryPage() {
  return (
    <>
      <AppHeader title="Activity History" searchPlaceholder="Search activity..." />
      <div className="flex-1 overflow-auto p-6">
        <p className="mb-4 text-sm text-zinc-500">
          Complete log of all workspace events and automated processes.
        </p>
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <table className="w-full divide-y divide-zinc-200 text-sm">
            <thead className="bg-zinc-50 text-[10px] tracking-wider text-zinc-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Activity Type</th>
                <th className="px-4 py-2 text-left font-medium">Project</th>
                <th className="px-4 py-2 text-left font-medium">User</th>
                <th className="px-4 py-2 text-left font-medium">Date / Time</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {ROWS.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50">
                  <td className="px-4 py-2 font-medium text-zinc-900">{row.type}</td>
                  <td className="px-4 py-2 text-zinc-700">{row.project}</td>
                  <td className="px-4 py-2 text-zinc-700">{row.user}</td>
                  <td className="px-4 py-2 font-mono text-[13px] text-zinc-500">{row.when}</td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${STATUS_STYLE[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
