<template>

  <q-select
    ref="input"
    bottom-slots
    dense
    hide-dropdown-icon
    behavior="menu"
    v-bind="$props"
    :use-input="typeof filter === 'function'"
    :fill-input="typeof filter === 'function'"
    :hide-selected="typeof filter === 'function'"
    :class="classObj"
    :input-class="inputClassObj"
    :error="error.state"
    :error-message="error.label"
    :hint="hintLabel"
    option-value="optionId"
    :option-label="filterLabel"
    :options="visibleOptions"
    :filled="!classicStyle"
    :disable="disabled"
    :style="{opacity: 'initial !important'}"
    @filter="filterFn"
    @keyup.enter.native="dialog = true"
    @input="onInput"
    @mouseenter.native="mouseenter"
    @mouseleave.native="mouseleave"
    >

    <template v-slot:selected-item="scope">
      <span class="ellipsis">{{ value.$label }}</span>
    </template>

    <template v-slot:append>
      <q-icon
        v-if="(!$q.platform.is.desktop && !isEmpty && !disabled) || clearable"
        name="cancel"
        color="primary"
        size="sm"
        round
        class="cursor-pointer q-mr-xs"
        :tabindex="-1"
        @click="clearValue"
        />
      <q-btn dense icon="edit" color="primary" size="sm" :tabindex="-1" @click="dialog = true" :disable="disabled" />
    </template>

    <tooltip-description v-if="description">{{ description }}</tooltip-description>

    <q-dialog v-model="dialog" ref="dialog" :maximized="dialogMaximized" @show="onShow" @hide="onHide" persistent @before-hide="onBeforeHide">

      <q-layout v-if="dialogMaximized" ref="layout" container view="hhh lpr fff" class="bg-white">
        <db-form
          v-model="value"
          ref="form"
          :before-submit="beforeSubmit"
          :save-on-submit="saveOnSubmit"
          @submit="onSubmit"
          @reset="onReset"
          :autofocus="!inputValue"
          >
          <q-header reveal elevated>
            <slot name="header">
              <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{ label }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup :tabindex="-1" />
              </q-toolbar>
            </slot>
          </q-header>

          <q-page-container>
            <q-page padding>
              <component :is="component" v-bind="{[value.$options.name]: value, ...componentProps}" />
            </q-page>
          </q-page-container>

          <q-footer elevated>
            <slot name="footer">
              <q-toolbar class="bg-grey-9 text-white">
                <q-space />
                <q-btn v-if="showCancelButton" label="Скасувати" flat @click="value.$rollback" class="on-left" :disable="!value.$isChanged">
                  <q-tooltip v-if="value.$isChanged">Відмінити зміни</q-tooltip>
                </q-btn>
                <q-btn v-if="showResetButton" label="Очистити" type="reset" flat class="on-left" :disable="value.$isEmpty">
                  <q-tooltip v-if="!value.$isEmpty">Очистити форму</q-tooltip>
                </q-btn>
                <q-btn label="Застосувати" type="submit" color="primary" :disable="!value.$isChanged" :autofocus="inputValue">
                  <q-tooltip v-if="value.$isChanged"">Застосувати зміни</q-tooltip>
                </q-btn>
              </q-toolbar>
            </slot>
          </q-footer>
        </db-form>
      </q-layout>

      <q-card v-else style="max-width: 1280px;" :style="{width: dialogWidth}">

        <db-form
          v-model="value"
          ref="form"
          :before-submit="beforeSubmit"
          :save-on-submit="saveOnSubmit"
          @submit="onSubmit"
          @reset="onReset"
          :autofocus="!inputValue"
          >
          <slot name="header">
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>{{ label }}</q-toolbar-title>
              <q-btn flat round dense icon="close" v-close-popup :tabindex="-1" />
            </q-toolbar>
          </slot>

          <q-separator />

          <q-card-section>
            <component :is="component" v-bind="{[value.$options.name]: value, ...componentProps}" />
          </q-card-section>

          <q-separator />

          <slot name="footer">
            <q-toolbar class="bg-grey-9 text-white" style="z-index:9999;">
              <q-space />
              <q-btn v-if="showCancelButton" label="Скасувати" flat @click="value.$rollback()" class="on-left" :disable="!value.$isChanged">
                <q-tooltip v-if="value.$isChanged">Відмінити зміни</q-tooltip>
              </q-btn>
              <q-btn v-if="showResetButton" label="Очистити" type="reset" flat class="on-left" :disable="value.$isEmpty">
                <q-tooltip v-if="!value.$isEmpty">Очистити форму</q-tooltip>
              </q-btn>
              <q-btn label="Застосувати" type="submit" color="primary" :disable="!value.$isChanged" :autofocus="inputValue">
                <q-tooltip v-if="value.$isChanged">Застосувати зміни</q-tooltip>
              </q-btn>
            </q-toolbar>
          </slot>

        </db-form>

      </q-card>
    </q-dialog>

  </q-select>

</template>

<script>

  import { cloneDeep, isEqualWith } from 'lodash';
  import DbInputMixin from '../mixins/db-input';
  import TooltipDescription from './TooltipDescription';
  import { getErrorLabel } from '../utils/validators';
  import { filterId, equalBlank } from 'db-model/utils';

  export default {
    name: 'DbInputModel',
    mixins: [DbInputMixin],
    components: {
      TooltipDescription,
    },
    props: {
      component: [Function, Object],
      componentProps: {
        type: Object,
        default: () => ({})
      },
      value: Object,
      disabled: Boolean,
      showCancelButton: Boolean,
      showResetButton: {
        type: Boolean,
        default: true
      },
      beforeSubmit: Function,
      saveOnSubmit: Boolean,
      dialogWidth: {
        type: String,
        default: '1280px'
      },
      label: String,
      maximized: Boolean,
      filter: Function,
      filterLabel: {
        type: Function
      },
      model: Function,
      defaults: Object
    },

    computed: {
      dialogMaximized() {
        return this.maximized || this.$q.screen.lt.md
      },
      defaultVal() {
        return Object.assign(this.model.defaults(), this.defaults);
      },
      error() {
        return {
          state: !this.dialog && (this.validate.$error || this.value.$validate.$error),
          label: this.dialog ? '' : (this.value.$validate.$error ? 'Містить помилки' : getErrorLabel.call(this, this.validate))
        }
      },
      isEmpty() {
        return this.value.$options.state.active ? isEqualWith(filterId(this.defaultVal), filterId(this.value.$filteredJsonData), equalBlank) : true;
      }
    },
    data() {
      return {
        dialog: false,
        clearable: false,
        visibleOptions: [],
        inputValue: false
      }
    },
    methods: {
      onSubmit() {
        this.dialog = false;
      },
      onReset() {
        Object.assign(this.value.$data, this.defaultVal);
      },
      updateInputValue(val) {
        this.$refs.input.updateInputValue(this.filterLabel ? this.filterLabel(val) : val, true);
      },
      async onHide() {
        this.value.$parent && (this.value.$parent.$options.state.active = true);
        this.filter && this.updateInputValue(this.value.data);
        this.$emit('hide');
      },
      onBeforeHide() {
        this.value.$isChanged && this.value.$rollback();
      },
      async onShow() {
        this.value.$parent && (this.value.$parent.$options.state.active = false);
        this.$emit('show');
      },
      async filterFn(val, update, abort) {
        try {
          if (val.length < 1 || typeof this.filter === undefined) {
            return abort();
          }
          const options = await this.filter(val);
          return update(() => {
            this.visibleOptions = options;
          });
        } catch (err) {
          console.error(err);
        }
      },
      onInput(val) {
        Object.assign(this.value.$data, this.defaultVal, cloneDeep(val));
        this.inputValue = true;
        this.dialog = true;
      },
      clearValue() {
        this.value.$reset();
        Object.assign(this.value.$data, this.defaultVal);
        this.value.$commit();
        this.clearable = false;
      },
      mouseenter() {
        if (this.$q.platform.is.desktop && !this.isEmpty && !this.disabled) {
          this.clearable = true;
        }
      },
      mouseleave() {
        if (this.$q.platform.is.desktop) {
          this.clearable = false;
        }
      }
    },
    beforeCreate() {
      if (!this.$options.propsData.value) {
        const defaultValue = Object.assign(this.$options.propsData.model.defaults(), this.$options.propsData.defaults);
        const vm = new this.$options.propsData.model(defaultValue, this.$parent.$model);
        this.$set(this.$options.propsData, 'value', vm);
        this.$emit('input', vm);
        this.$parent.$model.$commit();
      }
    },
    mounted() {
      this.filter && this.$watch('value.data', val => this.updateInputValue(val), {deep: true, immediate: true});
    },
    beforeDestroy() {
      this.value.$parent && (this.value.$parent.$options.state.active = true);
    }
  }
</script>
