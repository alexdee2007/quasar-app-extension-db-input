<template>
  <q-select
    ref="input"
    key="field-select"
    option-value="key"
    option-label="value"
    options-selected-class="option-selected"
    bottom-slots
    v-bind:filled="!classicStyle"
    use-input
    fill-input
    dense
    behavior="menu"
    v-bind="$props"
    v-bind:options-dense="optionsDense"
    v-bind:class="classObj"
    v-bind:option-disable="notDisableOptions ? null : 'dsbl'"
    v-bind:hide-selected="!multiple"
    v-bind:value="option"
    v-bind:loading="loading"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-bind:clearable="!$q.platform.is.desktop"
    v-bind:options="visibleOptions"
    v-bind:use-chips="multiple"
    v-on:filter="filterFn"
    v-on:input="onInput"
    v-on:keydown="onKeydown"
    >

    <slot v-for="(_, name) in $slots" v-bind:name="name" v-bind:slot="name" />
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" >
        <q-item-section v-if="multiple && !(cascade && scope.opt.key.slice(-1) === '*')" side>
          <q-checkbox dense v-model="scope.selected" v-on:input="scope.toggleOption(scope.opt)" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ scope.opt.value }}</q-item-label>
          <q-item-label v-if="!rightStamp" caption>{{ scope.opt.stamp }}</q-item-label>
        </q-item-section>
        <q-item-section v-if="cascade && scope.opt.key.slice(-1) === '*'" side>
          <q-icon name="list" />
        </q-item-section>
        <q-item-section v-else-if="rightStamp" side>
          <q-item-label caption>{{ scope.opt.stamp }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template v-slot:no-option>
      <q-item dense>
        <q-item-section class="text-grey">Немає даних</q-item-section>
      </q-item>
    </template>
    <tooltip-description v-if="description">{{ description }}</tooltip-description>
  </q-select>
</template>

<script>

  import { find } from 'lodash';
  import { stopAndPrevent } from '../utils/events';
  import DbInputMixin from '../mixins/db-input';
  import DbInputTargetMixin from '../mixins/db-input-target';
  import TooltipDescription from './TooltipDescription';

  export default {
    name: 'DbInputSelect',
    mixins: [DbInputMixin, DbInputTargetMixin],
    components: {
      TooltipDescription
    },
    props: {
      dict: {
        type: [String, Array],
        required: true
      },
      optionsDense: {
        type: Boolean,
        default: true
      },
      filter: Function,
      filterOptions: Function,
      rightStamp: Boolean,
      cascade: Boolean,
      cascadeMixed: Boolean,
      notDisableOptions: Boolean,
      notNullable: Boolean,
      pref: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        visibleOptions: [],
        prepend: this.pref
      }
    },
    computed: {
      option() {
        return this.value === null || this.value === undefined ? null : this.multiple
            ? this.value.map(v => find(this.selectOptions, {key: v}) || {key: this.value, value: v})
            : find(this.selectOptions, {key: this.value}) || {key: this.value, value: this.value};
      },
      selectOptions() {
        let options = Array.isArray(this.dict) ? this.dict : this.$store.getters.DICTS[`${this.dictName}&language=${this.language}`]
            ? this.$store.getters.DICT(`${this.dictName}&language=${this.language}`)
            : null;
        return this.filterOptions ? options.filter(this.filterOptions) : options;

      },
      calculatedOptions() {
        if (!this.selectOptions) {
          return [];
        } else if (this.cascadeMixed) {
          return this.selectOptions.filter(opt => opt.key.indexOf(this.prepend.slice(0, -1)) === 0 && (opt.key.replace(/(\.\*)$/, '').split('.').length === this.prepend.split('.').length || opt.prepend === this.prepend));
        } else {
          const sanitizePrepend = this.prepend.replace(/(\*+)$/, '*'); // ipnp словари
          const ind = this.selectOptions.map(opt => opt.key.indexOf('*', sanitizePrepend.length)).filter(v => v !== -1);
          return this.selectOptions.filter(opt => opt.key.indexOf(sanitizePrepend.slice(0, -1)) === 0 && (ind.length ? opt.key.indexOf('*') === Math.min(...ind) : opt.key !== this.prepend));
        }
      }
    },
    methods: {
      onInput(val) {

        const key = this.multiple
            ? val.length ? val[val.length - 1].key : null
            : val === null ? null : val.key;

        if (this.cascade && key && key.slice(-1) === '*') {
          this.$refs.input.__resetInputValue();
          this.updateCascadeOptions(key);
        } else {
          this.$emit('input', this.multiple ? val.map(v => v.key) : key);
        }
      },
      updateCascadeOptions(key) {
        this.$refs.input.menu = false;
        this.prepend = key;
        this.updateOptions(this.option && this.option.value === this.$refs.input.inputValue ? '' : this.$refs.input.inputValue, true);
        this.$nextTick(() => {
          this.$refs.input.menu = true;
          this.$refs.input.__resetVirtualScroll(0);
          this.$refs.input.setOptionIndex(-1);
        });
      },
      async filterFn(val, update, abort) {
        try {
          this.prepend = this.pref;
          !this.selectOptions && await this.loadDict();
          update(this.updateOptions(val, this.pref !== ''));
        } catch (err) {
          console.error(err);
          abort();
        }
      },
      filtering(arr, val) {
        return arr.filter(v => v.value.toLowerCase().indexOf(val) === 0).concat(arr.filter(v => v.value.toLowerCase().indexOf(val) > 0)); // cверху совпадения в начале текста
      },
      updateOptions(val, calc) {
        const opts = this.cascade || calc ? this.calculatedOptions : this.selectOptions;
        this.visibleOptions = val === '' ? opts : this.filter ? this.filter(opts, val.toLowerCase()) : this.filtering(opts, val.toLowerCase());
      },
      onKeydown(evt) {
        if (evt.keyCode === 9 && this.multiple !== true) {
          this.onBlurTarget(evt);
        }
      },
      onBlurTarget(evt) {
        if (!this.notNullable && evt.target.value === '' && this.value !== null) {
          this.$nextTick(() => {
            this.$emit('input', null)
          });
        }
      }
    },
    mounted() {
      if (!this.selectOptions) {
        const unwatch = this.$watch('value', (val) => {
          val !== null && this.loadDict();
        }, {immediate: true});
        unwatch();
      }

    },
    created() {
      if (this.dictName && this.$store.getters.DICTS[`${this.dictName}&language=${this.language}`] === undefined) {
        this.$store.dispatch('SET_DICT', {name: `${this.dictName}&language=${this.language}`, node: null});
      }
    }
  }
</script>
<style>

  .q-field__bottom {
    padding: 1px 12px;
  }

  .q-chip--dense {
    height: auto;
    margin-bottom: 0px;
  }

  .q-chip__content  {
    white-space: normal;
  }

  .q-field__append {
    height: auto !important;
  }

  .q-select .q-field__input {
    text-transform: uppercase;
  }

  .option-selected {
    background-color: transparent;
  }

</style>
