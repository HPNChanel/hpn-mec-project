import type { LocaleInput } from '@fullcalendar/core';

export const viLocale: LocaleInput = {
  code: 'vi',
  buttonText: {
    prev: 'Trước',
    next: 'Tiếp',
    today: 'Hôm nay',
    month: 'Tháng',
    week: 'Tuần',
    day: 'Ngày',
    list: 'Danh sách'
  },
  weekText: 'T',
  allDayText: 'Cả ngày',
  moreLinkText: 'thêm',
  noEventsText: 'Không có sự kiện để hiển thị',
  
  dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true },
  
  // Vietnamese weekday names
  firstDay: 1, // Monday
  weekTextLong: 'Tuần',
  closeHint: 'Đóng',
  timeHint: 'Thời gian',
  eventHint: 'Sự kiện'
}; 