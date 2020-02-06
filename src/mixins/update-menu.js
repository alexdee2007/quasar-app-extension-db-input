export default {
    mounted() {
        if (this.$q.platform.is.desktop === true && !this.multiple) {
            const updateMenu = this.$refs.input.__updateMenu;
            this.$refs.input.__updateMenu = (show) => {
                updateMenu(show);
                show && this.$refs.input.setOptionIndex(0);
            }
        }
    }
}
