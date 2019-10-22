import { Panel } from "../components/panel";
import { Url, BlueButton } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { DragDropIcon } from "../bag/dragDropIcon";
import { NinePatchButton } from "../components/ninepatch.button";
import { op_gameconfig_01 } from "pixelpai_proto";

export class ItemDetail extends Panel {
    private mBtnList: NinePatchButton[];
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mNameTF: Phaser.GameObjects.Text;
    private mDescTF: Phaser.GameObjects.Text;
    private mIcon: DragDropIcon;
    private mWid: number = 0;
    private mHei: number = 0;
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super(scene);
    }

    public getBtnList(): NinePatchButton[] {
        return this.mBtnList;
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height >> 1;
    }

    public show(param?: any) {
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShowing = true;
        const data = this.mData[0];
        if (data.uiDisplay.length > 0) {
            this.loadIcon(data.uiDisplay[0]);
        }

        if (data.text.length > 0) {
            this.setText(data.text[0].text);
        }

        if (data.button.length > 0) {
            this.mBtnList = [];
            let btn: NinePatchButton;
            const len: number = data.button.length;
            let preY: number = 15;
            const preX: number = this.mWid + 35;
            for (let i: number = 0; i < len; i++) {
                const btnData: op_gameconfig_01.IButton = data.button[i];
                btn = new NinePatchButton(this.mScene, 0, 0, 70, 30, "button_blue", btnData.text, {
                    left: 4,
                    top: 4,
                    right: 4,
                    bottom: 4
                }, btnData);
                this.mBtnList.push(btn);
                btn.x = preX;
                btn.y = preY;
                preY += btn.height + 30;
                this.add(btn);
            }
        }
        const bg = this.mScene.add.graphics();
        bg.fillStyle(0, .8);
        bg.fillRoundedRect(0, 0, this.mWid, this.mHei, 6);
        this.addAt(bg, 0);

        this.setSize(this.mWid + 120, this.mHei);
        this.resize();
        this.setInteractive();
    }

    public setText(value: string): void {
        this.mDescTF.setText(value);
        this.mHei += this.mDescTF.y + this.mDescTF.height + 10;
    }

    public loadIcon(value: string): void {
        if (this.mIcon) {
            this.mIcon.load(Url.getOsdRes(value), () => {
                this.mHei += this.mIcon.y + this.mIcon.height;
                // if (this.mCallBack) this.mCallBack();
            });
        }
    }

    public hide() {
        this.removeInteractive();
        super.hide();
        this.destroy();
    }

    public destroy() {
        if (this.mBtnList) {
            this.mBtnList.forEach((btn) => {
                btn.destroy(true);
                btn = null;
            });
            this.mBtnList = null;
        }
        this.mResStr = "";
        this.mResPng = "";
        this.mResJson = "";
        if (this.mNameTF) this.mNameTF.destroy(true);
        if (this.mDescTF) this.mDescTF.destroy(true);
        if (this.mIcon) this.mIcon.destroy();
        this.mNameTF = null;
        this.mDescTF = null;
        this.mIcon = null;
        this.mWid = 0;
        this.mHei = 0;
        super.destroy();
    }

    protected preload() {
        this.mResStr = "itemDetail";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        if (!this.mScene) {
            return;
        }
        this.scene.load.atlas(BlueButton.getName(), BlueButton.getPNG(), BlueButton.getJSON());
        this.mScene.load.atlas("itemDetail", Url.getRes("ui/bag/bagView.png"), Url.getRes("ui/bag/bagView.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.mWid = 200;
        this.mHei = 0;

        this.mIcon = new DragDropIcon(this.mScene, 30, 25);
        this.add(this.mIcon);

        this.mNameTF = this.mScene.make.text(undefined, false);
        this.mNameTF.setFontFamily("YaHei");
        this.mNameTF.setFontStyle("bold");
        this.mNameTF.setFontSize(20);
        this.mNameTF.setAlign("left");
        this.mNameTF.setWordWrapWidth(this.mWid);
        this.mNameTF.x = this.mIcon.x + this.mIcon.width;
        this.mNameTF.y = this.mIcon.y;
        this.add(this.mNameTF);

        this.mDescTF = this.mScene.make.text(undefined, false);
        this.mDescTF.setFontFamily("YaHei");
        this.mDescTF.setFontStyle("bold");
        this.mDescTF.setFontSize(25);
        this.mDescTF.setAlign("left");
        this.mDescTF.setWordWrapWidth(this.mWid);
        this.mDescTF.x = this.mIcon.x - this.mIcon.width / 2;
        this.mDescTF.y = this.mIcon.y + this.mIcon.height + 20;
        this.add(this.mDescTF);

        this.mInitialized = true;
        this.show(this.mData);
    }
}
