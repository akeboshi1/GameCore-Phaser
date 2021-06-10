import { ButtonEventDispatcher } from "gamecoreRender";
import { ImageValue } from "./image.value";
export class ImageValueButton extends ButtonEventDispatcher {
    protected imgValue: ImageValue;
    protected mixWidth: number;
    protected mixHeight: number;
    constructor(scene, width: number, height: number, key: string, frame: string, title: string, dpr: number, style?: any) {
        super(scene, dpr);
        this.setSize(width, height);
        this.mixWidth = width;
        this.mixHeight = height;
        this.imgValue = new ImageValue(scene, width, height, key, frame, dpr, style);
        this.imgValue.setLayout(2);
        this.imgValue.setText(title);
        this.add(this.imgValue);
        this.layout();
    }
    public setFrame(frame: string, key?: string) {
        this.imgValue.setFrame(frame, key);
        this.layout();
    }
    public setText(tex: string) {
        this.imgValue.setText(tex);
        this.layout();
    }
    public setFontStyle(style: string) {
        this.imgValue.setFontStyle(style);
        this.layout();
    }
    public setTextStyle(style: object) {
        ((this.imgValue)).setTextStyle(style);
        this.layout();
    }

    protected layout() {
        const width = this.imgValue.width + 20 * this.dpr;
        this.width = width > this.mixWidth ? width : this.mixWidth;
        this.resize(this.width, this.height);
    }
}
