import { get } from 'lodash';
import {lookup as mimeLookup} from 'mime-types';
import minioApi from 'src/api/minio';
import download from 'src/utils/download';
import { getErrorLabel } from 'src/utils/validators';
import EImg from 'components/EImg';
import EPdf from 'components/EPdf';
import PdfViewer from 'src/dialogs/PdfViewer';

export default {
    components: {
        EImg,
        EPdf,
        PdfViewer
    },
    computed: {
        validate() {
            return get(this.$store.getters.VALIDATIONS, this.validatePath, {});
        },
        error() {
            return {
                state: this.validate ? this.validate.$error : false,
                label: this.validate ? getErrorLabel.call(this, this.validate) : undefined
            };
        }
    },
    data() {
        return {
            inProgress: false
        }
    },
    methods: {
        async downloadFile(file) {
            try {
                this.inProgress = true;
                if (file.__status !== 'uploaded') {
                    return false;
                }
                if (!file.__presignedUrl) {
                    file.__presignedUrl = await minioApi.getPresignedUrlForGet(file.__fullName);
                }
                download(file.__presignedUrl, file.type, file.name, 'url');
            } catch (err) {
                console.error(err);
            } finally {
                this.inProgress = false;
            }
        },
        async viewPdf(file) {
            try {
                this.$q.loading.show({message: 'Завантаження...'});
                if (file.__status !== 'uploaded') {
                    return false;
                }
                if (!file.__presignedUrl) {
                    file.__presignedUrl = await minioApi.getPresignedUrlForGet(file.__fullName);
                }
                this.$q.dialog({
                    component: PdfViewer,
                    parent: this,
                    name: file.name,
                    src: file.__presignedUrl
                });
            } catch (err) {
                console.error(err);
            } finally {
                this.$q.loading.hide();
            }

        },
        async pushFileToList(fullName, index, list, payload, noPresignedUrl) {
            try {
                this.inProgress = true;
                const url = noPresignedUrl ? undefined : await minioApi.getPresignedUrlForGet(fullName);
                const fileName = fullName.split('/').pop();
                const mimeType = mimeLookup(fileName);
                const file = {
                    __presignedUrl: url,
                    __fullName: fullName,
                    __status: 'uploaded',
                    size: 0,
                    name: fileName,
                    type: mimeType,
                    payload
                };

                if (mimeType.toUpperCase().startsWith('IMAGE')) {
                    let img = new Image();
                    !noPresignedUrl && (img.src = url);
                    file.__img = img;
                }
                if (mimeType.toUpperCase() === 'APPLICATION/PDF') {
                    file.__pdf = true;
                }
                list.splice(index, 1, file);
            } catch (err) {
                console.error(err);
            } finally {
                this.inProgress = false;
            }
        },
        async factoryFn(files) {
            try {
                if (files.length === 1) {
                    const {url, fileName} = await minioApi.getPresignedUrlForPut(this.folder, files[0].name);
                    const mimeType = mimeLookup(files[0].name);
                    if (mimeType.toUpperCase() === 'APPLICATION/PDF') {
                        files[0].__pdf = true;
                    }
                    files[0].__fullName = fileName;
                    return {
                        url,
                        method: 'PUT',
                        sendRaw: true
                    };
                }
            } catch (err) {
                console.error(err);
            }
        }
    }
}
