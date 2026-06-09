export type CalendarDay = {
  key: string;
  weekday: string;
  day: string;
  month: string;
  date: Date;
};

const weekdayLabels = {
  uz: ["Yak", "Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
} as const;

const monthLabels = {
  uz: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  ru: ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"],
} as const;

type DateLocale = keyof typeof weekdayLabels;

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function generateYearDates(year: number, locale: DateLocale = "uz"): CalendarDay[] {
  const dates: CalendarDay[] = [];
  const cursor = new Date(year, 0, 1);

  while (cursor.getFullYear() === year) {
    const date = new Date(cursor);

    dates.push({
      key: toDateKey(date),
      weekday: weekdayLabels[locale][date.getDay()],
      day: String(date.getDate()),
      month: monthLabels[locale][date.getMonth()],
      date,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function formatDisplayDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  if (!year || !month || !day) {
    return "Bugun";
  }

  return `${monthLabels.uz[month - 1]} ${day}`;
}
