import { ThreeSliceButton } from "gamecoreRender";
import { op_client } from "pixelpai_proto";
import { Handler } from "utils";
export declare class PicaTaskItem extends Phaser.GameObjects.Container {
    taskButton: ThreeSliceButton;
    questData: op_client.IPKT_Quest;
    private content;
    private bg;
    private headIcon;
    private taskName;
    private taskDes;
    private arrow;
    private mExtend;
    private dpr;
    private send;
    private mIsExtend;
    private zoom;
    constructor(scene: Phaser.Scene, dpr: number, zoom: number);
    setTaskData(data: op_client.IPKT_Quest): void;
    setTaskDetail(data: op_client.PKT_Quest): void;
    setHandler(send: Handler): void;
    setExtend(isExtend: boolean, haveCallBack?: boolean): void;
    get extend(): boolean;
    private getProgressStr;
    private onTaskButtonHandler;
    private openExtend;
    private closeExtend;
    private setTextLimit;
}
