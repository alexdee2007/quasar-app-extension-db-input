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

export const messages = {
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
