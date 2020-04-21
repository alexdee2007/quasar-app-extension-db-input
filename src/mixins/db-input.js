import { get } from 'lodash';
import { getErrorLabel } from '../utils/validations';

export default {
  //inject: {
  //   form: {default: false}
  // },
  props: {
    value: [String, Array, Number, Object],
    rules: Array,
    validate: {
      type: Object,
      default: () => ({})
    },
    defaultValue: [String, Array],
    label: String,
    description: String,
    hint: String,
    stackLabel: {
      type: Boolean,
      default: true
    },
    mask: String,
    fillMask: [Boolean, String],
    reverseFillMask: Boolean,
    unmaskedValue: Boolean,
    tabindex: Number,
    disable: Boolean,
    readonly: Boolean,
    multiple: Boolean,
    autofocus: Boolean,
    fieldName: String,
    fieldPath: String,
    validatePath: String,
    classicStyle: Boolean,
    hideBottomSpace: Boolean,
    validation: Object,
    prefix: String,
    suffix: String,
    placeholder: String,
    inputStyle: [String, Array, Object],
    inputClass: [String, Array, Object],
    debounce: [String, Number],
    language: {
      type: String,
      default: 'UK'
    }
  },
  computed: {
    hintLabel() {
      return this.hint ? this.hint : this.multiple ? '«ENTER» для додавання' : undefined;
    },
    dictName() {
      return typeof this.dict === 'string' ? this.dict : undefined;
    },
    error() {
      return {state: this.validate.$error, label: getErrorLabel.call(this, this.validate)};
    },
    classObj() {
      return {
        'db-input': true,
        'db-input--description': this.description
      };
    },
    inputClassObj() {
      return {
        'text-uppercase': this.upperCase
      };
    }
  },
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    onInput(val) {
      this.$emit('input', this.multiple
          ? val.length ? val.map(v => this.upperCase ? v.toUpperCase() : v) : null
          : val && this.upperCase ? val.toUpperCase() : val);
    },
    onNewValue(val, done) {
      done(this.upperCase ? val.toUpperCase() : val, 'add-unique');
    },
    async loadDict() {
      try {
        this.loading = true;
        if (this.$refs.input.$refs.target && this.$refs.input.$refs.target.nodeName === 'INPUT') {
          this.$refs.input.$refs.target.readOnly = true;
        }
        await this.$store.dispatch('GET_DICT', `${this.dictName}&language=${this.language}`);
      } catch (err) {
        this.$q.notify({color: 'negative', timeout: 2500, html: true, multiLine: true, message: `<strong>Помилка завантаження довідника "${this.dictName}"</strong><br />${err.message}`, position: 'top', icon: 'error'});
      } finally {
        this.loading = false;
        if (this.$refs.input.$refs.target && this.$refs.input.$refs.target.nodeName === 'INPUT') {
          this.$refs.input.$refs.target.readOnly = false;
        }
      }
    },
    addValue() {
      this.$refs.input.add(this.upperCase ? this.$refs.input.inputValue.toUpperCase() : this.$refs.input.inputValue, true);
      this.$refs.input.updateInputValue('', true);
    }
  },
  mounted() {
    if (this.defaultValue !== undefined && (!this.value || this.value.length === 0)) {
      this.$nextTick(() => this.$emit('input', this.defaultValue));
    }
    this.$refs.input && this.$refs.input.$on('focus', (evt) => {
      this.$emit('focus', evt);
    });
    this.$refs.input && this.$refs.input.$on('blur', (evt) => {
      this.$emit('blur', evt);
    });
  },
  beforeDestroy() {
    this.$refs.input && this.$refs.input.$off();
  },
//  validations: {
//  }
}
