export default function getMondayFromWeekNum(week) {
  const months = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ];
  const today = new Date();
  const year = today.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const dayOfWeek = firstDayOfYear.getDay();
  const dayOffset = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  const firstMonday = new Date(year, 0, 1 + dayOffset);
  const mondayDate = new Date(
    firstMonday.setDate(firstMonday.getDate() + (week - 1) * 7)
  );

  const day = mondayDate.getDate();
  const month = months[mondayDate.getMonth()];

  return `${day} ${month}`;
}
