var HttpNetWork = /** @class */ (function () {
    function HttpNetWork() {
    }
    HttpNetWork.Get = function (url, compl, error) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.timeout = this.timeOut;
        xmlHttp.open("GET", url, true);
        xmlHttp.onreadystatechange = function (ev) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    if (compl)
                        compl.runWith(xmlHttp);
                }
                else if (xmlHttp.status === 404) {
                    if (error)
                        error.runWith(xmlHttp.response);
                }
            }
        };
        xmlHttp.ontimeout = function (ev) {
            if (error)
                error.runWith(xmlHttp.response);
        };
        xmlHttp.send();
    };
    HttpNetWork.Post = function (url, options, compl, error, timeOut) {
        if (timeOut === void 0) { timeOut = 15000; }
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.timeout = timeOut;
        xmlHttp.open("POST", url, true);
        var formData = new FormData();
        // tslint:disable-next-line:prefer-for-of
        for (var i = 0; i < options.length; i++) {
            var op = options[i];
            var arr = op.split(":");
            if (arr && arr.length === 2)
                formData.append(arr[0], arr[1]);
        }
        xmlHttp.onreadystatechange = function (ev) {
            if (xmlHttp.readyState === 4) {
                if (xmlHttp.status === 200) {
                    if (compl)
                        compl.runWith(xmlHttp);
                }
                else if (xmlHttp.status === 404) {
                    if (error)
                        error.runWith(xmlHttp.response);
                }
            }
        };
        xmlHttp.ontimeout = function (ev) {
            if (error)
                error.runWith(xmlHttp.response);
        };
        xmlHttp.send(formData);
    };
    HttpNetWork.timeOut = 15000;
    return HttpNetWork;
}());
export { HttpNetWork };
//# sourceMappingURL=http.network.js.map