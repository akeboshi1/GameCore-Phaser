var base = {
    mainPeer: require("./mainWorker_worker.js"),
    physicalPeer: require("./physicalWorker_worker.js"),
    renderPeer: require("./renderPeer.js"),
    utils: require("./utils.js"),
    structure: require("./structure.js"),
    baseRender: require("./baseRender.js"),
    baseGame: require("./baseGame.js")
}
module.exports = base;
