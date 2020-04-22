<template>
  <q-select
    v-if="multiple"
    ref="input"
    key="field-input-multiple"
    bottom-slots
    v-bind:filled="!classicStyle"
    use-input
    use-chips
    options-dense
    dense
    hide-dropdown-icon
    multiple
    v-bind="$props"
    v-bind:class="classObj"
    v-bind:input-class="inputClassObj"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-bind:hint="hintLabel"
    v-on:input="onInput"
    v-on:new-value="onNewValue"
    >
    <slot v-for="(_, name) in $slots" v-bind:name="name" v-bind:slot="name" />
    <tooltip-description v-if="description">{{ description }}</tooltip-description>
    <template v-slot:append>
      <q-icon
        v-if="$refs.input && $refs.input.inputValue !== ''"
        class="cursor-pointer"
        name="check_circle"
        v-on:click.stop="addValue"
        v-bind:tabindex="-1"
        >
        <q-tooltip>Додати значення</q-tooltip>
      </q-icon>
    </template>
  </q-select>
  <q-input
    v-else
    ref="input"
    key="field-input"
    bottom-slots
    v-bind:filled="!classicStyle"
    dense
    :debounce="debounce || 300"
    v-bind="$props"
    v-bind:class="classObj"
    v-bind:input-class="inputClassObj"
    v-bind:type="type"
    v-bind:error="error.state"
    v-bind:error-message="error.label"
    v-on:input="onInput"
    >
    <slot v-for="(_, name) in $slots" v-bind:name="name" v-bind:slot="name" />
    <tooltip-description v-if="description">{{ description }}</tooltip-description>
  </q-input>
</template>

<script>

  import dbInputMixin from '../mixins/db-input';
  import TooltipDescription from './TooltipDescription';

  export default {
    name: 'DbInputText',
    mixins: [dbInputMixin],
    components: {
      TooltipDescription
    },
    props: {
      type: String,
      upperCase: {
        type: Boolean,
        default: true
      }
    }
  }
</script>

