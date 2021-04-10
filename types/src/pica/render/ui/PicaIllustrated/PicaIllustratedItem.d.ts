import { ItemButton } from "picaRender";
import { ICountablePackageItem } from "picaStructure";
export declare class IllustratedItem extends ItemButton {
    private codeTex;
    private star;
    private surveyImg;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    setItemData(item: ICountablePackageItem, code?: boolean): void;
}
