import { isWeekend, format, subDays, getDay, addDays } from 'date-fns';

/**
 * Праздничные дни в РФ (фиксированные даты)
 */
const FIXED_HOLIDAYS = [
  '01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08',
  '02-23', // День защитника Отечества
  '03-08', // Женский день
  '05-01', // Праздник Весны и Труда
  '05-09', // День Победы
  '06-12', // День России
  '11-04', // День народного единства
];

// Фиксированные праздники, которые автоматически переносятся при совпадении с выходным (все кроме января)
const AUTO_TRANSFER_HOLIDAYS = [
  '02-23', '03-08', '05-01', '05-09', '06-12', '11-04'
];

/**
 * Переносы и спец. выходные (утвержденные Правительством РФ)
 * Если день является нерабочим из-за переноса (и это не автоперенос), добавляем его сюда.
 */
const EXTRA_HOLIDAYS: Record<string, boolean> = {
  // 2024
  '2024-04-29': true, '2024-04-30': true, '2024-05-10': true, '2024-12-30': true, '2024-12-31': true,
  // 2025
  '2025-05-02': true, '2025-05-08': true, '2025-06-13': true, '2025-11-03': true, '2025-12-31': true,
  '2027-02-22': true, '2027-11-05': true, '2026-12-31': true,
};

/**
 * Рабочие субботы/воскресенья (переносы)
 */
const WORKING_WEEKENDS: Record<string, boolean> = {
  // 2024
  '2024-04-27': true, '2024-11-02': true, '2024-12-28': true,
  // 2025
  '2025-11-01': true,
  // 2027
  '2027-02-20': true,
};

/**
 * Отмененные автоматические переносы 
 * (когда Правительство решило перенести праздник на другой месяц, вместо автопереноса на следующий рабочий день)
 */
const CANCELLED_AUTO_TRANSFERS: Record<string, boolean> = {
  // В 2025 году 23 февраля (вс) перенесено на 8 мая (чт)
  '2025-02-24': true,
  // В 2025 году 8 марта (сб) перенесено на 13 июня (пт)
  '2025-03-10': true,
};

/**
 * Переопределение предпраздничных (коротких) дней.
 * Используется, если короткий день перенесен (например, рабочая суббота стала короткой).
 */
const SHORT_DAYS_OVERRIDE: Record<string, boolean> = {
  '2024-11-02': true,
};

export const isPreHoliday = (date: Date): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  if (SHORT_DAYS_OVERRIDE[dateStr]) return true;

  if (getWorkDayType(date) !== 'work') return false;
  
  // Предпраздничный день — рабочий день, непосредственно предшествующий нерабочему праздничному дню
  const nextDay = addDays(date, 1);
  const nextMonthDay = format(nextDay, 'MM-dd');
  
  if (FIXED_HOLIDAYS.includes(nextMonthDay)) {
    return true;
  }
  
  return false;
};

export const getDailyNormConfig = (date: Date, strictMode: boolean = false): number => {
  const dayType = getWorkDayType(date);
  if (dayType === 'holiday' || dayType === 'weekend') return 0;
  
  const day = date.getDay(); 
  let requiredMinutes = 480;
  
  if (day >= 1 && day <= 4) requiredMinutes = 540; // 9h
  // Пятница (5) или рабочие выходные (0, 6) = 8h
  else requiredMinutes = 480; 
  
  if (isPreHoliday(date)) {
    requiredMinutes -= 60; // на 1 час короче
  }

  if (strictMode) {
    requiredMinutes -= 15; // льготный режим 15 минут
  }
  
  return Math.max(0, requiredMinutes);
};

/**
 * Проверяет, является ли день автоматически перенесенным выходным
 * (Согласно ст. 112 ТК РФ: при совпадении выходного и праздника выходной переносится на следующий рабочий день)
 */
const isAutoTransferredHoliday = (date: Date, dateStr: string): boolean => {
  if (CANCELLED_AUTO_TRANSFERS[dateStr]) return false;
  
  const dayOfWeek = getDay(date);
  
  // Автоперенос обычно происходит на понедельник, если праздник выпал на субботу или воскресенье
  if (dayOfWeek === 1) { // Понедельник
    const sundayStr = format(subDays(date, 1), 'MM-dd');
    const saturdayStr = format(subDays(date, 2), 'MM-dd');
    if (AUTO_TRANSFER_HOLIDAYS.includes(sundayStr) || AUTO_TRANSFER_HOLIDAYS.includes(saturdayStr)) {
      return true;
    }
  }
  // В очень редких случаях (или если суббота и воскресенье оба праздники) перенос может быть на вторник.
  // Но для текущих праздников (кроме января) подряд 2 дня не бывает.
  
  return false;
};

export const isHoliday = (date: Date): boolean => {
  return getWorkDayType(date) === 'holiday';
};

export const getWorkDayType = (date: Date): 'work' | 'holiday' | 'weekend' => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const monthDay = format(date, 'MM-dd');

  // 1. Проверка на рабочую субботу/воскресенье
  if (WORKING_WEEKENDS[dateStr]) return 'work';

  // 2. Проверка на фиксированные праздники
  if (FIXED_HOLIDAYS.includes(monthDay)) return 'holiday';

  // 3. Проверка на спец. переносы (Правительственные)
  if (EXTRA_HOLIDAYS[dateStr]) return 'holiday';

  // 4. Проверка на автоматический перенос
  if (isAutoTransferredHoliday(date, dateStr)) return 'holiday';

  // 5. Проверка на обычные выходные
  if (isWeekend(date)) return 'weekend';

  return 'work';
};
