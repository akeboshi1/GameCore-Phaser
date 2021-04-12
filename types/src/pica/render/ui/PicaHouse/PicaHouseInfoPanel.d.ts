import { op_client } from "pixelpai_proto";
import { Handler } from "utils";
export declare class PicaHouseInfoPanel extends Phaser.GameObjects.Container {
    private dpr;
    private key;
    private roomname;
    private roomlevel;
    private expvalue;
    private popvalue;
    private goodvalue;
    private compviness;
    private turnover;
    private deprecia;
    private renovateBtn;
    private help;
    private equirementsHandler;
    private helptips;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number);
    setAttributeData(data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_EDIT_MODE_ROOM_INFO, isSelf: boolean): void;
    setHandler(equirements: Handler): void;
    createAttribute(): void;
    private onRenovateHandler;
    private onHelpHandler;
    private getLevelImgs;
    private getpopImgs;
    private getgoodImgs;
}
