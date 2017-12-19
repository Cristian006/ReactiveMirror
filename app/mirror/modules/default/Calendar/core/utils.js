import moment from 'moment';

export function getLocaleSpecification(timeFormat) {
  switch (timeFormat) {
    case 12:
      return { longDateFormat: { LT: 'h:mm A' } };
    case 24:
      return { longDateFormat: { LT: 'HH:mm' } };
    default:
      return { longDateFormat: { LT: moment.localeData().longDateFormat('LT') } };
  }
}
