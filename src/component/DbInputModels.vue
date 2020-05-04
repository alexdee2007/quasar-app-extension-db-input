<template>
  <q-field bottom-slots :error="error.state" :error-message="error.label" no-error-icon standout borderless color="black">

    <q-uploader ref="uploader" :style="{ width, height, maxHeight: height }" :color="error.state ? 'negative': 'primary'">

      <template v-slot:header="scope">
        <slot name="header" :add="add" :scope="scope">
          <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
            <div class="col">
              <div class="q-uploader__title">{{ label }}</div>
            </div>
            <q-btn type="a" icon="add_box" round dense flat @click="add" :disable="disabled">
              <q-tooltip v-if="!disabled">Додати</q-tooltip>
            </q-btn>
          </div>
        </slot>
      </template>

      <template v-slot:list="scope">
        <slot name="list" :value="value" :validate="validate" :edit="edit" :remove="remove" :scope="scope">
          <q-list separator>
            <template v-for="(row, index) in value">
              <q-item v-if="!filterList || filterList(row) === true" :clickable="!disabled" class="text-black" :key="`input-list-${index}`" @click="edit(index)">

                <q-item-section side v-if="!dialog && row.$hasErrors">
                  <q-icon color="negative" :name="scope.$q.iconSet.field.error" />
                </q-item-section>
                <slot name="list-section" :index="index" :row="row">
                  <q-item-section>{{ row.$label }}</q-item-section>
                </slot>
                <q-item-section side>
                  <q-btn ize="12px" flat dense round icon="delete" @click.stop.prevent="remove(index)" :disable="disabled">
                    <q-tooltip v-if="!disabled">Видалити</q-tooltip>
                  </q-btn>
                </q-item-section>

              </q-item>
            </template>
          </q-list>
        </slot>
      </template>

    </q-uploader>

    <q-dialog v-if="currentModel" v-model="dialog" ref="dialog" :maximized="dialogMaximized" @show="onShow" @hide="onHide" persistent @before-hide="onBeforeHide">

      <q-layout v-if="dialogMaximized" ref="layout" container view="hhh lpr fff" class="bg-white">

        <db-form
          v-model="currentModel"
          ref="form"
          :before-submit="beforeSubmit"
          :save-on-submit="saveOnSubmit"
          @submit="onSubmit"
          autofocus
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
              <component :is="component" v-bind="{[model.name]: currentModel, ...componentProps}" />
            </q-page>
          </q-page-container>

          <q-footer elevated>
            <slot name="footer">
              <q-toolbar class="bg-grey-9 text-white">
                <q-space />
                <q-btn v-if="showCancelButton" label="Скасувати" flat @click="currentModel.$rollback()" class="on-left" :disable="!currentModel.$isChanged">
                  <q-tooltip v-if="currentModel.$isChanged">Відмінити зміни</q-tooltip>
                </q-btn>
                <q-btn v-if="showResetButton" label="Очистити" type="reset" flat class="on-left" :disable="currentModel.$isEmpty">
                  <q-tooltip v-if="!currentModel.$isEmpty">Очистити форму</q-tooltip>
                </q-btn>
                <q-btn label="Застосувати" type="submit" color="primary" :disable="!currentModel.$isChanged">
                  <q-tooltip v-if="currentModel.$isChanged">Застосувати зміни</q-tooltip>
                </q-btn>
              </q-toolbar>
            </slot>
          </q-footer>
        </db-form>

      </q-layout>

      <q-card v-else style="max-width: 1280px;" :style="{width: dialogWidth}">

        <db-form
          v-model="currentModel"
          ref="form"
          :before-submit="beforeSubmit"
          :save-on-submit="saveOnSubmit"
          @submit="onSubmit"
          autofocus
          >
          <slot name="header">
            <q-toolbar class="bg-primary text-white">
              <q-toolbar-title>{{ dialogTitle }}</q-toolbar-title>
              <q-btn flat round dense icon="close" v-close-popup :tabindex="-1" />
            </q-toolbar>
          </slot>

          <q-separator />

          <q-card-section>

            <component :is="component" v-bind="{[model.name]: currentModel, ...componentProps}" />

          </q-card-section>

          <q-separator />

          <slot name="footer">
            <q-toolbar class="bg-grey-9 text-white" style="z-index:9999;">
              <q-space />
              <q-btn v-if="showCancelButton" label="Скасувати" flat @click="currentModel.$rollback()" class="on-left" :disable="!currentModel.$isChanged">
                <q-tooltip v-if="currentModel.$isChanged">Відмінити зміни</q-tooltip>
              </q-btn>
              <q-btn v-if="showResetButton" label="Очистити" type="reset" flat class="on-left" :disable="currentModel.$isEmpty">
                <q-tooltip v-if="!currentModel.$isEmpty">Очистити форму</q-tooltip>
              </q-btn>
              <q-btn label="Застосувати" type="submit" color="primary" :disable="!currentModel.$isChanged">
                <q-tooltip v-if="currentModel.$isChanged">Застосувати зміни</q-tooltip>
              </q-btn>
            </q-toolbar>
          </slot>

        </db-form>
      </q-card>

    </q-dialog>

  </q-field>

</template>

<script>

  import DbInputMixin from '../mixins/db-input';
  import { getErrorLabel } from '../utils/validators';

  export default {
    name: 'DbInputModels',
    mixins: [DbInputMixin],
    props: {
      component: [Function, Object],
      componentProps: {
        type: Object,
        default: () => ({})
      },
      value: {
        type: Array,
        default: () => []
      },
      titleAsLabel: Boolean,
      filterList: Function,
      model: Function,
      disabled: Boolean,
      showCancelButton: Boolean,
      beforeSubmit: Function,
      saveOnSubmit: Boolean,
      showResetButton: {
        type: Boolean,
        default: true
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
        formIndex: 0,
        dialogTitle: '',
        dialog: false,
        currentModel: null
      }
    },
    watch: {
      value(val) {
        val.length === 0 && this.$refs.uploader.reset();
      }
    },
    computed: {
      hasErrors() {
        return !this.dialog && this.value.some(vm => vm.$hasErrors);
      },
      error() {
        return {
          state: this.validate.$error || this.hasErrors,
          label: this.hasErrors ? 'Містить помилки' : getErrorLabel.call(this, this.validate)
        }
      },
      dialogMaximized() {
        return this.maximized || this.$q.screen.lt.md
      }
    },
    methods: {
      onBeforeHide() {
        if (this.formIndex === this.value.length) { // new model no submit
          this.currentModel.$destroy();
        } else if (this.currentModel.$isChanged) { // no changes
          this.currentModel.$rollback();
        }
      },
      async onHide(evt) {
        this.currentModel.$parent && (this.currentModel.$parent.$options.state.active = true);
        this.$emit('hide');
      },
      async onShow() {
        this.currentModel.$parent && (this.currentModel.$parent.$options.state.active = false);
        this.$emit('show');
      },
      async onSubmit() {
        this.value.splice(this.formIndex, 1, this.currentModel);
        this.dialog = false;
      },
      remove(index) {
        this.value.splice(index, 1);
      },
      add() {
        this.dialogTitle = `${this.titleAsLabel ? this.label : this.model.title} - додати`;
        this.formIndex = this.value.length;
        this.currentModel = new this.model(this.model.defaults(), this.$parent.$model);
        this.dialog = true;
      },
      edit(index) {
        this.dialogTitle = `${this.titleAsLabel ? this.label : this.model.title} - змінити`;
        this.formIndex = index;
        this.currentModel = this.value[index];
        this.dialog = true;
      }
    },
    beforeDestroy() {
      if (this.currentModel && this.currentModel.$parent) {
        this.currentModel.$parent.$options.state.active = true;
      }
    }

  }
</script>
