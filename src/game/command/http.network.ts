import { Handler } from "utils";

export class HttpNetWork {
    static Get(url, compl?: Handler, error?: Handler) {
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.timeout = this.timeOut;
        xmlHttp.open("GET", url, true);
        xmlHttp.onreadystatechange = (ev: Event) => {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    if (compl) compl.runWith(xmlHttp);
                } else if (xmlHttp.status === 404) {
                    if (error) error.runWith(xmlHttp.response);
                }
            }
        };
        xmlHttp.ontimeout = (ev: Event) => {
            if (error) error.runWith(xmlHttp.response);
        };
        xmlHttp.send();
    }

    static Post(url, options: string[], compl?: Handler, error?: Handler, timeOut: number = 15000) {

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.timeout = timeOut;
        xmlHttp.open("POST", url, true);
        const formData = new FormData();
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < options.length; i++) {
            const op = options[i];
            const arr = op.split(":");
            if (arr && arr.length === 2)
                formData.append(arr[0], arr[1]);
        }
        xmlHttp.onreadystatechange = (ev: Event) => {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    if (compl) compl.runWith(xmlHttp);
                } else if (xmlHttp.status === 404) {
                    if (error) error.runWith(xmlHttp.response);
                }
            }
        };
        xmlHttp.ontimeout = (ev: Event) => {
            if (error) error.runWith(xmlHttp.response);
        };
        xmlHttp.send(formData);
    }
    private static timeOut = 15000;
}
