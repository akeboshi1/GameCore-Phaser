import { IPos, IPosition45Obj, IRectangle, Logger } from "utils";

export class BlockIndex {
    readonly blockWidth: number = 300;
    readonly blockHeight: number = 150;

    getBlockForCameras(cameraView: IRectangle, sceneSize: IPosition45Obj) {
        if (!cameraView || !sceneSize) return;
        const aPoint = { x: cameraView.x, y: cameraView.y };
        const bPoint = { x: cameraView.x + cameraView.width, y: cameraView.y + cameraView.height };
        const cPoint = { x: cameraView.x, y: cameraView.y + cameraView.height };
        const dPoint = { x: cameraView.x + cameraView.width, y: cameraView.y };
        const list = [aPoint, bPoint, cPoint, dPoint];

        const pointerList = [];
        let minX = 0;
        let minY = 0;
        let maxX = 0;
        let maxY = 0;
        list.forEach((pos) => {
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
        const widLen = Math.ceil((maxX - minX) / this.blockWidth);
        const heiLen = Math.ceil((maxY - minY) / this.blockHeight);
        for (let i = 0; i < widLen + 1; i++) {
            for (let j = 0; j < heiLen + 1; j++) {
                pointerList.push({ x: minX + i * this.blockWidth, y: minY + j * this.blockHeight });
            }
        }
        // 检查4个定点
        const blockIndex = this.getBlockIndexs(pointerList, sceneSize);
        // 数组去重
        Array.from(new Set(blockIndex));
        return blockIndex;
    }

    getBlockIndexs(pointers: IPos[], sceneSize: IPosition45Obj) {
        const result = [];
        for (const pointer of pointers) {
            result.push(this.getBlockIndex(pointer.x, pointer.y, sceneSize));
        }
        return result;
    }

    getBlockIndex(x: number, y: number, sceneSize: IPosition45Obj) {
        const { rows, cols, tileWidth, tileHeight } = sceneSize;
        const max_h = Math.ceil((cols + rows) * (tileHeight / 2) / this.blockHeight);
        const h = Math.floor(y / this.blockHeight);
        const w = Math.floor((x + rows * tileWidth / 2) / this.blockWidth);
        return h + w * max_h;
    }
}
