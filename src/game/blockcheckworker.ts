import { ViewblockManager } from "../rooms/cameras/viewblock.manager";

const blockcheckworker: Worker = self as any;
const checkDelayTime: number = 800;
let checkBolckNum: any;
let blockManager: ViewblockManager;
function startCheckBlock() {
    checkBolckNum = setTimeout(() => {
        postMessage({ "method": "startCheckBlock" });
        // blockManager.check();
    }, checkDelayTime);
}

function endCheckBlock() {
    if (checkBolckNum) {
        clearTimeout(checkBolckNum);
    }
}

blockcheckworker.onmessage = (ev) => {
    const data: any = ev.data;
    switch (data.method) {
        case "startCheckBlock":
            blockManager = data.manager;
            startCheckBlock();
            break;
        case "endCheckBlock":
            endCheckBlock();
            break;
    }
};
