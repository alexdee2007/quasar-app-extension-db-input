import Vue from 'vue';
import { get, findLastIndex } from 'lodash';

const makeWatcher = (property) => {
  return {
    handler(val, oldVal) {
      for (const attr in oldVal) {
        if (!Object.prototype.hasOwnProperty.call(val, attr)) {
          this.$delete(this.$data[property], attr)
        }
      }
      for (const attr in val) {
        this.$set(this.$data[property], attr, val[attr])
      }
    },
    immediate: true
  }
}

export default {
  inject: {
    form: {default: false}
  },
  data() {
    return {
      attrs$: {},
      listeners$: {},
    }
  },
  watch: {
    $attrs: makeWatcher('attrs$'),
    $listeners: makeWatcher('listeners$')
  },
  computed: {
    $path() {
      return this.$vnode.data.model.expression.split('.');
    },
    $fieldName() {
      return this.$path.slice(this.$modelIndex + 1).join('.');
    },
    $field() {
      return this.$model ? this.$model.$getField(this.$fieldName) : {};
    },
    $modelIndex() {
      return findLastIndex(this.$path.slice(0, -1), (v, i, o) => get(this.form, o.slice(0, i + 1).join('.')) instanceof Vue);
    },
    $model() {
      return get(this.form, this.$path.slice(0, this.$modelIndex + 1).join('.'));
    },
    $validate() {
      return this.$model ? get(this.$model.$validate, this.$fieldName) : {};
    }
  },

  render(createElement) {

    const attrs = {
      type: this.$field.type,
      validate: this.$validate,
      label: this.$field.label,
      dict: this.$field.dict,
      pref: this.$field.pref,
      language: this.$field.language,
      description: this.$field.description,
      upperCase: this.$field.upperCase,
      multiple: this.$field.multiple,
      cascade: this.$field.cascade,
      remote: this.$field.remote,
      model: this.$field.model,
      field: this.$field,
      ...this.attrs$
    }

    const dbInputElement = attrs.type === 'select' ? 'db-input-select'
        : attrs.type === 'autocomplete' ? 'db-input-autocomplete'
        : attrs.type === 'address' ? 'db-input-address'
        : ['date', 'datetime'].includes(attrs.type) ? 'db-input-date'
        : attrs.type === 'model' ? 'db-input-model'
        : attrs.type === 'upload' ? 'db-input-upload'
        : attrs.type === 'models' ? 'db-input-models'
        : 'db-input-text';


    const children = Object.keys(this.$slots).map(slot => createElement('template', {slot}, this.$slots[slot]));
    console.log('RENDER ', this.$path);
    return createElement(dbInputElement, {attrs, on: this.listeners$, scopedSlots: this.$scopedSlots}, children);

  }

}
