import { ISelectCallItemData, ISelectCallUI, SelectCallItem } from "./comboBox";

export interface IRadioResConfig {
    wid: number;
    hei: number;
    resKey: string;
    resPng: string;
    resJson: string;
    resBg: string;
    resArrow: string;
    fontStyle: { size: number, color: string, bold: boolean };
    completeBack: Function;
    clickCallBack: Function;
}

export class Radio extends Phaser.GameObjects.Container implements ISelectCallUI {
    protected itemList: RadioItemRender[];
    private mScene: Phaser.Scene;
    private mConfig: IRadioResConfig;
    private mBg: Phaser.GameObjects.Image;
    private mIsShow: boolean = false;
    // private mArrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, config: IRadioResConfig) {
        super(scene);
        this.mScene = scene;
        this.mConfig = config;
        this.init();
    }

    public setRadioData(value: string[]) {
        this.clearRadioData();
        this.itemList = [];
        const len: number = value.length;
        for (let i: number = 0; i < len; i++) {
            const item: RadioItemRender = new RadioItemRender(this.mScene, this, this.mConfig.wid, 20, this.mConfig.resKey, this.mConfig.resArrow);
            const str: string = value[i];
            item.itemData = {
                index: i,
                text: str,
                data: {},
            };
            item.x = this.mConfig.wid / 2 + 30;
            item.y = i * 33 + 23;
            this.add(item);
            this.itemList.push(item);
        }
        // 默認选择第0個
        //  this.selectCall(this.itemList[0].itemData);
    }

    public clearRadioData() {
        if (this.itemList) {
            const itemLen: number = this.itemList.length;
            for (let i: number = 0; i < itemLen; i++) {
                let item: RadioItemRender = this.itemList[i];
                if (!item) continue;
                item.destroy();
                item = null;
            }
            this.itemList.length = 0;
        }
    }

    public get isShow(): boolean {
        return this.mIsShow;
    }

    public set isShow(value: boolean) {
        this.mIsShow = value;
    }

    public selectCall(itemData: ISelectCallItemData) {
        if (this.mConfig.clickCallBack) {
            this.mConfig.clickCallBack.call(this, itemData);
        }
    }

    public destroy() {
        if (this.itemList) {
            const len: number = this.itemList.length;
            for (let i: number = 0; i < len; i++) {
                const item: RadioItemRender = this.itemList[i];
                if (!item) continue;
                item.destroy();
            }
            this.itemList.length = 0;
            this.itemList = null;
        }
        this.removeAll();
        this.removeAllListeners();
        if (this.parentContainer) {
            this.parentContainer.remove(this);
        }
        super.destroy(true);
    }

    protected init() {
        const resKey: string = this.mConfig.resKey;
        const resPng: string = this.mConfig.resPng;
        const resJson: string = this.mConfig.resJson;
        if (!this.mScene.cache.obj.has(resKey)) {
            this.mScene.load.atlas(resKey, resPng, resJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        const resKey: string = this.mConfig.resKey;
        this.mBg = this.mScene.make.image(undefined, false);
        this.mBg.setTexture(resKey, this.mConfig.resBg);
        this.mBg.x = this.mConfig.wid / 2;
        this.mBg.y = this.mConfig.hei / 2;
        this.add(this.mBg);
        this.setSize(this.mConfig.wid, this.mConfig.hei);
        if (this.mConfig.completeBack) {
            this.mConfig.completeBack();
        }
    }
}
export class RadioItemRender extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    protected mSelectBG: Phaser.GameObjects.Graphics;
    protected mData: ISelectCallItemData;
    protected mSelectCallUI: ISelectCallUI;
    private mArrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, selectCallUI: ISelectCallUI, wid: number, hei: number, resKey: string, arrowRes: string) {
        super(scene);
        this.mSelectCallUI = selectCallUI;
        this.mText = this.scene.make.text({
            x: -wid >> 1, y: -hei >> 1,
            style: { font: "bold 20px YaHei", fill: "#F7EDED" }
        }, false);
        this.mText.style.align = "left";
        const COLOR = 0xffcc00;
        this.mSelectBG = scene.make.graphics(undefined, false);
        this.mSelectBG.fillStyle(COLOR, .8);
        this.mSelectBG.fillRect(-wid >> 1, -hei >> 1, wid - 36, hei);
        this.mSelectBG.visible = false;
        this.addAt(this.mSelectBG, 0);
        this.add(this.mText);

        this.setSize(wid, hei);

        this.setInteractive();
        this.on("pointerover", this.overHandler, this);
        this.on("pointerout", this.outHandler, this);
        this.on("pointerdown", this.selectHandler, this);

        this.mArrow = scene.make.image(undefined, false);
        this.mArrow.setTexture(resKey, arrowRes);
        this.mArrow.x = -wid / 2 - 10;
        this.mArrow.y = 0;
        this.mArrow.visible = false;
        this.add(this.mArrow);
    }

    public set itemData(val: ISelectCallItemData) {
        this.mData = val;
        this.mText.text = this.mData.text;
        this.mText.x = -this.width >> 1;
        this.mText.y = -this.height / 2 + (this.height - this.mText.height >> 1);
    }

    public get itemData(): ISelectCallItemData {
        return this.mData;
    }

    public destroy() {
        this.mText.destroy(true);
        this.mSelectBG.destroy(true);
        this.mArrow.destroy(true);
        this.mText = null;
        this.mData = null;
        this.mSelectCallUI = null;
        this.mArrow = null;
        super.destroy(true);
    }

    public setSelected(val: boolean) {
        this.mSelectBG.visible = val;
        this.mArrow.visible = val;
        if (this.mSelectCallUI) this.mSelectCallUI.selectCall(this.itemData);
    }

    protected overHandler() {
        this.mSelectBG.visible = true;
        this.mArrow.visible = true;
    }

    protected outHandler() {
        this.mSelectBG.visible = false;
        this.mArrow.visible = false;
    }

    protected selectHandler() {
        this.overHandler();
        this.mSelectCallUI.selectCall(this.itemData);
    }
}
