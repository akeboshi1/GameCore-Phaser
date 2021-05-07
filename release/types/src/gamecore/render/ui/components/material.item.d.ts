import { PropItem } from "./prop.item";
export declare class MaterialItem extends PropItem {
    private mselect;
    private selectframe;
    constructor(scene: Phaser.Scene, key: string, bgframe: string, selectframe: string, dpr: number, style?: any);
    setItemData(data: any, needvalue?: boolean): void;
    set select(value: boolean);
    get select(): boolean;
    private getCountText;
}
