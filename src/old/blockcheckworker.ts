import { Export, RPCPeer } from "webworker-rpc";
// import { ViewblockManager } from "./rooms/cameras/viewblock.manager";

// const blockcheckworker: Worker = self as any;
// const checkDelayTime: number = 800;
// let checkBolckNum: any;
// let blockManager: ViewblockManager;
// function startCheckBlock() {
//     checkBolckNum = setTimeout(() => {
//         postMessage({ "method": "startCheckBlock" });
//         // blockManager.check();
//     }, checkDelayTime);
// }

// function endCheckBlock() {
//     if (checkBolckNum) {
//         clearTimeout(checkBolckNum);
//     }
// }

// blockcheckworker.onmessage = (ev) => {
//     const data: any = ev.data;
//     switch (data.method) {
//         case "startCheckBlock":
//             blockManager = data.manager;
//             startCheckBlock();
//             break;
//         case "endCheckBlock":
//             endCheckBlock();
//             break;
//     }
// };

class BlockCheckPeer extends RPCPeer {
    private readonly checkDelayTime: number = 800;
    private checkBolckNum: any;
    // private blockManager: ViewblockManager;
    constructor() {
        super("blockCheckWorker");
    }

    @Export()
    public startCheckBlock() {
        this.checkBolckNum = setTimeout(() => {
            postMessage({ "method": "startCheckBlock" });// TODO:使用this.remote
            // blockManager.check();
        }, this.checkDelayTime);
    }

    @Export()
    public endCheckBlock() {
        if (this.checkBolckNum) {
            clearTimeout(this.checkBolckNum);
        }
    }
}

const context: BlockCheckPeer = new BlockCheckPeer();
