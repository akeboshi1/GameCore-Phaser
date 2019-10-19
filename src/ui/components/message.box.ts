export interface IMessageBox {
    wid: number;
    hei: number;
    resKey: string;
    resPng: string;
    resJson: string;
    resBg: string;
    resBtn: string;
    btnWid: number;
    btnHei: number;
    btnData: IButtonData[];
    fontStyle: { size: number, color: string, bold: boolean };
    clickCallBack: Function;
}

export interface IButtonData {
    text: string;
    data: any;
}
export class MessageBox extends Phaser.GameObjects.Container {
    private mScene: Phaser.Scene;
    private mConfig: IMessageBox;

    private mBg: Phaser.GameObjects.Image;
    private mtxt: Phaser.GameObjects.Text;
    private mBtnList: MessageBtn[];
    constructor(scene: Phaser.Scene, config: IMessageBox) {
        super(scene);
        this.mScene = scene;
        this.mConfig = config;
        this.init();
    }

    public show(data: IButtonData[]) {

    }

    public selectCall(itemData: IButtonData) {
        this.mtxt.text = itemData.text;
        this.mtxt.x = this.mConfig.wid - this.mtxt.width >> 1;
        this.mtxt.y = this.mConfig.hei - this.mtxt.height >> 1;
        if (this.mConfig.clickCallBack) {
            this.mConfig.clickCallBack.call(this, itemData);
        }
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
        const resBtn: string = this.mConfig.resBtn;
        this.mBg = this.mScene.make.image(undefined, false);
        this.mBg.setTexture(resKey, this.mConfig.resBg);
        this.mBg.x = this.mConfig.wid / 2;
        this.mBg.y = this.mConfig.hei / 2;
        this.mBg.setSize(this.mConfig.wid, this.mConfig.hei);
        this.mBtnList = [];
        if (this.mConfig.btnData) {
            const len: number = this.mConfig.btnData.length;
            let btn: MessageBtn;
            for (let i: number = 0; i < len; i++) {
                btn = new MessageBtn(this.mScene, this, resKey, resBtn, this.mConfig.btnWid, this.mConfig.btnHei);
                this.mBtnList.push(btn);
            }
        }

        this.mtxt = this.mScene.make.text({
            x: 0, y: 0,
            style: { fill: "#F7EDED", fontSize: 18 }
        }, false);

        this.add(this.mBg);
        this.add(this.mtxt);
    }
}

export class MessageBtn extends Phaser.GameObjects.Container {
    private messageBox: MessageBox;
    private mText: Phaser.GameObjects.Text;
    private mData: IButtonData;
    private mBtn: Phaser.GameObjects.Image;
    constructor(scene: Phaser.Scene, messageBox: MessageBox, resKey: string, resBtn: string, wid: number, hei: number) {
        super(scene);
        this.messageBox = messageBox;
        this.mBtn = scene.make.image(undefined, false);
        this.mBtn.setTexture(resKey, resBtn);
        this.mText = this.scene.make.text({
            x: -wid >> 1, y: -hei >> 1,
            style: { fill: "#F7EDED", fontSize: 18 }
        }, false);
        this.add(this.mBtn);
        this.add(this.mText);
        this.setSize(wid, hei);
        this.setInteractive();
        this.on("pointerdown", this.selectHandler, this);
    }

    public set itemData(val: IButtonData) {
        this.mData = val;
        this.mText.text = this.mData.text;
        this.mText.x = -this.width / 2 + (this.width - this.mText.width >> 1);
        this.mText.y = -this.height / 2 + (this.height - this.mText.height >> 1);
    }

    public get itemData(): IButtonData {
        return this.mData;
    }

    public destroy() {
        this.mText.destroy(true);
        this.mBtn.destroy(true);
        this.mData = null;
        super.destroy(true);
    }

    protected selectHandler() {
        this.addTween(this.mBtn);
        this.messageBox.selectCall(this.itemData);
    }

    private addTween(img: Phaser.GameObjects.Image) {
        this.scene.tweens.add({
            targets: img,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        img.scaleX = img.scaleY = 1;
    }

}
