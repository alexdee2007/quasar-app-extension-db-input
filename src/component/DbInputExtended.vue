<template>

  <q-select
    ref="input"
    bottom-slots
    dense
    hide-dropdown-icon
    behavior="menu"
    v-bind="$props"
    :tabindex="typeof filter === 'function' ? '-1': '0'"
    :use-input="typeof filter === 'function'"
    :fill-input="typeof filter === 'function'"
    :hide-selected="typeof filter === 'function'"
    :class="classObj"
    :error="error.state"
    :error-message="error.label"
    :hint="hintLabel"
    option-value="optionId"
    :option-label="displayedValue"
    :options="visibleOptions"
    :filled="!classicStyle"
    @filter="filterFn"
    @keyup.enter.native="dialog = true"
    @input="onInput"
    @mouseenter.native="mouseenter"
    @mouseleave.native="mouseleave"
    >

    <template v-slot:selected-item="scope">
      <span class="ellipsis">{{ isEmpty ? '' : displayedValue(scope.opt) }}</span>
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
      <q-btn dense icon="edit" color="primary" size="sm" :tabindex="-1" @click="dialog = true" :disabled="disabled" />
    </template>

    <tooltip-description v-if="description">{{ description }}</tooltip-description>

    <q-dialog v-model="dialog" ref="dialog" :maximized="dialogMaximized" @show="onShow" @hide="onHide" @before-show="isDirty = validate ? validate.$dirty: false">

      <q-layout v-if="dialogMaximized" ref="layout" container view="hhh lpr fff" class="bg-white">
        <db-form
          :model-name="modelName"
          :value.sync="data"
          :initial-value="initialValue"
          :is-dirty="isDirty"
          ref="form"
          @submit="onSubmit"
          >
          <q-header elevated >
            <slot name="header">
              <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{ label }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup />
              </q-toolbar>
            </slot>
          </q-header>

          <q-page-container>
            <q-page padding>
              <slot :data="data"></slot>
            </q-page>
          </q-page-container>

          <q-footer elevated>
            <slot name="footer">
              <q-toolbar class="bg-grey-9 text-white fixed-bottom" style="z-index:9999;">
                <q-space />
                <q-btn v-if="showCancelButton" label="Відмінити" flat @click="cancel" class="on-left" :disable="$refs.form && $refs.form.notChanged">
                  <q-tooltip>Відмінити зміни</q-tooltip>
                </q-btn>
                <q-btn v-if="showResetBuuton" label="Очистити" type="reset" flat class="on-left" :disable="$refs.form && $refs.form.isEmpty">
                  <q-tooltip>Очистити форму</q-tooltip>
                </q-btn>
                <q-btn label="Застосувати" type="submit" color="primary" :disable="$refs.form && $refs.form.notChanged">
                  <q-tooltip>Застосувати зміни</q-tooltip>
                </q-btn>
              </q-toolbar>
            </slot>
          </q-footer>
        </db-form>
      </q-layout>

      <q-card v-else style="max-width: 1280px;" :style="layoutStyle">

        <db-form
          :model-name="modelName"
          :value.sync="data"
          :initial-value="initialValue"
          :is-dirty="isDirty"
          ref="form"
          @submit="onSubmit"
          >
          <slot name="header">
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>{{ label }}</q-toolbar-title>
              <q-btn flat round dense icon="close" v-close-popup />
            </q-toolbar>
          </slot>

          <q-separator />

          <q-card-section>

            <slot :data="data"></slot>

          </q-card-section>

          <q-separator />

          <slot name="footer">
            <q-toolbar class="bg-grey-9 text-white" style="z-index:9999;">
              <q-space />
              <q-btn v-if="showCancelButton" label="Скасувати" flat @click="cancel" class="on-left" :disable="$refs.form && $refs.form.notChanged">
                <q-tooltip>Відмінити зміни</q-tooltip>
              </q-btn>
              <q-btn v-if="showResetBuuton" label="Очистити" type="reset" flat class="on-left" :disable="$refs.form && $refs.form.isEmpty">
                <q-tooltip>Очистити форму</q-tooltip>
              </q-btn>
              <q-btn label="Застосувати" type="submit" color="primary" :disable="$refs.form && $refs.form.notChanged">
                <q-tooltip>Застосувати зміни</q-tooltip>
              </q-btn>
            </q-toolbar>
          </slot>

        </db-form>
      </q-card>
    </q-dialog>

  </q-select>

</template>

<script>

  import { get, has, merge, cloneDeep } from 'lodash';
  import DbInputMixin from '../mixins/db-input';
  import TooltipDescription from './TooltipDescription';

  export default {
    name: 'DbInputExtended',
    mixins: [DbInputMixin],
    components: {
      TooltipDescription
    },
    props: {
      value: {
        type: Object,
        default: () => ({})
      },
      modelName: {
        type: String,
        required: true
      },
      initialValue: {
        type: Object,
        default: () => ({})
      },
      disabled: Boolean,
      showCancelButton: Boolean,
      showResetBuuton: {
        type: Boolean,
        default: true
      },
      displayedValue: {
        type: Function,
        required: true
      },
      dialogWidth: {
        type: String,
        default: '1280px'
      },
      label: String,
      maximized: Boolean,
      require: Boolean,
      filter: Function
    },
    watch: {
      value: {
        handler(val) {
          this.data = cloneDeep(val);
        },
        deep: true
      }
    },
    computed: {
      layoutStyle() {
        return this.dialogMaximized ? null : {width: this.dialogWidth};
      },
      dialogMaximized() {
        return this.maximized || this.$q.screen.lt.md
      },
      isEmpty() {
        return JSON.stringify(this.initialValue) === JSON.stringify(this.value);
      },
      error() {
        return {
          state: this.require && this.isEmpty && get(this.validate, '$dirty') ? true : Object.keys(this.value).some(fld => get(this.validate, `${fld}.$error`)),
          label: this.require && this.isEmpty ? 'Необхідно заповнити' : 'Містить помилки'
        };
      }
    },
    data() {
      return {
        dialog: false,
        clearable: false,
        visibleOptions: [],
        newValue: null,
        isDirty: false,
        data: this.value
      }
    },
    methods: {
      async onHide() {
        await this.$nextTick();
        this.data = cloneDeep(this.value);
      },
      async onShow() {
        await this.$nextTick();
        this.$refs.form.loadedValue = cloneDeep(this.value);
      },
      async onSubmit() {
        this.$emit('input', this.data);
        await this.$nextTick();
        this.dialog = false;
      },
      cancel() {
        this.$refs.form.cancel();
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
        this.data = cloneDeep(val);
        this.dialog = true;
      },
      clearValue() {
        this.$emit('input', this.initialValue);
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
    }
  }
</script>

<style>

  .q-field__bottom {
    padding: 1px 12px;
  }

  .db-input--description .q-field__label::after {
    content: 'help';
    font-family: 'Material Icons';
    margin-left: 3px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }

</style>
