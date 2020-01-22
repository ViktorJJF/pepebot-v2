import Vue from "vue";

const safeAccess = {
    install: (Vue, options) => {
        Vue.prototype.$safe = obj => {
            if (obj) return obj;
            return ' ';
        };
    }
};

Vue.use(safeAccess);