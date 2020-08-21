import { Logger } from "../utils/log";
const heartWorker: Worker = self as any;
const delayTime: number = 20000;
let reConnectCount: number = 0;
let startDelay: any;
function startBeat() {
    startDelay = setInterval(() => {
        if (reConnectCount >= 8) {
            postMessage({ "method": "reConnect" });
            return;
        }
        reConnectCount++;
        // Logger.getInstance().debug("heartBeat:" + reConnectCount);
        postMessage({ "method": "heartBeat" });
    }, delayTime);
}

function endBeat() {
    reConnectCount = 0;
    if (startDelay) {
        clearInterval(startDelay);
    }
    postMessage({ "method": "endHeartBeat" });
}

function load(paths: string[]) {
    const len: number = paths.length;
    const path = paths.slice(0, 1)[0];
    const xhr = new XMLHttpRequest();
    xhr.open("GET", path, true);
    xhr.responseType = "blob";
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            postMessage(xhr.response, [xhr.response]);
            if (len > 0) {
                load(paths.slice(0, 1));
            }
            close();
        }
    };
    xhr.send(null);
}

heartWorker.onmessage = (ev) => {
    const data: any = ev.data;
    switch (data.method) {
        case "startBeat":
            startBeat();
            break;
        case "clearBeat":
            reConnectCount = 0;
            // Logger.getInstance().debug("clearHeartBeat:" + reConnectCount);
            break;
        case "endBeat":
            endBeat();
            break;
        case "load":
            load(data.data);
            break;
    }
};
