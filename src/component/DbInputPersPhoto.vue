<template>
  <q-field bottom-slots v-bind:error="error.state" no-error-icon v-bind:error-message="error.label" standout borderless color="black">
    <q-uploader v-bind:style="{width,height}" v-bind:color="error.state ? 'negative': 'primary'">
      <template v-slot:header="scope">
        <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
          <div class="col">
            <div class="q-uploader__title">{{ label }}</div>
          </div>
          <q-btn type="a" icon="add_box" dense flat v-on:click="addPersPhoto">
            <q-tooltip>Додати</q-tooltip>
          </q-btn>
        </div>
      </template>

      <template v-slot:list="scope">
        <q-list separator>
          <q-item
            v-for="(photo, index) in value"
            v-bind:key="`pers-photo-list-${index}`"
            clickable
            v-on:click="editPersPhoto(photo, index)">

            <q-item-section side v-if="validate.$each && validate.$each[index] && validate.$each[index].$error">
              <q-icon color="negative" v-bind:name="scope.$q.iconSet.field.error" />
            </q-item-section>


            <q-item-section>
              <q-item-label class="ellipsis text-subtitle2">
                {{ getDictValue(photo.photoType,'ERS_PHOTO_TYPE') }}
              </q-item-label>
              <q-item-label class="ellipsis" caption>
                {{ photo.photoDate ? `Дата фотографування: ${photo.photoDate}` : '' }}
              </q-item-label>
            </q-item-section>

            <q-item-section v-if="files[index] && files[index].__img" thumbnail>
              <e-img v-bind:url="files[index].__img.src" contain style="height: 56px; width: 100px"/>
            </q-item-section>


            <q-item-section side>
              <q-btn size="12px" flat dense round icon="delete" v-on:click.stop.prevent="removePhoto(index)">
                <q-tooltip>Видалити</q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>
        <q-inner-loading v-bind:showing="loading">
          <q-spinner size="50px" color="primary"></q-spinner>
        </q-inner-loading>
      </template>
    </q-uploader>

    <q-dialog v-model="dialog" ref="dialog" v-on:show="onShow" v-bind:maximized="$q.screen.lt.md">
      <dialog-layout v-bind:context="{label: dialogTitle, apply, clear, disableApply, dialogWidth: '560px'}">
        <div class="row q-col-gutter-x-sm">
          <db-input v-model="Photo.photoType" pref="08*" class="col-xs-12 col-md-6" />
          <db-input v-model="Photo.photoDate" class="col-xs-12 col-md-6" />
        </div>

        <div class="row q-col-gutter-x-sm">
          <db-input v-model="Photo.comments" class="col-12" style="max-height: 100px;" />
        </div>

        <div class="row q-col-gutter-x-sm">
          <q-field bottom-slots v-bind:error="$v.Photo.Upload && $v.Photo.Upload.fileName.$error" no-error-icon error-message="Необхідно додати фото" standout borderless class="full-width">
            <q-uploader
              ref="uploader"
              v-bind:factory="factoryFn"
              v-bind::max-file-size="5242880"
              auto-upload
              bordered
              accept="image/*"
              class="pers-photo-uploader"
              style="width: 100%;"
              v-on:uploaded="onUploaded"
              v-on:removed="onRemoved"
              v-bind:color="$v.Photo.Upload && $v.Photo.Upload.fileName.$error ? 'negative': 'primary'"
              >
              <template v-slot:header="scope">
                <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                  <div class="col">
                    <div class="q-uploader__title">Фото</div>
                  </div>
                  <q-btn v-show="scope.canUpload" type="a" icon="cloud_upload" v-on:click="scope.upload" round dense flat >
                    <q-tooltip>Повторити завантаження</q-tooltip>
                  </q-btn>
                  <q-btn v-show="scope.isUploading" type="a" icon="clear" v-on:click="scope.abort" round dense flat >
                    <q-tooltip>Перервати завантаження</q-tooltip>
                  </q-btn>
                  <q-btn v-show="scope.canAddFiles" type="a" icon="add_box" round dense flat v-bind:disable="scope.files.length > 0">
                    <q-uploader-add-trigger v-if="scope.files.length < 1" />
                    <q-tooltip>Додати</q-tooltip>
                  </q-btn>
                </div>
              </template>

              <template v-slot:list="scope">
                <div v-if="scope.files.length > 0" v-bind:key ="scope.files[0].__fullName"
                     v-bind:class="{
                     'q-uploader__file': true,
                     'relative-position': true,
                     'q-uploader__file--img': scope.files[0] !== void 0,
                     'q-uploader__file--failed': scope.files[0].__status === 'failed',
                     'q-uploader__file--uploaded': scope.files[0].__status === 'uploaded'
                     }"
                     v-bind:style ="scope.files[0].__img !== void 0 ? { backgroundImage: 'url(' + scope.files[0].__img.src + ')'} : null"
                     >
                  <div class="q-uploader__file-header row flex-center no-wrap">
                    <q-icon v-if="scope.files[0].__status === 'failed'"
                            class="q-uploader__file-status"
                            color="negative"
                            v-bind:name="scope.$q.iconSet.type.negative"
                            />
                    <div class="q-uploader__file-header-content col">
                      <div class="q-uploader__title">{{ scope.files[0].name }}</div>
                      <div v-if="scope.files[0].__progressLabel && !Photo.id" class="q-uploader__subtitle row items-center no-wrap">
                        {{ scope.files[0].__sizeLabel + ' / ' + scope.files[0].__progressLabel }}
                      </div>

                    </div>
                    <q-circular-progress
                      v-if= "scope.files[0].__status === 'uploading'"
                      v-bind:value="scope.files[0].__progress"
                      v-bind:min="0"
                      v-bind:max="1"
                      v-bind:indeterminate="scope.files[0].__progress === 0"
                      />
                    <template v-else>
                      <q-btn v-if="scope.files[0].__status === 'uploaded'" round dense flat icon="cloud_download" v-on:click="downloadFile(scope.files[0])">
                        <q-tooltip>Завантажити</q-tooltip>
                      </q-btn>
                      <q-btn v-if="scope.files[0].__progressLabel && !Photo.id" round dense flat v-bind:icon="scope.$q.iconSet.uploader.clear" v-on:click="scope.removeFile(scope.files[0])">
                        <q-tooltip>Видалити</q-tooltip>
                      </q-btn>
                    </template>
                  </div>
                </div>
                <q-inner-loading v-bind:showing="inProgress">
                  <q-spinner size="50px" color="primary"></q-spinner>
                </q-inner-loading>
              </template>
            </q-uploader>
          </q-field>


        </div>
      </dialog-layout>
    </q-dialog>
  </q-field>
</template>

<script>

  import { cloneDeep } from 'lodash';
// TODO  import DialogLayout from 'layouts/DialogLayout';

// TODO    import validationsMixin from 'src/mixins/validations';
// TODO    import dictMixin from '../mixins/dict';
// TODO    import uploadMixin from 'src/mixins/upload';

  const initPhoto = {
    photoType: null,
    photoDate: null,
    comments: null,
    Upload: {
      fileName: null
    }
  };
  export default {
    name: 'DbInputPersPhoto',
    mixins: [validationsMixin, dictMixin, uploadMixin],
    components: {
      DialogLayout,
      DbInput: () => import('./DbInput') // recursive component
    },
    props: {
      label: String,
      value: Array,
      height: {
        type: String,
        default: '220px'
      },
      width: {
        type: String,
        default: '100%'
      },
      validatePath: String
    },
    computed: {
      disableApply() {
        return JSON.stringify(this.Photo) === JSON.stringify(this.initialForm);
      }
    },
    data() {
      return {
        files: [],
        folder: 'pers',
        dialog: false,
        loading: false,
        inProgress: false,
        formIndex: 0,
        model: 'Photo',
        dialogTitle: '',
        initialForm: {},
        Photo: cloneDeep(initPhoto)
      }
    },
    watch: {
      value(val) {
        Promise.all(val.map((v, index) => ((v.id && !this.files[index]) && this.pushFileToList(v.Upload.fileName, index, this.files))));
      }
    },
    methods: {
      removePhoto(index) {
        this.value.splice(index, 1);
        this.files.splice(index, 1);
      },
      onShow() {
        this.Photo = cloneDeep(this.initialForm);
        if (this.formIndex !== this.value.length && this.files[this.formIndex]) {
          this.$refs.uploader.files = [this.files[this.formIndex]];
        }
      },
      onUploaded(info) {
        this.Photo.Upload.fileName = info.files[0].__fullName;
        this.files[this.formIndex] = info.files[0];
      },
      onRemoved(files) {
        this.Photo.Upload.fileName = null;
      },
      addPersPhoto() {
        this.dialogTitle = 'Додати';
        this.formIndex = this.value.length;
        this.initialForm = cloneDeep(initPhoto);

        this.$v.$reset();

        this.dialog = true;
      },
      editPersPhoto(photo, index) {
        this.dialogTitle = 'Змінити';
        this.formIndex = index;
        this.initialForm = cloneDeep(photo);

        if (this.error.state) {
          this.$v.$touch();
        } else {
          this.$v.$reset();
        }

        this.dialog = true;
      },
      apply() {
        this.$v.$touch();
        if (this.$v.$error) {
          return false;
        }
        this.value.splice(this.formIndex, 1, this.Photo);
        this.dialog = false;
      },
      clear() {
        this.$v.$reset();
        this.$refs.uploader.reset();
        this.Photo = cloneDeep(initPhoto);
      }
    },
    mounted() {
      Promise.all(this.value.map((val, index) => this.pushFileToList(val.Upload.fileName, index, this.files)));

//            this.$refs.dialog.$on('before-show', () => {
//                this.$store.dispatch('SET_EXTEND_DIALOG_SHOWING', true);
//            });
//            this.$refs.dialog.$on('hide', () => {
//                this.$store.dispatch('SET_EXTEND_DIALOG_SHOWING', false);
//            });
    },
    beforeDestroy() {
      this.$refs.dialog.$off();
    }
  }
</script>

<style lang="stylus">
  .pers-photo-uploader {
    .q-uploader__file--img {
      background-size: contain;
      height: 250px;
    }
    .q-uploader__list {
      min-height: 266px;
    }
    .q-uploader__file--img {
      background-color: #fff;
    }
  }
</style>

