import { BasePanel } from "../Components/BasePanel";
import { DragDropIcon } from "../Bag/DragDropIcon";
import { NinePatchButton } from "../Components/Ninepatch.button";
import { op_gameconfig_01 } from "pixelpai_proto";
import { WorldService } from "../../world.service";
import { Size } from "../../../utils/size";
import { BlueButton, Url } from "../../../utils/resUtil";

export class ItemDetail extends BasePanel {
    private mBtnList: NinePatchButton[];
    private mBtnWid: number = 100;
    private mBtnHei: number = 40;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mNameTF: Phaser.GameObjects.Text;
    private mDescTF: Phaser.GameObjects.Text;
    private mIcon: DragDropIcon;
    private mWid: number = 0;
    private mHei: number = 0;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }

    public getBtnList(): NinePatchButton[] {
        return this.mBtnList;
    }

    public resize(wid: number = 0, hei: number = 0) {
        const size: Size = this.mWorld.getSize();
        if (this.mWorld.game.device.os.desktop) {
            this.x = size.width - (this.width + this.mBtnWid) / 2 * this.mWorld.uiScale >> 1;
            this.y = size.height - this.height * this.mWorld.uiScale >> 1;
        } else {
            this.x = size.width - (this.width + this.mBtnWid) / 2 * this.mWorld.uiScale >> 1;
            this.y = size.height - this.height * this.mWorld.uiScale >> 1;
        }
        this.scale = this.mWorld.uiScale;
    }

    public show(param?: any) {
        this.mShowData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShow = true;
        const data = this.mShowData[0];
        if (data.display.length > 0) {
            this.loadIcon(data.display[0]);
        }

        if (data.text.length > 0) {
            this.setText(data.text[0].text);
        }

        if (data.button.length > 0) {
            this.mBtnList = [];
            let btn: NinePatchButton;
            const len: number = data.button.length;
            let preY: number = 20;
            const preX: number = this.mWid + 50;
            for (let i: number = 0; i < len; i++) {
                const btnData: op_gameconfig_01.IButton = data.button[i];
                btn = new NinePatchButton(this.mScene, 0, 0, this.mBtnWid, this.mBtnHei, BlueButton.getName(), BlueButton.getName(), btnData.text, BlueButton.getConfig(), btnData);
                this.mBtnList.push(btn);
                btn.x = preX;
                btn.y = preY;
                preY += btn.height + 40;
                this.add(btn);
            }
        }
        const bg = this.mScene.add.graphics();
        bg.fillStyle(0, .6);
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
        this.disInteractive();
        super.hide();
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
        this.mScene.load.atlas(BlueButton.getName(), BlueButton.getPNG(), BlueButton.getJSON());
        this.mScene.load.atlas("itemDetail", Url.getRes("ui/bag/bagView.png"), Url.getRes("ui/bag/bagView.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        this.mWid = 290;
        this.mHei = 0;

        this.mIcon = new DragDropIcon(this.mScene, 30, 25);
        this.add(this.mIcon);

        this.mNameTF = this.scene.make.text({
            style: {
                fontFamily: "YaHei",
                fontSize: 20,
                origin: { x: 0, y: 0 },
                wordWrap: { width: 250, useAdvancedWrap: true }
            }
        }, false);
        this.mNameTF.setFontStyle("bold");
        this.mNameTF.setAlign("left");
        this.mNameTF.x = this.mIcon.x + this.mIcon.width;
        this.mNameTF.y = this.mIcon.y;
        this.add(this.mNameTF);

        this.mDescTF = this.scene.make.text({
            style: {
                fontFamily: "YaHei",
                fontSize: 25,
                origin: { x: 0, y: 0 },
                wordWrap: { width: 250, useAdvancedWrap: true }
            }
        }, false);
        this.mDescTF.setFontStyle("bold");
        this.mDescTF.setAlign("left");
        this.mDescTF.x = this.mIcon.x - this.mIcon.width / 2;
        this.mDescTF.y = this.mIcon.y + this.mIcon.height + 20;
        this.add(this.mDescTF);

        this.mInitialized = true;
        this.show(this.mShowData);
    }
}
