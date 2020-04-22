<template>
  <q-field bottom-slots :error="error.state" :error-message="error.label" no-error-icon standout borderless color="black">

    <q-uploader ref="uploader" :style="{ width, height, maxHeight: height }" :color="error.state ? 'negative': 'primary'">

      <template v-slot:header="scope">
        <slot name="header" :add="add" :scope="scope">
          <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
            <div class="col">
              <div class="q-uploader__title">{{ label }}</div>
            </div>
            <q-btn type="a" icon="add_box" round dense flat @click="add">
              <q-tooltip>Додати</q-tooltip>
            </q-btn>
          </div>
        </slot>
      </template>

      <template v-slot:list="scope">
        <slot name="list" :value="value" :validate="validate" :edit="edit" :remove="remove" :scope="scope">
          <q-list separator>
            <template v-for="(row, index) in value">
              <q-item v-if="!filterList || filterList(row) === true" clickable class="text-black" :key="`input-list-${index}`" @click="edit(index)">

                <q-item-section side v-if="validate.$each && validate.$each[index] && validate.$each[index].$error">
                  <q-icon color="negative" :name="scope.$q.iconSet.field.error" />
                </q-item-section>
                <slot name="list-section" :index="index" :row="row">
                  <q-item-section>{{ displayedValue(row) }}</q-item-section>
                </slot>
                <q-item-section side>
                  <q-btn ize="12px" flat dense round icon="delete" @click.stop.prevent="remove(index)">
                    <q-tooltip>Видалити</q-tooltip>
                  </q-btn>
                </q-item-section>

              </q-item>
            </template>
          </q-list>
        </slot>
      </template>

    </q-uploader>

    <q-dialog v-model="dialog" ref="dialog" :maximized="dialogMaximized" @show="onShow" @hide="onHide" @before-show="setDirty" persistent>

      <q-layout v-if="dialogMaximized" ref="layout" container view="hhh lpr fff" class="bg-white">
        <db-form
          :model-name="modelName"
          :value.sync="data"
          :initial-value="initialValue"
          :is-dirty="isDirty"
          ref="form"
          @submit="onSubmit"
          :autofocus="!inputValue"
          >
          <q-header reveal elevated>
            <slot name="header">
              <q-toolbar class="bg-primary text-white">
                <q-toolbar-title>{{ dialogTitle }}</q-toolbar-title>
                <q-btn flat round dense icon="close" v-close-popup :tabindex="-1" />
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
              <q-toolbar class="bg-grey-9 text-white">
                <q-space />
                <q-btn v-if="showCancelButton" label="Відмінити" flat @click="cancel" class="on-left" :disable="$refs.form && $refs.form.notChanged">
                  <q-tooltip>Відмінити зміни</q-tooltip>
                </q-btn>
                <q-btn v-if="showResetButton" label="Очистити" type="reset" flat class="on-left" :disable="$refs.form && $refs.form.isEmpty">
                  <q-tooltip>Очистити форму</q-tooltip>
                </q-btn>
                <q-btn label="Застосувати" type="submit" color="primary" :disable="$refs.form && $refs.form.notChanged" :autofocus="inputValue">
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
          :autofocus="!inputValue"
          >
          <slot name="header">
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>{{ dialogTitle }}</q-toolbar-title>
              <q-btn flat round dense icon="close" v-close-popup :tabindex="-1" />
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
              <q-btn v-if="showResetButton" label="Очистити" type="reset" flat class="on-left" :disable="$refs.form && $refs.form.isEmpty">
                <q-tooltip>Очистити форму</q-tooltip>
              </q-btn>
              <q-btn label="Застосувати" type="submit" color="primary" :disable="$refs.form && $refs.form.notChanged" :autofocus="inputValue">
                <q-tooltip>Застосувати зміни</q-tooltip>
              </q-btn>
            </q-toolbar>
          </slot>

        </db-form>
      </q-card>
    </q-dialog>

  </q-field>

</template>

<script>

  import { get, cloneDeep } from 'lodash';
  import DbInputMixin from '../mixins/db-input';

  export default {
    name: 'DbInputList',
    mixins: [DbInputMixin],
    props: {

      value: {
        type: Array,
        default: () => []
      },
      modelName: {
        type: String,
        required: true
      },
      filterList: Function,
      initialValue: {
        type: Object,
        default: () => ({})
      },
      disabled: Boolean,
      showCancelButton: Boolean,
      showResetButton: {
        type: Boolean,
        default: true
      },
      displayedValue: {
        type: Function,
        default: () => ({})
      },
      height: {
        type: String,
        default: '320px'
      },
      width: {
        type: String,
        default: '100%'
      },
      dialogWidth: {
        type: String,
        default: '1280px'
      },
      label: String,
      maximized: Boolean,
    },
    data() {
      return {
        data: this.initialValue,
        isDirty: false,
        formIndex: 0,
        dialogTitle: '',
        dialog: false,
        inputValue: false
      }
    },
    watch: {
      value(val) {
        val.length === 0 && this.$refs.uploader.reset();
      }
    },
    computed: {
      layoutStyle() {
        return this.dialogMaximized ? null : {width: this.dialogWidth};
      },
      dialogMaximized() {
        return this.maximized || this.$q.screen.lt.md
      }
    },
    methods: {
      setDirty() {
        this.isDirty = this.validate ? get(this.validate, ['$each', this.formIndex, '$error']) : false
      },
      async onHide(evt) {
        this.data = cloneDeep(this.initialValue);
        this.$emit('hide');
      },
      async onShow() {
        await this.$nextTick();
        this.$refs.form.loadedValue = cloneDeep(this.data);
      },
      async onSubmit() {
        this.value.splice(this.formIndex, 1, this.data);
        await this.$nextTick();
        this.dialog = false;
      },
      cancel() {
        this.$refs.form.cancel();
      },
      remove(index) {
        this.value.splice(index, 1);
      },
      add() {
        this.dialogTitle = `${this.label} - додати`;
        this.formIndex = this.value.length;
        this.dialog = true;
      },
      edit(index) {
        this.dialogTitle = `${this.label} - змінити`;
        this.formIndex = index;
        this.data = this.value[index];
        this.dialog = true;
      }
    }
  }
</script>
