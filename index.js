var gameCore = {
    editor: require("./editor.js"),
    mainWorker: require("./mainWorker_worker.js"),
    physicalWorker: require("./physicalWorker_worker.js"),
    render: require("./renderPeer.js"),
}
module.exports = gameCore
