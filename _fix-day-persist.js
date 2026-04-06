const fs = require('fs');

const path = 'src/store/game-store.ts';
let content = fs.readFileSync(path, 'utf8');

// 1. Add loadDay/saveDay functions before "function loadCoins"
const dayFns = `
// Time Persistence: sync game day with real elapsed time
function loadDay(): number {
  if (typeof window === 'undefined') return getTodayDayOfYear();
  try {
    const savedDay = parseInt(localStorage.getItem('jardin-culture-day') || '', 10);
    const savedTs = parseInt(localStorage.getItem('jardin-culture-day-ts') || '', 10);
    if (isNaN(savedDay) || isNaN(savedTs)) return getTodayDayOfYear();
    const elapsedDays = Math.floor((Date.now() - savedTs) / 86_400_000);
    const bonusDays = Math.max(0, Math.min(elapsedDays, 30));
    return savedDay + bonusDays;
  } catch { return getTodayDayOfYear(); }
}

function saveDay(day: number) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('jardin-culture-day', String(day));
    localStorage.setItem('jardin-culture-day-ts', String(Date.now()));
  } catch { /* ignore */ }
}
`;

// Insert before "function loadCoins"
content = content.replace(/function loadCoins/, dayFns + '\nfunction loadCoins');

// 2. Replace default state day: getTodayDayOfYear() with loadDay()
content = content.replace(/day: getTodayDayOfYear\(\),/, 'day: loadDay(),');

// 3. Replace day: today, in initGame with loadDay()
content = content.replace(/day: today,/, 'day: loadDay(),');

// 4. Add saveDay(newDay); after day: newDay, in tick set()
content = content.replace(/(        day: newDay,)/, '$1\n        saveDay(newDay);');

// 5. Add day keys to fresh start cleanup
content = content.replace(/("jardin-culture-best-score",)/, '"jardin-culture-day",\n        "jardin-culture-day-ts",\n        $1');

fs.writeFileSync(path, content, 'utf8');
console.log('DONE: Day persistence added to game-store.ts');
