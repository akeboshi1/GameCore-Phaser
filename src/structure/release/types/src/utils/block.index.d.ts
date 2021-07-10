import { IPos, IPosition45Obj, IRectangle } from "structure";
export declare class BlockIndex {
    readonly blockWidth: number;
    readonly blockHeight: number;
    getBlockForCameras(cameraView: IRectangle, sceneSize: IPosition45Obj): any[];
    getBlockIndexs(pointers: IPos[], sceneSize: IPosition45Obj): any[];
    getBlockIndex(x: number, y: number, sceneSize: IPosition45Obj): number;
}
