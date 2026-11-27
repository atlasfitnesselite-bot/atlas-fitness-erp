export const PT_SLOT_MINUTES = 85; // 1 hour 25 minutes per session

export const PT_PRESET_SLOTS = [
  '06:00',
  '07:30',
  '09:00',
  '10:30',
  '12:00',
  '15:30',
  '17:00',
  '18:30',
  '20:00',
];

export function addMinutesToHHMM(hhmm, mins = PT_SLOT_MINUTES) {
  if (!hhmm || !hhmm.includes(':')) return '';
  const [h, m] = hhmm.split(':').map((n) => parseInt(n, 10) || 0);
  const total = (h * 60 + m + mins) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function formatTime12h(hhmm) {
  if (!hhmm || !hhmm.includes(':')) return hhmm || '';
  const [hStr, mStr] = hhmm.split(':');
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${mStr} ${suffix}`;
}

export function formatSlotRange(startHHMM, endHHMM) {
  if (!startHHMM) return 'Slot not set';
  const end = endHHMM || addMinutesToHHMM(startHHMM, PT_SLOT_MINUTES);
  return `${formatTime12h(startHHMM)} - ${formatTime12h(end)} (1h 25m)`;
}
