import { get } from 'lodash';
import {lookup as mimeLookup} from 'mime-types';
import download from '../utils/download-file';

export default {
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
          file.__presignedUrl = await this.$api.minio.getPresignedUrlForGet(file.__fullName);
        }
        download(file.__presignedUrl, file.name);

      } catch (err) {
        console.error(err);
      } finally {
        this.inProgress = false;
      }
    },
    async pushFileToList(fullName, index, list, payload, noPresignedUrl) {
      try {
        this.inProgress = true;
        const url = noPresignedUrl ? undefined : await this.$api.minio.getPresignedUrlForGet(fullName);
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

          const {url, fileName} = await this.$api.minio.getPresignedUrlForPut(this.folder, files[0].name);
          const mimeType = mimeLookup(files[0].name);

          if (mimeType.toUpperCase() === 'APPLICATION/PDF') {
            files[0].__pdf = true;
          }

          files[0].__fullName = fileName;
          return {url, method: 'PUT', sendRaw: true};
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}
