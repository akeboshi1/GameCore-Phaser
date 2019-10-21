import { Panel } from "../components/panel";
import { Url } from "../../utils/resUtil";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { op_client } from "pixelpai_proto";
import { DragDropIcon } from "../bag/dragDropIcon";

export class ItemDetailView extends Panel {
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    private mPreBtn: Phaser.GameObjects.Sprite;
    private mNextBtn: Phaser.GameObjects.Sprite;
    private mNameTF: Phaser.GameObjects.Text;
    private mDescTF: Phaser.GameObjects.Text;
    private mIcon: DragDropIcon;
    private mBtnList: any[];
    constructor(scene: Phaser.Scene, private mWorld: WorldService) {
        super(scene);
    }

    public show(param?: any) {
        super.show(param);
        this.mData = param[0];
        if (param.display.length > 0) {
            this.loadIcon(param.display[0]);
        }

        if (param.text.length > 0) {
            this.setText(param.text[0].text);
        }

        if (param.button.length > 0) {
            // this.m_Bt.setText(param.button[0].text);
        }
    }

    public setText(value: string): void {
        this.mDescTF.setText(value);
    }

    public loadIcon(value: string): void {
        if (this.mIcon) {
            this.mIcon.load(Url.getOsdRes(value), () => {
                // if (this.mCallBack) this.mCallBack();
            });
        }
    }

    protected preload() {
        this.mResStr = "itemDetail";
        this.mResPng = "ui/bag/bagView.png";
        this.mResJson = "ui/bag/bagView.json";
        if (!this.mScene) {
            return;
        }
        this.mScene.load.atlas("itemDetail", Url.getRes("ui/bag/bagView.png"), Url.getRes("ui/bag/bagView.json"));
        super.preload();
    }

    protected init() {
        super.init();
        const size: Size = this.mWorld.getSize();
        const width = size.width;
        const height = size.height;
        // const rect = this.mScene.add.graphics();
        // rect.fillStyle(0, .2);
        // rect.fillRect(0, 0, width, height);

        this.mPreBtn = this.mScene.make.sprite(undefined, false);
        this.mPreBtn.setTexture(this.mResStr, "bagView_tab");
        this.mPreBtn.x = -380;

        this.mNextBtn = this.mScene.make.sprite(undefined, false);
        this.mNextBtn.setTexture(this.mResStr, "bagView_tab");
        this.mNextBtn.scaleX = -1;
        this.mNextBtn.x = 380;

        this.add(this.mPreBtn);
        this.add(this.mNextBtn);

        const iconBG: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        iconBG.fillStyle(0xEF9F5D, .5);
        iconBG.fillRect(0, 0, 256, 256);
        this.add(iconBG);

        const itemBG: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        itemBG.fillStyle(0, .5);
        itemBG.fillRect(0, 0, 658, 190);
        this.add(itemBG);

        this.mNameTF = this.mScene.make.text(undefined, false);
        this.mNameTF.setFontFamily("YaHei");
        this.mNameTF.setFontStyle("bold");
        this.mNameTF.setFontSize(20);
        this.mNameTF.x = size.width / 2 - 10;
        this.mNameTF.y = size.height / 2 - 10;
        this.add(this.mNameTF);

        this.mDescTF = this.mScene.make.text(undefined, false);
        this.mDescTF.setFontFamily("YaHei");
        this.mDescTF.setFontStyle("bold");
        this.mDescTF.setFontSize(25);
        this.add(this.mDescTF);

        this.mIcon = new DragDropIcon(this.mScene, 0, 0);
        this.add(this.mIcon);
    }

}
