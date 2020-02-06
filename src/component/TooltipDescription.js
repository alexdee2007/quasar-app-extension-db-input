import { QTooltip } from 'quasar';

export default {
  functional: true,
  render(createElement, context) {
    context.data.attrs = {delay: 1000, anchor: 'top left', self: 'top left', offset: [0, 10]};
    return createElement(QTooltip, context.data, context.children);
  }
}
