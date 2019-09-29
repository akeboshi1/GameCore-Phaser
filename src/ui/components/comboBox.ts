export interface IComboboxRes {
    x: number;
    y: number;
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
export interface IComboboxItemData {
    index: number;
    text: string;
    data: any;
}
export class ComboBox extends Phaser.GameObjects.Container {
    protected itemList: ComboBoxItem[];
    private mScene: Phaser.Scene;
    private mConfig: IComboboxRes;
    private mBg: Phaser.GameObjects.Image;
    private mIsopen: boolean = true;
    private mBashHei: number = 0;
    private mItemBG: Phaser.GameObjects.Graphics;
    private mtxt: Phaser.GameObjects.Text;
    private mArrow: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, x: number, y: number, config: IComboboxRes) {
        super(scene);
        this.mScene = scene;
        this.mConfig = config;
        this.init();
    }

    public set itemData(value: any) {
        if (!this.itemList) {
            this.itemList = [];
        }
        const len: number = value.length;
        for (let i: number = 0; i < len; i++) {
            const item: ComboBoxItem = new ComboBoxItem(this.mScene, this, this.mConfig.wid, this.mConfig.hei);
            item.itemData = value[i];
            this.itemList.push(item);
        }
        // 默認顯示第0個
        this.selectCall(this.itemList[0].itemData);
    }

    public selectCall(itemData: IComboboxItemData) {
        this.mtxt.text = itemData.text;
        this.showTween(false);
        if (this.mConfig.clickCallBack) {
            this.mConfig.clickCallBack.call(this, itemData);
        }
    }

    public destroy() {
        if (this.itemList) {
            const len: number = this.itemList.length;
            for (let i: number = 0; i < len; i++) {
                const item: ComboBoxItem = this.itemList[i];
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
        this.mBg.x = this.mConfig.x;
        this.mBg.y = this.mConfig.y;
        this.mBg.setTexture(resKey, this.mConfig.resBg);
        this.mBashHei = this.mBg.height;

        this.mArrow = this.mScene.make.image(undefined, false);
        this.mArrow.setTexture(resKey, this.mConfig.resArrow);
        this.mArrow.scaleY = this.mConfig.up ? -1 : 1;
        this.mArrow.x = this.mBg.width - 70;
        this.mArrow.y = this.mBg.y;

        this.mtxt = this.mScene.make.text({
            x: -5, y: -8,
            style: { fill: "#F7EDED", fontSize: 18 }
        }, false);

        this.add(this.mBg);
        this.add(this.mArrow);
        this.add(this.mtxt);
        this.mBg.setSize(this.mConfig.wid, this.mConfig.hei);
        this.mBg.setInteractive();
        this.mBg.on("pointerdown", this.openHandler, this);
    }

    private openHandler() {
        if (!this.itemList || this.itemList.length < 1) return;
        this.showTween(this.mIsopen);
        this.mIsopen = !this.mIsopen;
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
    }
    private showTweenItem(open: boolean) {
        const len: number = this.itemList.length;
        for (let i: number = 0; i < len; i++) {
            const item: ComboBoxItem = this.itemList[i];
            if (!item) {
                continue;
            }
            this.add(item);
            this.mScene.tweens.add({
                targets: item,
                duration: 50 * i,
                props: {
                    y: { value: open ? -this.mBashHei * (i + 1) : 0 },
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
        const COLOR = 0xffcc00;
        const width = this.mBg.width;
        const height = this.mBashHei * this.itemList.length;
        const bgGraphics: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        bgGraphics.fillStyle(COLOR, .8);
        bgGraphics.fillRect(-width >> 1, -height - this.mBashHei / 2, width, height);
        return bgGraphics;
    }
}
export class ComboBoxItem extends Phaser.GameObjects.Container {
    private mText: Phaser.GameObjects.Text;
    private mSelectBG: Phaser.GameObjects.Graphics;
    private mData: IComboboxItemData;
    private mCombobox: ComboBox;
    constructor(scene: Phaser.Scene, combobox: ComboBox, wid: number, hei: number) {
        super(scene);
        this.mCombobox = combobox;
        this.mText = this.scene.make.text({
            x: -5,
            y: -8,
            style: { fill: "#F7EDED", fontSize: 18 }
        }, false);
        const COLOR = 0x00ffcc;
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

    public set itemData(val: IComboboxItemData) {
        this.mData = val;
        this.mText.text = this.mData.text;
    }

    public get itemData(): IComboboxItemData {
        return this.mData;
    }

    public destroy() {
        super.destroy(true);
    }

    public setSelected(val: boolean) {
        this.mSelectBG.visible = val;
    }

    private overHandler() {
        this.mSelectBG.visible = true;
    }

    private selectHandler() {
        this.overHandler();
        this.mCombobox.selectCall(this.itemData);
    }
    private outHandler() {
        this.mSelectBG.visible = false;
    }
}
