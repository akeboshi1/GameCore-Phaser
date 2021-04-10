import { Handler } from "utils";
import { op_client } from "pixelpai_proto";
export declare class PicaRoamEffectOnePanel extends Phaser.GameObjects.Container {
    private video;
    private send;
    private blackGraphic;
    private isOne;
    private loopTimes;
    private rewardDatas;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number);
    init(): void;
    setHandler(send: Handler): void;
    setRewardDatas(datas: op_client.ICountablePackageItem[], one: boolean): void;
    play(): void;
    private playBeforeVideo;
    private playRewardVideo;
    private onCompleteHandler;
    private setVideoSize;
}
