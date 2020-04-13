<template>
  <q-select
    ref="input"
    key="field-autocomplete"
    options-selected-class="option-selected"
    bottom-slots
    v-bind:filled="!classicStyle"
    behavior="menu"
    use-input
    fill-input
    dense
    options-dense
    v-bind="$props"
    v-bind:hide-dropdown-icon="hideDropdownIcon"
    v-bind:class="classObj"
    v-bind:input-class="inputClassObj"
    v-bind:hide-selected="!multiple"
    v-bind:loading="loading"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-bind:hint="hintLabel"
    v-bind:clearable="!$q.platform.is.desktop"
    v-bind:options="visibleOptions"
    v-bind:use-chips="multiple"
    v-bind:input-debounce="inputDebounce"
    v-on:filter="filterFn"
    v-on:input="onInput"
    v-on:new-value="onNewValue"
    >
    <tooltip-description v-if="description">{{ description }}</tooltip-description>

    <template v-slot:append>
      <q-icon
        v-if="multiple && $refs.input && $refs.input.inputValue !== ''"
        class="cursor-pointer"
        name="check_circle"
        v-on:click.stop="addValue"
        v-bind:tabindex="-1"
        >
        <q-tooltip>Додати значення</q-tooltip>
      </q-icon>
    </template>
  </q-select>
</template>

<script>

  import DbInputMixin from '../mixins/db-input';
  import DbInputTargetMixin from '../mixins/db-input-target';
  import updateMenuMixin from '../mixins/update-menu';
  import TooltipDescription from './TooltipDescription';

  export default {
    name: 'DbInputAutocomplete',
    mixins: [DbInputMixin, DbInputTargetMixin, updateMenuMixin],
    components: {
      TooltipDescription
    },
    props: {
      dict: {
        type: [String, Array, Function],
        required: true
      },
      hideDropdownIcon: {
        type: Boolean,
        default: true
      },
      strict: Boolean,
      adviseOptions: Boolean,
      remote: Boolean,
      cascade: Boolean,
      inputDebounce: {
        type: [Number, String],
        default: '500'
      }
    },
    data() {
      return {
        visibleOptions: [],
        upperCase: true
      }
    },
    computed: {
      selectOptions() {
        return Array.isArray(this.dict) ? this.dict.map(obj => obj.value) : this.dictName && this.$store.getters.DICTS[`${this.dictName}&language=${this.language}`]
            ? this.$store.getters.DICT(`${this.dictName}&language=${this.language}`).map(obj => obj.value)
            : null;
      }
    },
    methods: {
      async filterFn(val, update, abort) {
        try {

          if (val.length < 1 && this.hideDropdownIcon && !this.adviseOptions) {
            return abort();
          }

          if (typeof this.dict === 'function') {
            const dict = await this.dict(val);
            return update(() => {
              this.visibleOptions = dict;
            });
          }

          if (this.remote) {
            const dict = await this.$api.dict.chunk(this.dictName, val);
            return update(() => {
              this.visibleOptions = dict.node ? dict.node.map(obj => obj.value) : null;
            });
          }

          if (!this.selectOptions) {
            await this.loadDict();
          }

          update(this.updateOptions(val));
        } catch (err) {
          console.error(err);
          abort();
        }
      },
      filtering(arr, val) {
        return arr.filter(v => v.toLowerCase().indexOf(val) === 0).concat(arr.filter(v => v.toLowerCase().indexOf(val) > 0));
      },
      updateOptions(val) {
        this.visibleOptions = val === '' ? this.selectOptions : this.filtering(this.selectOptions, val.toLowerCase());
      },
      onBlurTarget(evt) {
        if (evt.target.value === '') {
          this.$emit('input', null);
        } else if (this.value !== evt.target.value && !this.strict) {
          this.$emit('input', evt.target.value.toUpperCase());
        }
      }
    },
    created() {
      if (this.dictName && !this.remote && this.$store.getters.DICTS[`${this.dictName}&language=${this.language}`] === undefined) {
        this.$store.dispatch('SET_DICT', {name: `${this.dictName}&language=${this.language}`, node: null});
      }
    }
  }
</script>
