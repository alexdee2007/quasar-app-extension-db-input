<template>
    <q-field bottom-slots v-bind:error="error.state" no-error-icon v-bind:error-message="error.label" standout borderless color="black">
        <q-uploader
            ref="uploader"
            auto-upload
            url="localhost"
            v-bind:style="{width,height}"
            v-bind="$props"
            v-bind:color="error.state ? 'negative': 'primary'"
            v-bind::max-file-size="5242880"
            v-bind:factory="factoryFn"
            v-on:uploaded="onUploaded"
            >

            <template v-slot:header="scope">
                <div class="q-uploader__header-content flex flex-center no-wrap q-gutter-xs">

                    <q-spinner v-if="scope.isUploading === true" class="q-uploader__spinner" />

                    <div class="col column justify-center">
                        <div class="q-uploader__title">{{ label }}</div>
                        <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel + ' / ' + scope.uploadProgressLabel }}</div>
                    </div>

                    <q-btn v-show="scope.canUpload" type="a" icon="cloud_upload" v-on:click="scope.upload" round dense flat >
                        <q-tooltip>Повторити завантаження</q-tooltip>
                    </q-btn>

                    <q-btn v-show="scope.isUploading" type="a" icon="clear" v-on:click="scope.abort" round dense flat >
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
                        v-bind:key="`file-list-${index}`"
                        v-on:click="downloadFile(file)"
                        >
                        <q-item-section v-if="file.__status === 'failed'" side>
                            <q-icon class="q-uploader__file-status"
                                    color="negative"
                                    v-bind:name="scope.$q.iconSet.type.negative"
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
                                <e-img v-bind:url="file.__img.src" contain height="56px" width="56px" />
                            </q-btn>
                        </q-item-section>

                        <q-item-section v-else-if="file.__pdf" thumbnail >
                            <q-btn icon="picture_as_pdf"
                                   size="lg"
                                   flat
                                   dense
                                   style="width: calc(56px + 0.570em);"
                                   v-bind:style="{cursor: file.__status === 'uploaded' ? 'zoom-in' : 'default'}"
                                   v-on:click.stop.prevent="viewPdf(file)" />
                        </q-item-section>

                        <q-item-section side>
                            <q-btn
                                size="12px"
                                flat
                                dense
                                round
                                icon="delete"
                                v-on:click.stop.prevent="removeFile(file, index)"
                                />
                        </q-item-section>
                    </q-item>

                </q-list>
                <q-inner-loading v-bind:showing="inProgress">
                    <q-spinner size="50px" color="primary"></q-spinner>
                </q-inner-loading>
            </template>

        </q-uploader>
    </q-field>
</template>

<script>
    import uploadMixin from '../mixins/upload';

    export default {
        name: 'DbInputUpload',
        mixins: [uploadMixin],
        props: {
            label: String,
            value: Array,
            folder: String,
            validatePath: String,
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
            }
        },
        watch: {
            value(val) {
                val.length === 0 && this.$refs.uploader.reset();
                Promise.all(val.map((v, index) => ((v.id && !this.$refs.uploader.files[index]) && this.pushFileToList(v.fileName, index, this.$refs.uploader.files))));
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
                    this.value.push({fileName: file.__fullName});
                });
            }
        },
        mounted() {
            this.$refs.uploader.reset();
            Promise.all(this.value.map((val, index) => this.pushFileToList(val.fileName, index, this.$refs.uploader.files)));
        }
    }
</script>

<style>

</style>

