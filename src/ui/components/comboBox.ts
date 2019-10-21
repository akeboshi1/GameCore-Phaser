export interface IComboboxRes {
    wid: number;
    hei: number;
    resKey: string;
    resPng: string;
    resJson: string;
    resBg: string;
    resArrow: string;
    fontStyle: { size: number, color: string, bold: boolean };
    up: boolean;
    clickCallBack: Function;
}
export interface ISelectCallItemData {
    index: number;
    text: string;
    data: any;
}
export interface ISelectCallUI {
    selectCall(data: ISelectCallItemData);
}
export class ComboBox extends Phaser.GameObjects.Container implements ISelectCallUI {
    protected itemList: SelectCallItem[];
    private mScene: Phaser.Scene;
    private mConfig: IComboboxRes;
    private mBg: Phaser.GameObjects.Image;
    private mIsopen: boolean = false;
    private mItemBG: Phaser.GameObjects.Graphics;
    private mtxt: Phaser.GameObjects.Text;
    private mArrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, config: IComboboxRes) {
        super(scene);
        this.mScene = scene;
        this.mConfig = config;
        this.init();
    }

    public selectCall(itemData: ISelectCallItemData) {
        this.mtxt.text = itemData.text;
        this.mtxt.x = this.mConfig.wid - this.mtxt.width >> 1;
        this.mtxt.y = this.mConfig.hei - this.mtxt.height >> 1;
        this.showTween(false);
        if (this.mConfig.clickCallBack) {
            this.mConfig.clickCallBack.call(this, itemData);
        }
    }

    public set text(value: string[]) {
        if (this.itemList) {
            const itemLen: number = this.itemList.length;
            for (let i: number = 0; i < itemLen; i++) {
                let item: SelectCallItem = this.itemList[i];
                if (!item) continue;
                item.destroy();
                item = null;
            }
            this.itemList.length = 0;
        }
        this.itemList = [];
        const len: number = value.length;
        for (let i: number = 0; i < len; i++) {
            const item: SelectCallItem = new SelectCallItem(this.mScene, this, this.mConfig.wid, this.mConfig.hei);
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
        super.destroy(true);
    }

    private init() {
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
        this.mArrow = this.mScene.make.image(undefined, false);
        this.mArrow.setTexture(resKey, this.mConfig.resArrow);
        this.mArrow.scaleY = this.mConfig.up ? -1 : 1;
        this.mArrow.x = this.mConfig.wid - this.mArrow.width;
        this.mArrow.y = (this.mConfig.hei - this.mArrow.height >> 1) + 4;

        this.mtxt = this.mScene.make.text({
            x: 0, y: 0,
            style: { fill: "#F7EDED", fontSize: 18 }
        }, false);

        this.add(this.mBg);
        this.add(this.mArrow);
        this.add(this.mtxt);

        this.mBg.setInteractive();
        this.mBg.on("pointerdown", this.openHandler, this);
    }

    private openHandler() {
        if (!this.itemList || this.itemList.length < 1) return;
        this.showTween(this.mIsopen);
    }
    private showTween(open: boolean) {
        if (open) {
            this.mItemBG = this.createTexture();
            this.addAt(this.mItemBG, 0);
        } else {
            if (this.mItemBG) {
                if (this.mItemBG.parentContainer) {
                    this.mItemBG.parentContainer.remove(this.mItemBG);
                }
                this.mItemBG.destroy();
            }
        }
        this.mArrow.scaleY = open ? 1 : -1;
        this.showTweenItem(open);
        this.mIsopen = !this.mIsopen;
    }
    private showTweenItem(open: boolean) {
        const len: number = this.itemList.length;
        for (let i: number = 0; i < len; i++) {
            const item: SelectCallItem = this.itemList[i];
            if (!item) {
                continue;
            }
            item.x = this.mConfig.wid >> 1;
            this.add(item);
            this.mScene.tweens.add({
                targets: item,
                duration: 50 * i,
                props: {
                    y: { value: open ? -this.mConfig.hei * i - this.mConfig.hei / 2 : -this.mConfig.hei >> 1 },
                    alpha: { value: open ? 1 : 0 }
                },
                onComplete: (tween, targets, element) => {
                    if (!open) {
                        this.remove(item);
                    }
                },
                onCompleteParams: [this],
            });
        }
    }

    private createTexture(): Phaser.GameObjects.Graphics {
        const COLOR = 0x3D3838;
        const height = this.mConfig.hei * this.itemList.length;
        const bgGraphics: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        bgGraphics.fillStyle(COLOR, .8);
        bgGraphics.fillRect(0, -height, this.mConfig.wid, height);
        return bgGraphics;
    }
}
export class SelectCallItem extends Phaser.GameObjects.Container {
    protected mText: Phaser.GameObjects.Text;
    protected mSelectBG: Phaser.GameObjects.Graphics;
    protected mData: ISelectCallItemData;
    protected mSelectCallUI: ISelectCallUI;
    constructor(scene: Phaser.Scene, selectCallUI: ISelectCallUI, wid: number, hei: number) {
        super(scene);
        this.mSelectCallUI = selectCallUI;
        this.mText = this.scene.make.text({
            x: -wid >> 1, y: -hei >> 1,
            style: { fill: "#F7EDED", fontSize: 18 }
        }, false);
        const COLOR = 0xffcc00;
        this.mSelectBG = scene.make.graphics(undefined, false);
        this.mSelectBG.fillStyle(COLOR, .8);
        this.mSelectBG.fillRect(-wid >> 1, -hei >> 1, wid, hei);
        this.mSelectBG.visible = false;
        this.addAt(this.mSelectBG, 0);
        this.add(this.mText);

        this.setSize(wid, hei);

        this.setInteractive();
        this.on("pointerover", this.overHandler, this);
        this.on("pointerout", this.outHandler, this);
        this.on("pointerdown", this.selectHandler, this);

    }

    public set itemData(val: ISelectCallItemData) {
        this.mData = val;
        this.mText.text = this.mData.text;
        this.mText.x = -this.width / 2 + (this.width - this.mText.width >> 1);
        this.mText.y = -this.height / 2 + (this.height - this.mText.height >> 1);
    }

    public get itemData(): ISelectCallItemData {
        return this.mData;
    }

    public destroy() {
        this.mText.destroy(true);
        this.mSelectBG.destroy(true);
        this.mData = null;
        this.mText = null;
        this.mSelectBG = null;
        this.mSelectCallUI = null;
        super.destroy(true);
    }

    public setSelected(val: boolean) {
        this.mSelectBG.visible = val;
    }

    protected overHandler() {
        this.mSelectBG.visible = true;
    }

    protected selectHandler() {
        this.overHandler();
        this.mSelectCallUI.selectCall(this.itemData);
    }
    protected outHandler() {
        this.mSelectBG.visible = false;
    }
}
