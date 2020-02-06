<template>
    <q-field bottom-slots v-bind:error="error.state" no-error-icon v-bind:error-message="error.label" standout borderless color="black">

        <q-uploader ref="uploader" v-bind:style="{ width, height, maxHeight: height }" v-bind:color="error.state ? 'negative': 'primary'">

            <template v-slot:header="scope">
                <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                    <div class="col">
                        <div class="q-uploader__title">{{ label }}</div>
                    </div>
                    <q-btn type="a" icon="add_box" dense flat v-on:click="add">
                        <q-tooltip>Додати</q-tooltip>
                    </q-btn>
                </div>
            </template>

            <template v-slot:list="scope">
                <q-list separator>
                    <q-item
                        v-for="(row, index) in value"
                        v-bind:key="`input-list-${index}`"
                        clickable
                        class="text-black"
                        v-on:click="edit(index)">
                        <q-item-section side v-if="validate.$each && validate.$each[index] && validate.$each[index].$error">
                            <q-icon color="negative" v-bind:name="scope.$q.iconSet.field.error" />
                        </q-item-section>
                        <q-item-section>{{ displayedValue(row) }}</q-item-section>
                        <q-item-section side>
                            <q-btn ize="12px" flat dense round icon="delete" v-on:click.stop.prevent="remove(index)">
                                <q-tooltip>Видалити</q-tooltip>
                            </q-btn>
                        </q-item-section>
                    </q-item>
                </q-list>
            </template>
        </q-uploader>

        <q-dialog v-model="dialog" ref="dialog" v-bind:maximized="dialogMaximized">
            <slot v-bind:ctx="thisContext" />
        </q-dialog>

    </q-field>

</template>

<script>

    import { get } from 'lodash';
    import { getErrorLabel } from '../utils/validators';
// TODO    import validationsMixin from 'src/mixins/validations';

    export default {
        name: 'DbInputList',
        mixins: [validationsMixin],
        props: {
            label: String,
            value: Array,
            validatePath: String,
            initialValue: Object,
            displayedValue: {
                type: Function,
                required: true
            },
            height: {
                type: String,
                default: '320px'
            },
            width: {
                type: String,
                default: '100%'
            },
            dialogWidth: String,
            maximized: Boolean,
        },
        data() {
            return {
                formIndex: 0,
                dialogTitle: '',
                dialog: false
            }
        },
        watch: {
            value(val) {
                val.length === 0 && this.$refs.uploader.reset();
            }
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
            },
            thisContext() {
                return {
                    label: this.dialogTitle,
                    apply: this.apply,
                    initialValue: this.initialValue,
                    isDirty: this.isDirty,
                    dialogWidth: this.dialogWidth,
                    value: this.value[this.formIndex] || {},
                    allValues: this.value
                }
            },
            dialogMaximized() {
                return this.maximized || this.$q.screen.lt.md
            },
        },
        methods: {
            remove(index) {
                this.value.splice(index, 1);
            },
            add() {
                this.dialogTitle = `${this.label} - додати`;
                this.formIndex = this.value.length;
                this.dialog = true;
            },
            edit(index) {
                this.dialogTitle = `${this.label} - змінити`;
                this.formIndex = index;
                this.dialog = true;
            },
            apply(ctx) { // context form
                ctx.$v.$touch();
                if (ctx.$v.$error) {
                    return false;
                }
                this.value.splice(this.formIndex, 1, ctx[ctx.model]);
                this.dialog = false;
            }
        }
    }
</script>
