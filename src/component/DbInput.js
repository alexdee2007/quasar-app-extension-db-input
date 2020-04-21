import Vue from 'vue';
import { get, findLastIndex } from 'lodash';

export default {
  inject: {
    form: {default: false}
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
      ...this.$attrs
    }

    const on = {
      ...this.$listeners
    }

    const dbInputElement = attrs.type === 'select' ? 'db-input-select'
        : attrs.type === 'autocomplete' ? 'db-input-autocomplete'
        : attrs.type === 'address' ? 'db-input-address'
        : ['date', 'datetime'].includes(attrs.type) ? 'db-input-date'
        : attrs.type === 'extended' ? 'db-input-extended'
        : attrs.type === 'upload' ? 'db-input-upload'
        : attrs.type === 'list' ? 'db-input-list'
        : 'db-input-text';

    return createElement(dbInputElement, {attrs, on}, this.$slots.default);

  }

}
