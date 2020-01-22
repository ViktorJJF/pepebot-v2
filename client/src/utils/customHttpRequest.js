import {
    store
} from "@/store";

const customHttpRequest = (type, url, params = null, callback = () => {}) => {
    axios[type](url, params)
        .then(res => {
            console.log(res.data);
            store.dispatch("showSnackbar", {
                text: res.data.message,
                color: "success"
            });
            if (res.data.ok) {
                callback(null, res.data.payload);
            }
        })
        .catch(err => {
            console.log("hubo un error en la llamada a la api");
            if (err.code === "ECONNABORTED") {
                console.log("se excedio el tiempo limite");
                store.dispatch("showSnackbar", {
                    text: "Algo salió mal",
                    color: "error"
                });
            }
            store.dispatch("showSnackbar", {
                text: err.response.data.message,
                color: "error"
            });
            console.error(err);
            callback(err);
        });
}

export {
    customHttpRequest
}