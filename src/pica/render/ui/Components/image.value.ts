import { BBCodeText } from "apowophaserui";
import { UIAtlasName } from "../../../res";
import { Font, Handler, UIHelper } from "utils";
import { DynamicImage } from "gamecoreRender";

export class ImageValue extends Phaser.GameObjects.Container {
    protected dpr: number;
    protected icon: Phaser.GameObjects.Image | DynamicImage;
    protected value: BBCodeText | Phaser.GameObjects.Text;
    protected uintText: any;
    protected offset: Phaser.Geom.Point;
    protected layoutType: number = 1;
    protected uintImg: boolean = false;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, style?: any) {
        super(scene);
        this.dpr = dpr;
        this.setSize(width, height);
        this.offset = new Phaser.Geom.Point(0, 0);
        this.create(key, frame, style);
        this.add([this.icon, this.value]);
        this.resetSize();
    }

    public setUintText(data: { text?: string, style?: any, fontStyle?: string, img?: boolean, key?: string, frame?: string }) {
        if (!this.uintText) {
            if (data.img) {
                this.uintText = this.scene.make.image({ key: UIAtlasName.uicommon, frame: "home_silver_myriad" }).setOrigin(0, 0.5);
                this.uintImg = true;
            } else {
                this.uintText = this.scene.make.text({ style: data.style }).setOrigin(0, 0.5);
            }
            this.add(this.uintText);
        }
        if (data.img) {
            if (data.key) this.uintText.setTexture(data.key, data.frame);
            else if (data.frame) this.uintText.setFrame(data.frame);
        } else {
            if (data.style) this.uintText.setStyle(data.style);
            if (data.fontStyle) this.uintText.setFontStyle(data.fontStyle);
            if (data.text) this.uintText.text = data.text;
        }

        this.uintText.visible = true;
        this.resetSize();
    }

    public setUintTextVisible(visible: boolean) {
        if (this.uintText) this.uintText.visible = visible;
    }
    public setFrameValue(text: string, key: string, frame: string) {
        this.icon.setTexture(key, frame);
        this.value.text = text;
        this.resetSize();
    }
    public setText(tex: string) {
        this.value.text = tex;
        this.resetSize();
    }
    public setFontStyle(style: string) {
        this.value.setFontStyle(style);
    }
    public setTextStyle(style: object) {
        (<any>(this.value)).setStyle(style);
    }
    public setTextFilter(filterMode: Phaser.Textures.FilterMode) {
        (<any>(this.value)).texture.setFilter(filterMode);
    }
    public setShadow(x?: number, y?: number, color?: string, blur?: number, shadowStroke?: boolean, shadowFill?: boolean) {
        this.value.setShadow(x, y, color, blur, shadowStroke, shadowFill);
    }
    public setStroke(color: string, thickness: number) {
        this.value.setStroke(color, thickness);
    }
    public setOffset(x: number, y: number) {
        this.offset.x = x;
        this.offset.y = y;
        this.resetSize();
    }
    public resetSize() {
        const uintWidth = this.uintText ? this.uintText.width : 0;
        const width = this.icon.displayWidth + this.value.width + uintWidth;
        const dis = this.width - width;
        if (this.layoutType === 1) {
            this.x -= dis * 0.5;
        } else if (this.layoutType === 3) {
            this.x += dis * 0.5;
        }
        this.setSize(width, this.height);
        this.resetPosition();
    }

    /**
     *
     * @param type 1-左对齐，2-居中，3-右对齐
     */
    public setLayout(type: number) {
        this.layoutType = type;
        this.resetSize();
    }

    protected create(key: string, frame: string, style: any) {
        this.icon = this.scene.make.image({ key, frame });
        this.icon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        if (!style) style = {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 11 * this.dpr,
            color: "#ffffff",
        };
        this.value = this.scene.make.text({ x: 0, y: 0, text: "0", style });
        this.value.setOrigin(0, 0.5);
        const width = this.icon.displayWidth + this.value.width;
        this.setSize(width, this.height);
    }
    private resetPosition() {
        this.icon.x = -this.width * 0.5 + this.icon.displayWidth * 0.5;
        this.value.x = this.icon.x + this.icon.displayWidth * 0.5 + 4 * this.dpr + this.offset.x;
        this.value.y = this.offset.y;
        if (this.uintText) {
            this.uintText.x = this.value.x + this.value.width + 3 * this.dpr;
            this.uintText.y = this.value.y + (this.uintImg ? 1 * this.dpr : 0);
        }
    }
}
export class ImageBBCodeValue extends ImageValue {
    protected value: BBCodeText;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, style?: any) {
        super(scene, width, height, key, frame, dpr, style);
    }
    protected create(key: string, frame: string, style: any) {
        this.icon = this.scene.make.image({ key, frame });
        this.icon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        if (!style) style = {
            fontFamily: Font.DEFULT_FONT,
            fontSize: 11 * this.dpr,
            color: "#ffffff",
        };
        this.value = new BBCodeText(this.scene, 0, 0, "10", style);
        this.value.setOrigin(0, 0.5);
        const width = this.icon.displayWidth + this.value.width;
        this.setSize(width, this.height);
    }
}

export class DynamicImageValue extends ImageValue {
    protected icon: DynamicImage;
    constructor(scene: Phaser.Scene, width: number, height: number, key: string, frame: string, dpr: number, style?: any) {
        super(scene, width, height, key, frame, dpr, style);
    }
    public load(url: string, compl?: Handler) {
        this.icon.load(url, this, () => {
            this.icon.scale = 1;
            this.icon.displayHeight = this.height - 4 * this.dpr;
            this.icon.scaleX = this.icon.scaleY;
            this.icon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
            this.resetSize();
            if (compl) compl.run();
        });
    }
    protected create(key: string, frame: string, style: any) {
        this.icon = new DynamicImage(this.scene, 0, 0);
        this.icon.scale = this.dpr;
        if (!style) style = UIHelper.whiteStyle(this.dpr);
        this.value = this.scene.make.text({ x: 0, y: 0, text: "10", style });
        this.value.setOrigin(0, 0.5);
        const width = this.icon.displayWidth + this.value.width;
        this.setSize(width, this.height);
    }

    get textWidth() {
        return this.value.width;
    }
}
