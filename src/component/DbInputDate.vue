<template>
  <q-select
    v-if="multiple"
    type="text"
    ref="input"
    key="field-date-multiple"
    bottom-slots
    v-bind:filled="!classicStyle"
    use-input
    use-chips
    options-dense
    dense
    hide-dropdown-icon
    multiple
    v-bind="$props"
    v-bind:class="classObj"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-bind:hint="hintLabel"
    v-on:input="onInput"
    v-on:new-value="onNewValue"
    >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer" >
        <q-popup-proxy ref="dateProxy" transition-show="scale" transition-hide="scale">
          <q-date :value="inputValue" :mask="dateProxyMask" @input="onInputDateProxy"></q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
    <tooltip-description v-if="description">{{ description }}</tooltip-description>
  </q-select>
  <q-input
    v-else
    type="text"
    ref="input"
    key="field-date"
    bottom-slots
    v-bind:filled="!classicStyle"
    dense
    lazy-rules
    v-bind="$props"
    v-bind:class="[classObj, `db-input-${type}`]"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-bind:rules="[datetimeRule]"
    v-on:dblclick.native="onDblclick"
    v-on:input="onInput"
    >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="dateProxy" transition-show="scale" transition-hide="scale">
          <q-date :value="value" :mask="dateProxyMask" @input="onInputDateProxy"></q-date>
        </q-popup-proxy>
      </q-icon>

    </template>
    <tooltip-description v-if="description">{{ description }}</tooltip-description>
  </q-input>
</template>

<script>

  import moment from 'moment';
  import { truncDateString } from '../utils/strings';
  import DbInputMixin from '../mixins/db-input';
  import TooltipDescription from './TooltipDescription';

  moment.parseTwoDigitYear = function (year) {
    return parseInt(year) > parseInt(moment().format('YY')) ? parseInt(year) + 1900 : parseInt(year) + 2000;
  }

  export default {
    name: 'DbInputDate',
    mixins: [DbInputMixin],
    components: {
      TooltipDescription
    },
    props: {
      type: String,
    },
    data() {
      return {
        isMounted: false
      }
    },
    computed: {
      inputValue() {
        return this.isMounted ? this.$refs.input.inputValue : null;
      },
      dateProxyMask() {
        return this.type === 'datetime' ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY';
      }
    },
    methods: {
      datetimeRule(val) {
        return (val === null || val === '' || moment(val, this.type === 'datetime' ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY', true).isValid())
            || 'Невірний формат дати';
      },
      onDblclick() {
        this.$emit('input', moment().format(this.type === 'datetime' ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY'));
      },
      onInputDateProxy(val) {
        this.$refs.dateProxy.hide();
        if (this.multiple) {
          this.$refs.input.inputValue = val;
        } else {
          this.$emit('input', val);
        }
      },
      onInput(val) {
        this.$emit('input', this.multiple
            ? val.length ? val : null
            : val);
        !this.multiple && this.$refs.input.resetValidation();
      },
      autocompleteDate(val) {
        if (moment(val, this.type === 'datetime' ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY', true).isValid()) {
          return val;
        } else if (moment(val, 'DDMMYYYYHHmmss').isValid()) {
          val = moment(val, 'DDMMYYYYHHmmss').format(this.type === 'datetime' ? 'DD.MM.YYYY HH:mm:ss' : 'DD.MM.YYYY');
          return val;
        }
        return false;
      },
      onBlurInput(evt) {
        let value = this.autocompleteDate(evt.target.value);
        value !== false && this.$emit('input', value);
      },
      onBlurTarget(evt) {
        let value = this.autocompleteDate(evt.target.value);
        if (value !== false) {
          this.$refs.input.inputValue = value;
        }
      },
      onNewValue(val, done) {
        val = this.autocompleteDate(val);
        val !== false && done(val, 'add-unique');
      }
    },
    mounted() {

      if (this.type === 'date') {
        const unwatch = this.$watch('value', (val) => {
          if (val !== null && val !== undefined) {
            this.multiple
                ? this.onInput(val.map(v => truncDateString(v)))
                : this.onInput(truncDateString(val))
          }
        }, {immediate: true});
        unwatch();
      }

      this.isMounted = true;
      !this.multiple && this.$refs.input.$refs.input.addEventListener('blur', this.onBlurInput);
      this.multiple && this.$refs.input.$refs.target.addEventListener('blur', this.onBlurTarget);
    },
    beforeDestroy() {
      !this.multiple && this.$refs.input.$refs.input.removeEventListener('blur', this.onBlurInput);
      this.multiple && this.$refs.input.$refs.target.removeEventListener('blur', this.onBlurTarget);
    }
  }
</script>
<style>
  .db-input-date {
    width: 180px;
  }

  .db-input-datetime {
    width: 220px;
  }

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

  .q-field--float .q-field__label {
    width: 134%;
  }

</style>
