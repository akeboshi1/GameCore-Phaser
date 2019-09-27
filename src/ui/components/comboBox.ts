export interface IComboboxRes {
    x: number;
    y: number;
    resKey: string;
    resPng: string;
    resJson: string;
    resBg: string;
    resArrow: string;
    fontStyle: { size: number, color: string, bold: boolean };
    up: boolean;
}
export class ComboBox extends Phaser.GameObjects.Container {
    protected itemList: ComboBoxItem[];
    private mScene: Phaser.Scene;
    private mConfig: IComboboxRes;
    private mBg: Phaser.GameObjects.Image;
    private mIsopen: boolean = false;
    constructor(scene: Phaser.Scene, x: number, y: number, config: IComboboxRes) {
        super(scene);
        this.mScene = scene;
        this.mConfig = config;
        this.init();
    }

    public set itemData(value: []) {
        if (!this.itemList) {
            this.itemList = [];
        }
        const len: number = value.length;
        for (let i: number = 0; i < len; i++) {
            const item: ComboBoxItem = new ComboBoxItem(this.mScene);
            item.data = value[i];
            this.itemList.push(item);
        }
    }

    public destroy() {
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

        const txt: Phaser.GameObjects.Text = this.mScene.make.text({
            x: this.mBg.x + 10,
            y: this.mBg.y + 5,
            style: { fontSize: this.mConfig.fontStyle.size, fill: this.mConfig.fontStyle.color }
        }, false);

        const arrow: Phaser.GameObjects.Image = this.mScene.make.image(undefined, false);
        arrow.setTexture(resKey, this.mConfig.resArrow);
        arrow.scaleY = this.mConfig.up ? -1 : 1;
        arrow.x = this.mBg.width - 20;
        arrow.y = this.mBg.y + 5;

        this.add(this.mBg);
        this.add(txt);
        this.add(arrow);
        this.mBg.setInteractive();
        this.mBg.on("pointerdown", this.openHandler, this);
    }

    private openHandler() {
        if (!this.itemList || this.itemList.length < 1) return;
        let config: Phaser.Types.Tweens.TweenBuilderConfig;
        const renderBG: Phaser.GameObjects.Graphics = this.createRenderBG();
        renderBG.generateTexture("combobox", this.mBg.width, this.mBg.height);
        const img: Phaser.GameObjects.Image = this.mScene.make.image({
            key: "combobox"
        }, false);
        this.add(img);
        // renderBG.displayOriginX = 0;
        // renderBG.displayOriginY = 0;
        if (this.mIsopen) {
            config = {
                targets: img,
                duration: 1000,
                ease: "Linear",
                props: {
                    height: { value: this.mBg.height + 100 },
                    aplha: { value: 1 }
                },
                onComplete: (tween, targets, element) => {
                    this.showItemTween(this.mIsopen);
                    this.mIsopen = false;
                },
                onCompleteParams: [this],
            };
        } else {
            config = {
                targets: renderBG,
                duration: 1000,
                ease: "Linear",
                props: {
                    height: { value: this.mBg.height },
                    aplha: { value: 0 }
                },
                onComplete: (tween, targets, element) => {
                    this.showItemTween(this.mIsopen);
                    this.mIsopen = true;
                },
                onCompleteParams: [this],
            };
        }
        this.mScene.tweens.add({ config });
    }

    private showItemTween(isOpen: boolean) {
        const itemList = this.itemList;
        const len: number = itemList.length;
        const totelHei: number = len * this.mBg.height;
        for (let i: number = 0; i < len; i++) {
            const item = itemList[i];
            if (!item) continue;
            this.mScene.tweens.add({
                targets: item,
                duration: 1000,
                ease: "Linear",
                props: {
                    y: { value: isOpen ? this.mBg.height * i : 0 },
                },
                onComplete: (tween, targets, element) => {
                    if (!isOpen) {
                        item.visible = false;
                    }
                },
                onCompleteParams: [this],
            });
        }
    }

    private createRenderBG(): Phaser.GameObjects.Graphics {
        const COLOR_BG = 0x706B6B;
        const width = this.mBg.width;
        const height = this.mBg.height;
        const bgGraphics: Phaser.GameObjects.Graphics = this.mScene.make.graphics(undefined, false);
        bgGraphics.fillStyle(COLOR_BG, .8);
        bgGraphics.fillRect(0, 0, width, height);
        return bgGraphics;
    }
}
export class ComboBoxItem extends Phaser.GameObjects.Container {
    private mText: Phaser.GameObjects.Text;
    private mBg: Phaser.GameObjects.Image;
    private mData: any;
    constructor(scene: Phaser.Scene) {
        super(scene);

        this.mText = this.scene.make.text({
            x: 0,
            y: 0,
            style: { fill: "#FF0000", fontSize: 20 }
        }, false);
        this.mText.setInteractive();
        this.mText.on("pointerdown", this.selectHandler, this);
        this.add(this.mText);
    }

    public set data(val: any) {
        this.mData = val;
        this.mText.text = this.mData.text;
    }

    public get data(): any {
        return this.mData;
    }

    public destroy() {
        super.destroy(true);
    }

    private selectHandler() {

    }
}
