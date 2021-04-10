export const RENDER_PEER = "render";
export const PICARENDER_PEER = "pica.render";
export const MAIN_WORKER = "mainWorker";
// export const HEARTBEAT_WORKER = "heartBeatPeer";
export const PHYSICAL_WORKER = "physicalPeer";
// export const HEARTBEAT_WORKER_URL = "js/heartWorker.js";
import version from "../../version";
// webworker_rpc中直接使用的传入路径  支持相对路径
export const MAIN_WORKER_URL = "./js/mainWorker_v" + version + ".js";
export const PHYSICAL_WORKER_URL = "./js/physicalWorker_v" + version + ".js";
// export const MAIN_WORKER_URL = "js/mainWorker.js";
// export const PHYSICAL_WORKER_URL = "js/physicalWorker.js";
