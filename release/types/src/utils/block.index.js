var BlockIndex = /** @class */ (function () {
    function BlockIndex() {
        this.blockWidth = 300;
        this.blockHeight = 150;
    }
    BlockIndex.prototype.getBlockForCameras = function (cameraView, sceneSize) {
        if (!cameraView || !sceneSize)
            return;
        var aPoint = { x: cameraView.x, y: cameraView.y };
        var bPoint = { x: cameraView.x + cameraView.width, y: cameraView.y + cameraView.height };
        var cPoint = { x: cameraView.x, y: cameraView.y + cameraView.height };
        var dPoint = { x: cameraView.x + cameraView.width, y: cameraView.y };
        var list = [aPoint, bPoint, cPoint, dPoint];
        var pointerList = [];
        var minX = 0;
        var minY = 0;
        var maxX = 0;
        var maxY = 0;
        list.forEach(function (pos) {
            if (pos.x < minX) {
                minX = pos.x;
            }
            if (pos.x > maxX) {
                maxX = pos.x;
            }
            if (pos.y < minY) {
                minY = pos.y;
            }
            if (pos.y > maxY) {
                maxY = pos.y;
            }
        });
        var widLen = Math.ceil((maxX - minX) / this.blockWidth);
        var heiLen = Math.ceil((maxY - minY) / this.blockHeight);
        for (var i = 0; i < widLen + 1; i++) {
            for (var j = 0; j < heiLen + 1; j++) {
                pointerList.push({ x: minX + i * this.blockWidth, y: minY + j * this.blockHeight });
            }
        }
        // 检查4个定点
        var blockIndex = this.getBlockIndexs(pointerList, sceneSize);
        // 数组去重
        Array.from(new Set(blockIndex));
        return blockIndex;
    };
    BlockIndex.prototype.getBlockIndexs = function (pointers, sceneSize) {
        var result = [];
        for (var _i = 0, pointers_1 = pointers; _i < pointers_1.length; _i++) {
            var pointer = pointers_1[_i];
            result.push(this.getBlockIndex(pointer.x, pointer.y, sceneSize));
        }
        return result;
    };
    BlockIndex.prototype.getBlockIndex = function (x, y, sceneSize) {
        var rows = sceneSize.rows, cols = sceneSize.cols, tileWidth = sceneSize.tileWidth, tileHeight = sceneSize.tileHeight;
        var max_h = Math.ceil((cols + rows) * (tileHeight / 2) / this.blockHeight);
        var h = Math.floor(y / this.blockHeight);
        var w = Math.floor((x + rows * tileWidth / 2) / this.blockWidth);
        return h + w * max_h;
    };
    return BlockIndex;
}());
export { BlockIndex };
//# sourceMappingURL=block.index.js.map