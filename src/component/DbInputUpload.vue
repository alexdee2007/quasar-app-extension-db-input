<template>
  <q-field bottom-slots :error="error.state" no-error-icon :error-message="error.label" standout borderless color="black">
    <q-uploader
      ref="uploader"
      auto-upload
      url="localhost"
      :style="{width,height}"
      v-bind="{...$props, ...$attrs}"
      :color="error.state ? 'negative': 'primary'"
      ::max-file-size="5242880"
      :factory="factoryFn"
      @uploaded="onUploaded"
      >

      <template v-slot:header="scope">
        <div class="q-uploader__header-content flex flex-center no-wrap q-gutter-xs">

          <q-spinner v-if="scope.isUploading === true" class="q-uploader__spinner" />

          <div class="col column justify-center">
            <div class="q-uploader__title">{{ label }}</div>
            <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel + ' / ' + scope.uploadProgressLabel }}</div>
          </div>

          <q-btn v-show="scope.canUpload" type="a" icon="cloud_upload" @click="scope.upload" round dense flat >
            <q-tooltip>Повторити завантаження</q-tooltip>
          </q-btn>

          <q-btn v-show="scope.isUploading" type="a" icon="clear" @click="scope.abort" round dense flat >
            <q-tooltip>Перервати завантаження</q-tooltip>
          </q-btn>

          <q-btn  type="a" icon="add_box" round dense flat>
            <q-uploader-add-trigger />
            <q-tooltip>Додати</q-tooltip>
          </q-btn>
        </div>
      </template>

      <template v-slot:list="scope">
        <q-list separator>
          <q-item
            v-for="(file, index) in scope.files"
            clickable
            :key="`file-list-${index}`"
            @click="downloadFile(file)"
            >
            <q-item-section v-if="file.__status === 'failed'" side>
              <q-icon
                class="q-uploader__file-status"
                color="negative"
                :name="scope.$q.iconSet.type.negative"
                />
              <q-tooltip>Помилка завантаження</q-tooltip>
            </q-item-section>

            <q-item-section>
              <q-item-label class="full-width ellipsis">
                {{ file.name }}
              </q-item-label>

              <q-item-label v-if="file.__sizeLabel !== undefined && file.__progressLabel !== undefined" caption>
                {{ file.__sizeLabel }} / {{ file.__progressLabel }}
              </q-item-label>

            </q-item-section>

            <q-item-section v-if="file.__img" thumbnail>
              <q-btn size="lg" flat dense>
                <db-img :url="file.__img.src" contain height="56px" width="56px" @error="file.__status='failed'" />
              </q-btn>
            </q-item-section>

            <q-item-section v-else-if="file.__pdf" thumbnail >
              <q-btn
                icon="picture_as_pdf"
                size="lg"
                flat
                dense
                style="width: calc(56px + 0.570em);"
                :style="{cursor: file.__status === 'uploaded' ? 'zoom-in' : 'default'}"
                @click.stop.prevent="viewPdf(file)" />
            </q-item-section>

            <q-item-section side>
              <q-btn
                size="12px"
                flat
                dense
                round
                icon="delete"
                @click.stop.prevent="removeFile(file, index)"
                />
            </q-item-section>
          </q-item>

        </q-list>
        <q-inner-loading :showing="inProgress">
          <q-spinner size="50px" color="primary"></q-spinner>
        </q-inner-loading>
      </template>

    </q-uploader>
  </q-field>
</template>

<script>
  import { isEqual } from 'lodash';
  import dbInputMixin from '../mixins/db-input';
  import uploadMixin from '../mixins/upload';

  export default {
    name: 'DbInputUpload',
    mixins: [uploadMixin, dbInputMixin],
    props: {
      label: String,
      value: Array,
      folder: String,
      height: {
        type: String,
        default: '220px'
      },
      width: {
        type: String,
        default: '100%'
      },
      accept: {
        type: String,
        default: 'image/*, .pdf'
      },
      model: Function
    },
    watch: {
      value(val, oldVal) {
        if (!isEqual(val, oldVal)) {
          this.$refs.uploader.reset();
          Promise.all(val.map((v, index) => this.pushFileToList(v.fileName, index, this.$refs.uploader.files)));
        }
      }
    },
    methods: {
      removeFile(file, index) {
        this.$refs.uploader.removeFile(file);
        if (file.__status === 'uploaded') {
          this.$refs.uploader.uploadSize -= file.size;
          this.$refs.uploader.uploadedSize -= file.size;
        }
        this.value.splice(index, 1);
      },
      onUploaded(info) {
        info.files.forEach(file => {
          const model = new this.model({fileName: file.__fullName}, this.$parent.$model);
          this.value.push(model);
        });
      }
    },
    mounted() {
      this.$refs.uploader.reset();
      Promise.all(this.value.map((val, index) => this.pushFileToList(val.fileName, index, this.$refs.uploader.files)));
    }
  }
</script>
