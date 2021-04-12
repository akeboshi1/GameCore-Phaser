import { op_pkt_def } from "pixelpai_proto";
export declare class CharacterAttributePanel extends Phaser.GameObjects.Container {
    private key;
    private dpr;
    private attriItems;
    private mspace;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number);
    set space(value: number);
    setAttributeData(datas: op_pkt_def.IPKT_Property[]): void;
}
