import moment from 'moment';
import { validationMessages } from 'src/utils/validators';

export const getErrorLabel = function (obj = this.validate) {
  if (!obj.$error) {
    return '';
  }
  if (obj.$each && obj.$each.$error) {
    return 'Містить помилки';
  }
  const key = Object.keys(obj).filter(key => key.charAt(0) !== "$").filter(key => !obj[key]).shift();
  return key ? messages[key](obj.$params[key]) : '';
}

export const date = (value) => {
  return value === null || value === '' || moment(value, 'DD.MM.YYYY', true).isValid();
}

export const datetime = (value) => {
  return value === null || value === '' || moment(value, 'DD.MM.YYYY HH:mm:ss', true).isValid();
}

export const isArray = (value) => {
  return value === undefined ? true : Array.isArray(value);
}

export const messages = {
  isArray: () => 'Має бути списком',
  date: () => 'Неверний формат дати',
  datetime: () => 'Неверний формат дати-часу',
  required: () => 'Необхідно заповнити',
  decimal: () => 'Некоректне число',
  email: () => 'Некоректний email',
  ipAddress: () => 'Некоректна IP-адреса',
  macAddress: () => 'Некоректна MAC-адреса',
  sameAsPassword: () => 'Паролі не співпадають',
  minLength: (params) => {
    return `Мінімум символів - ${params.min}`
  },
  maxLength: params => {
    return `Максимум символів - ${params.max}`
  },
  ...validationMessages,
}
