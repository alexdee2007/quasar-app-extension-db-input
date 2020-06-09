import moment from 'moment';
import { get } from 'lodash';
import { lookup as mimeLookup } from 'mime-types';
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
        download(`${process.env.BASE_API}/api/minio/${file.__fullName}`, file.name);
      } catch (err) {
        console.error(err);
      } finally {
        this.inProgress = false;
      }
    },
    async pushFileToList(fullName, index, list, payload, noPresignedUrl) {
      try {
        this.inProgress = true;
        const url = `${process.env.BASE_API}/api/minio/${fullName}`;
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
          //!noPresignedUrl && (img.src = url);
          img.src = url;
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

          const fileName = `${this.folder}/${moment().format('YYYY/MM/DD')}/${files[0].name}`;
          files[0].__fullName = fileName;

          return {
            url: `${process.env.BASE_API}/api/minio/${fileName}`,
            headers: [{name: 'Content-Type', value: 'application/octet-stream'}],
            method: 'PUT',
            sendRaw: true,
            withCredentials: true
          };
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
}
