import { ICountablePackageItem } from "picaStructure";
import { ItemButton } from "../Components";
export declare class PicaChapterLevelClue extends ItemButton {
    private gou;
    constructor(scene: Phaser.Scene, dpr: number, width: number, height: number);
    setItemData(data: ICountablePackageItem): void;
    setTexture(key: string, frame: string): void;
}
