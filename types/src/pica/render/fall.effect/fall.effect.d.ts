import { op_def } from "pixelpai_proto";
export declare class FallEffect extends Phaser.GameObjects.Container {
    private mDisplay;
    private mStatus;
    private mEnable;
    constructor(scene: Phaser.Scene, scaleRatio: number);
    show(status: op_def.PathReachableStatus): void;
    private load;
    private showEnable;
    private showDisable;
    private onCompleteHandler;
}
