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
    clickCallBack: Function;
}

export class Radio extends Phaser.GameObjects.Container implements ISelectCallUI {
    protected itemList: RadioItemRender[];
    private mScene: Phaser.Scene;
    private mConfig: IRadioResConfig;
    private mBg: Phaser.GameObjects.Image;
    // private mArrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, config: IRadioResConfig) {
        super(scene);
        this.mScene = scene;
        this.mConfig = config;
        this.init();
    }

    public set text(value: string[]) {
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
        this.itemList = [];
        const len: number = value.length;
        for (let i: number = 0; i < len; i++) {
            const item: RadioItemRender = new RadioItemRender(this.mScene, this, this.mConfig.wid, this.mConfig.hei, this.mConfig.resKey, "radio.arrow.png");
            const str: string = value[i];
            item.itemData = {
                index: i,
                text: str,
                data: {},
            };
            this.itemList.push(item);
        }
        // 默認顯示第0個
        this.selectCall(this.itemList[0].itemData);
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
                const item: SelectCallItem = this.itemList[i];
                if (!item) continue;
                item.destroy();
            }
            this.itemList.length = 0;
            this.itemList = null;
        }
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
        this.mBg.setSize(this.mConfig.wid, this.mConfig.hei);
        this.add(this.mBg);
    }
}
export class RadioItemRender extends SelectCallItem {
    private mArrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, selectCallUI: ISelectCallUI, wid: number, hei: number, resKey: string, arrowRes: string) {
        super(scene, selectCallUI, wid, hei);
        this.mArrow = scene.make.image(undefined, false);
        this.mArrow.setTexture(resKey, arrowRes);
        this.mArrow.x = wid - this.mArrow.width + 10;
        this.mArrow.y = (hei - this.mArrow.height >> 1) + 4;
        this.add(this.mArrow);
    }

    public setSelected(val: boolean) {
        this.mSelectBG.visible = val;
        this.mArrow.visible = val;
    }

    protected overHandler() {
        super.overHandler();
        this.mArrow.visible = true;
    }

    protected outHandler() {
        this.mSelectBG.visible = false;
        this.mArrow.visible = false;
    }
}
