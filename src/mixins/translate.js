import { set } from 'lodash';
import {translitRuUk, translitUkRu} from '../utils/translit';

export default {
  methods: {
    translateRuUk(val, dict, ref) {
      let translated;

      if (!val) {
        translated = null;
      } else {
        const rsltRu = this.$store.getters.DICT(`${dict},RU`).find(v => v.value === val);
        if (rsltRu) {
          const rsltUk = this.$store.getters.DICT(`${dict},UK`).find(v => v.key === rsltRu.key);
          translated = rsltUk ? rsltUk.value : undefined;
        }
        translated = translated || translitRuUk(val, dict);
      }
      set(this, ref, translated);
    },
    translateUkRu(val, dict, ref) {

      let translated;

      if (!val) {
        translated = null;
      } else {
        const rsltUk = this.$store.getters.DICT(`${dict},UK`).find(v => v.value === val);
        if (rsltUk) {
          const rsltRu = this.$store.getters.DICT(`${dict},RU`).find(v => v.key === rsltUk.key);
          translated = rsltRu ? rsltRu.value : undefined;
        }
        translated = translated || translitUkRu(val, dict);
      }
      set(this, ref, translated);
    }
  }
}
