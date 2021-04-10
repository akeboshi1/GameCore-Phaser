import { BBCodeText } from "apowophaserui";
import { DynamicImage } from "./dynamic.image";
export declare class ImageValue extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected icon: Phaser.GameObjects.Image | DynamicImage;
    protected value: BBCodeText | Phaser.GameObjects.Text;
    protected uintText: any;
    protected offset: Phaser.Geom.Point;
    protected layoutType: number;
    protected uintImg: boolean;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, style?: any);
    setUintText(data: {
        text?: string;
        style?: any;
        fontStyle?: string;
        img?: boolean;
        key?: string;
        frame?: string;
    }): void;
    setUintTextVisible(visible: boolean): void;
    setFrameValue(text: string, key: string, frame: string): void;
    setText(tex: string): void;
    setFontStyle(style: string): void;
    setTextStyle(style: object): void;
    setTextFilter(filterMode: Phaser.Textures.FilterMode): void;
    setShadow(x?: number, y?: number, color?: string, blur?: number, shadowStroke?: boolean, shadowFill?: boolean): void;
    setStroke(color: string, thickness: number): void;
    setOffset(x: number, y: number): void;
    resetSize(): void;
    /**
     *
     * @param type 1-左对齐，2-居中，3-右对齐
     */
    setLayout(type: number): void;
    protected create(key: string, frame: string, style: any): void;
    private resetPosition;
}
export declare class ImageBBCodeValue extends ImageValue {
    protected value: BBCodeText;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, style?: any);
    protected create(key: string, frame: string, style: any): void;
}
export declare class DynamicImageValue extends ImageValue {
    protected icon: DynamicImage;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, style?: any);
    load(url: string): void;
    protected create(key: string, frame: string, style: any): void;
    get textWidth(): number;
}
