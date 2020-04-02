<template>
  <q-select
    ref="input"
    key="field-address"
    option-value="key"
    option-label="value"
    options-selected-class="option-selected"
    bottom-slots
    v-bind:filled="!classicStyle"
    behavior="menu"
    use-input
    fill-input
    dense
    hide-dropdown-icon
    v-bind:class="classObj"
    hide-selected
    v-bind="$props"
    v-bind:value="value"
    v-bind:loading="loading"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-bind:hint="hintLabel"
    v-bind:clearable="!$q.platform.is.desktop"
    v-bind:label="label"
    v-bind:stack-label="stackLabel"
    v-bind:options="visibleOptions"
    v-bind:disable="disable"
    v-bind:readonly="readonly"
    v-bind:autofocus="autofocus"
    v-bind:input-debounce="inputDebounce"
    v-on:filter="filterFn"
    v-on:input="onInput"
    >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" v-on="scope.itemEvents" >
        <q-item-section>
          <q-item-label>{{ scope.opt.value }}</q-item-label>
          <q-item-label caption>{{ scope.opt.stamp }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <tooltip-description v-if="description">{{ description }}</tooltip-description>
  </q-select>
</template>

<script>

  import DbInputMixin from '../mixins/db-input';
  import DbInputTargetMixin from '../mixins/db-input-target';
  import updateMenuMixin from '../mixins/update-menu';
  import { joinStrings } from '../utils/strings';
  import TooltipDescription from './TooltipDescription';

  export default {
    name: 'DbInputAddress',
    mixins: [DbInputMixin, DbInputTargetMixin, updateMenuMixin],
    components: {
      TooltipDescription
    },
    props: {
      value: String,
      category: {
        type: String,
        required: true
      },
      pref: {
        type: String,
        default: ''
      },
      country: {
        type: String,
        default: 'ua'
      },
      inputDebounce: {
        type: [Number, String],
        default: '500'
      }
    },
    data() {
      return {
        visibleOptions: [],
        upperCase: true
      }
    },
    methods: {
      onInput(val) {
        this.$emit('input', val.value.toUpperCase());
        this.$emit('input-option', val);
      },
      async filterFn(val, update, abort) {
        try {

          if (val.length < 1) {
            return abort();
          }

          const obj = await this.$api.visicom.search(this.category, this.pref + val);
          let options = [];

          if (obj && obj.type === 'FeatureCollection') {
            options = obj.features.map(feature => ({
                key: feature.id,
                value: feature.properties.name.toUpperCase(),
                stamp: this.formatAddress(feature.properties),
                properties: feature.properties,
                //bbox: feature.bbox,
                //geo_centroid: feature.geo_centroid
              }));
          } else if (obj && obj.type === 'Feature') {
            options = [{
                key: obj.id,
                value: obj.properties.name.toUpperCase(),
                stamp: this.formatAddress(obj.properties),
                properties: obj.properties,
                //bbox: obj.bbox,
                //geo_centroid: obj.geo_centroid
              }];
          }
          update(() => {
            this.visibleOptions = options;
          });

        } catch (err) {
          console.error(err);
          abort();
        }
      },
      formatAddress(prop) {
        return joinStrings([(prop.categories === 'adr_address' ? '' : joinStrings([prop.type, prop.name], ' ')),
          joinStrings([prop.street_type, prop.street], ' '),
          (prop.categories === 'adr_address' ? 'буд.' + prop.name : ' '),
          joinStrings([[prop.settlement_type, prop.settlement].join(' '), prop.level2, prop.level1]),
          (prop.country ? prop.country : 'Україна')]);
      },
      onBlurTarget(evt) {
        if (this.value !== evt.target.value) {
          this.$emit('input', evt.target.value.toUpperCase());
        }
      }
    }

  }
</script>
