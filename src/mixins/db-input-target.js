export default {
    mounted() {
        !this.multiple && this.$refs.input.$refs.target.addEventListener('blur', this.onBlurTarget);
    },
    beforeDestroy() {
        !this.multiple && this.$refs.input.$refs.target.removeEventListener('blur', this.onBlurTarget);
    }
}
