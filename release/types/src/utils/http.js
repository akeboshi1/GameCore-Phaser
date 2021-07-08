export function load(path, responseType) {
    return new Promise(function (resolve, reject) {
        var http = new XMLHttpRequest();
        http.addEventListener("error", function () {
            // tslint:disable-next-line:no-console
            console.log("http error =============>>>>");
        });
        http.timeout = 20000; // 超时时间，单位是毫秒
        http.onload = function (response) {
            var currentTarget = response.currentTarget;
            if (currentTarget && currentTarget["status"] === 200)
                resolve(response.currentTarget);
            else
                reject(path + " load error " + currentTarget["status"]);
        };
        http.onerror = function () {
            // Logger.getInstance().warn(`${path} load error`);
            // tslint:disable-next-line:no-console
            console.log("http error ====>");
            reject(path + " load error!!!!!");
        };
        http.ontimeout = function (e) {
            // XMLHttpRequest 超时。在此做某事。
            // tslint:disable-next-line:no-console
            console.log("http timeout ====>");
            reject(path + " load ontimeout!!!!!");
        };
        http.open("GET", path, true);
        http.responseType = responseType || "";
        http.send();
    });
}
export function loadArr(urls) {
    return new Promise(function (resolve, reject) {
        var loaded = 0;
        var errors = [];
        var datasMap = new Map();
        var compl = function () {
            if (urls.length === loaded) {
                if (errors.length === 0)
                    resolve(datasMap);
                else
                    reject(errors);
            }
            else {
                var url_1 = urls[loaded];
                load(url_1.path, url_1.type).then(function (req) {
                    datasMap.set(url_1.resName, req);
                    compl();
                }, function (response) {
                    errors.push(response);
                    compl();
                });
            }
            loaded++;
        };
        compl();
    });
}
//# sourceMappingURL=http.js.map