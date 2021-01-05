import { DynamicImage } from "./dynamic.image";
import { op_client } from "pixelpai_proto";
import { BBCodeText } from "apowophaserui";
import { SoundButton } from "./soundButton";
import { Font, Handler, Url } from "utils";
export class PropItem extends SoundButton {
    public itemData: op_client.ICountablePackageItem;
    protected dpr: number;
    protected key: string;
    protected itemIcon: DynamicImage;
    protected itemCount: BBCodeText;
    protected bg: Phaser.GameObjects.Image;
    protected send: Handler;
    protected bgframe: string;
    constructor(scene: Phaser.Scene, key: string, bgframe: string, dpr: number, style?: any) {
        super(scene, 0, 0);
        this.dpr = dpr;
        this.key = key;
        this.bgframe = bgframe;
        this.bg = this.scene.make.image({ key, frame: bgframe });
        this.itemIcon = new DynamicImage(scene, 0, 0);
        this.itemIcon.setTexture(key, bgframe);
        style = style || { color: "#000000", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT };
        this.itemCount = new BBCodeText(this.scene, 0, 15 * dpr, "", style)
            .setOrigin(0.5);
        this.add([this.bg, this.itemIcon, this.itemCount]);
        this.setSize(this.bg.width, this.bg.height);
        this.itemCount.y = this.height * 0.5 + 8 * dpr;
    }

    public setHandler(handler: Handler) {
        this.send = handler;
    }
    public setItemData(data: op_client.ICountablePackageItem) {
        this.itemData = data;
        this.itemCount.text = data.count + "";
        const url = Url.getOsdRes(data.display.texturePath);
        const zoom = this.getWorldTransformMatrix().scaleX;
        this.itemIcon.scale = this.dpr/zoom;
        this.itemIcon.load(url, this, () => {
            this.itemIcon.setPosition(0, 0);
        });
    }

    public setTextPosition(x: number, y: number) {
        this.itemCount.x = x;
        this.itemCount.y = y;
    }
}
