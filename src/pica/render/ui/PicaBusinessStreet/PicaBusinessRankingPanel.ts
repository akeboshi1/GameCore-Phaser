import { GameScroller, NineSliceButton, ClickEvent, NineSlicePatch } from "apowophaserui";
import { UIAtlasKey } from "picaRes";
import { Font, Handler, i18n } from "utils";

export class PicaBusinessRankingPanel extends Phaser.GameObjects.Container {
    private titleText: Phaser.GameObjects.Text;
    private gameScroll: GameScroller;
    private dpr: number;
    private key: string;
    private key2: string;
    private zoom: number;
    private backHandler: Handler;
    private rankHandler: Handler;
    private boundOffset: number = 85;
    private timerID: any;
    private moveTimerID: any;
    private mRectangle: Phaser.Geom.Rectangle;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, dpr: number, zoom: number, key: string, key2: string) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.zoom = zoom;
        this.setSize(width, height);
        this.create();
    }
    public create() {
        const posy = -this.height * 0.5;
        const posx = -this.width * 0.5;
        const titleText = this.scene.make.text({ x: 0, y: posy + 20 * this.dpr, text: i18n.t("business_street.ranking_list"), style: { fontSize: 18 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#FFC51A" } }).setOrigin(0.5);
        titleText.setStroke("#553100", 2 * this.dpr);
        this.add(titleText);
        this.titleText = titleText;
        const titleLine = this.scene.make.image({ x: 0, y: titleText.y + titleText.height * 0.5 + 10 * this.dpr, key: this.key2, frame: "title" });
        titleLine.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(titleLine);
        const scrollwidth = this.width - 28 * this.dpr;
        const scrollHeight = this.height - 80 * this.dpr;
        const scrollY = posy + 33 * this.dpr + scrollHeight * 0.5;
        this.gameScroll = new GameScroller(this.scene, {
            x: 0,
            y: 0,
            width: scrollwidth,
            height: scrollHeight,
            zoom: this.zoom,
            dpr: this.dpr,
            align: 2,
            orientation: 1,
            space: 20 * this.dpr,
            valuechangeCallback: (value) => {
                this.onScrollValueChange(value);
            },
            cellupCallBack: (gameobject) => {
                this.onScrollClickHandler(gameobject);
            }
        });
        this.add(this.gameScroll);
        const backBtn = new NineSliceButton(this.scene, 0, this.height * 0.5 - 7 * this.dpr, 92 * this.dpr, 34 * this.dpr, UIAtlasKey.commonKey, "red_btn", i18n.t("business_street.back"), this.dpr, this.zoom, {
            left: 10 * this.dpr,
            top: 10 * this.dpr,
            right: 10 * this.dpr,
            bottom: 10 * this.dpr
        });
        this.add(backBtn);
        backBtn.setTextStyle({ fontSize: 15 * this.dpr, fontFamily: Font.DEFULT_FONT, color: "#ffffff" });
        backBtn.on(String(ClickEvent.Tap), this.onBackHandler, this);
    }

    public setRankingData(datas: any[]) {// op_pkt_def.IPKT_RankChampion
        const item0 = this.scene.make.container(undefined, false);
        this.boundOffset = 35 * this.dpr;
        item0.setSize(this.boundOffset, 185 * this.dpr);
        (<any>this.gameScroll).clearItems();
        this.gameScroll.addItem(item0);
        for (const data of datas) {
            const item = new PicRankingItem(this.scene, 0, 0, 133 * this.dpr, 185 * this.dpr, this.key, this.key2, this.dpr, this.zoom);
            item.setRankData(data);
            this.gameScroll.addItem(item);
        }

        const item1 = this.scene.make.container(undefined, false);
        item1.setSize(this.boundOffset, 185 * this.dpr);
        this.gameScroll.addItem(item1);
        this.gameScroll.Sort();
        this.gameScroll.refreshMask();
        this.gameScroll.setValue(this.gameScroll.bounds[1]);
    }

    public setHandler(back: Handler, rank: Handler) {
        this.backHandler = back;
        this.rankHandler = rank;
    }

    public resetMask() {
        this.gameScroll.refreshMask();
    }

    public show() {
        this.addListen();
        this.visible = true;
    }

    public hide() {
        this.removeListen();
    }

    private onScrollValueChange(value: number) {
        if (this.gameScroll) {
            const cellWidth = 133 * this.dpr;
            const tempRadus = (this.gameScroll.width - cellWidth) * 0.25;
            const items = this.gameScroll.getItemList();
            for (const item of items) {
                let dis = Math.abs((<PicRankingItem>item).getWorldTransformMatrix().tx - this.getWorldTransformMatrix().tx) - cellWidth * 0.25;
                if (dis < 0) dis = 0;
                const radio = 1 - Math.abs(dis) / tempRadus;
                if (item instanceof PicRankingItem)
                    item.setRadio(radio);
            }
            this.gameScroll.Sort(true, false);
        }

    }

    private onScrollUpHandler() {
        if (this.gameScroll) {
            let value = this.gameScroll.getValue();
            const rightBound = this.gameScroll.bounds[1];
            const interValue = rightBound - value;
            const index = Math.floor((interValue + 66 * this.dpr) / (133 * this.dpr + 20 * this.dpr));
            const allLen = this.gameScroll.getItemList().length;
            if (index >= 0 && index < allLen - 1) {
                const item = <PicRankingItem>this.gameScroll.getItemAt(index + 1);
                let dis = item.getWorldTransformMatrix().tx - this.getWorldTransformMatrix().tx;
                dis *= this.scale;
                if (dis < 0) {
                    const max = Math.abs(dis) + value;
                    this.timerID = setInterval(() => {
                        value += 10 * this.dpr;
                        this.gameScroll.setValue(value);
                        if (value >= max) {
                            this.gameScroll.setValue(max);
                            clearInterval(this.timerID);
                            this.timerID = undefined;
                        }
                    }, 20);
                } else {
                    const mix = value - Math.abs(dis);
                    this.timerID = setInterval(() => {
                        value -= 10 * this.dpr;
                        this.gameScroll.setValue(value);
                        if (value <= mix) {
                            this.gameScroll.setValue(mix);
                            clearInterval(this.timerID);
                            this.timerID = undefined;
                        }
                    }, 20);
                }
            }
            this.gameScroll.Sort(true, false);
        }
    }
    private onScrollClickHandler(obj: PicRankingItem) {
        if (this.timerID) {
            clearInterval(this.timerID);
            this.timerID = undefined;
        }
        if (this.rankHandler) {
            const data = obj.rankData;
            this.rankHandler.runWith([data.key, data.type]);
        }
    }

    private onBackHandler() {
        if (this.backHandler) this.backHandler.run();
        (<any>this.gameScroll).clearItems();
    }

    private addListen() {
        if (!this.scene) return;
        this.removeListen();
        this.scene.input.on("pointerdown", this.pointerDownHandler, this);
        this.scene.input.on("pointerup", this.pointerUpHandler, this);

    }

    private removeListen() {
        if (!this.scene) return;
        this.scene.input.off("pointerdown", this.pointerDownHandler, this);
        this.scene.input.off("pointerup", this.pointerUpHandler, this);
    }
    private pointerDownHandler(pointer: Phaser.Input.Pointer) {
        if (this.checkPointerInBounds(this.gameScroll, pointer)) {
            if (this.timerID) {
                clearInterval(this.timerID);
                this.timerID = undefined;
            }
            if (this.moveTimerID) {
                clearInterval(this.moveTimerID);
                this.moveTimerID = undefined;
            }
        }
    }
    private pointerUpHandler(pointer: Phaser.Input.Pointer) {
        if (this.checkPointerInBounds(this.gameScroll, pointer)) {
            setTimeout(() => {
                if (!(<any>this.gameScroll).isSliding)
                    this.onScrollUpHandler();
                else {
                    this.moveTimerID = setInterval(() => {
                        if (!(<any>this.gameScroll).isSliding) {
                            this.onScrollUpHandler();
                            clearInterval(this.moveTimerID);
                            this.moveTimerID = undefined;
                        }
                    }, 20);
                }
            }, 20);
        }
    }

    private checkPointerInBounds(gameObject: any, pointer: Phaser.Input.Pointer): boolean {
        if (!this.mRectangle) {
            this.mRectangle = new Phaser.Geom.Rectangle(0, 0, 0, 0);
        }
        this.mRectangle.left = -gameObject.width / 2;
        this.mRectangle.right = gameObject.width / 2;
        this.mRectangle.top = -gameObject.height / 2;
        this.mRectangle.bottom = gameObject.height / 2;
        if (pointer) {
            const worldMatrix: Phaser.GameObjects.Components.TransformMatrix = gameObject.getWorldTransformMatrix();
            const x: number = pointer.x - worldMatrix.tx;
            const y: number = pointer.y - worldMatrix.ty;
            if (this.mRectangle.left <= x && this.mRectangle.right >= x && this.mRectangle.top <= y && this.mRectangle.bottom >= y) {
                return true;
            }
            return false;
        }
        return false;
    }
}

class PicRankingItem extends Phaser.GameObjects.Container {
    public rankData: any;// op_pkt_def.IPKT_RankChampion
    private key: string;
    private key2: string;
    private dpr: number;
    private titleText: Phaser.GameObjects.Text;
    private storeName: Phaser.GameObjects.Text;
    private storeIcon: Phaser.GameObjects.Image;
    private bg: Phaser.GameObjects.Image;
    private storebg: NineSlicePatch;
    private radio: number = 0;
    private imgtype: number = 1;//  1  小图片 2  大图片
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, key2: string, dpr: number, zoom: number) {
        super(scene, x, y);
        this.dpr = dpr;
        this.key = key;
        this.key2 = key2;
        this.setSize(width, height);
        const posx = -this.width * 0.5;
        const posy = -this.height * 0.5;
        this.bg = this.scene.make.image({ key: this.key2, frame: "restaurant_rank_bg_s" });
        this.bg.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.add(this.bg);
        this.titleText = this.scene.make.text({ x: 0, y: posy, text: "Restaurant", style: { color: "#0555AF", fontSize: 14 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.titleText);
        this.storebg = new NineSlicePatch(this.scene, 0, 0, 72 * dpr, 17 * dpr, this.key2, "store_name_bg_s", {
            left: 8 * this.dpr,
            top: 0 * this.dpr,
            right: 8 * this.dpr,
            bottom: 0 * this.dpr
        });
        this.storebg.y = this.titleText.y + 10 * dpr;
        this.add(this.storebg);
        this.storeName = this.scene.make.text({ x: 0, y: this.storebg.y, text: "Restaurant", style: { color: "#0", fontSize: 12 * dpr, fontFamily: Font.DEFULT_FONT } }).setOrigin(0.5);
        this.add(this.storeName);
        this.storeIcon = this.scene.make.image({ key: this.key2, frame: "restaurant_rank_icon_s" });
        this.storeIcon.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.storeIcon.y = -posy - this.storeIcon.height * 0.5 - 5 * dpr;
        this.add(this.storeIcon);
    }

    public setRankData(data: any) {// op_pkt_def.IPKT_RankChampion
        this.rankData = data;
        this.titleText.text = data.name;
        this.storeName.text = data.champion;
        this.switchImage(1);
    }

    public setRadio(radio: number) {
        let type = 1;
        if (radio > 1) radio = 1;
        if (radio > 0) {
            type = 2;
        }
        if (this.imgtype !== type) {
            this.switchImage(type);
            this.imgtype = type;
        }
        if (type === 2) {
            this.scale = 1 / this.radio + radio * (1 - 1 / this.radio);
        } else {
            this.scale = 1;
        }
        this.width = this.bg.displayWidth * this.scale;
        this.height = this.bg.displayHeight * this.scale;
    }

    /**
     * @param type  1  小图片 2  大图片
     */
    public switchImage(type: number) {
        const imgname = this.rankData.type;
        let bgres, titleFont, storebgres, storebgwidth, storebgheight, storefont, storeiconres, ratio;
        const smallWidth = 133 * this.dpr;
        let curWidth = 133 * this.dpr;
        if (type === 1) {
            bgres = imgname + "_rank_bg_s";
            titleFont = 14 * this.dpr;
            storebgres = "store_name_bg_s";
            storebgwidth = 72 * this.dpr;
            storebgheight = 14 * this.dpr;
            storefont = 10 * this.dpr;
            storeiconres = imgname + "_rank_icon_s";
            curWidth = 133 * this.dpr;
            (<any>this.storebg).setConfig({
                left: 8 * this.dpr,
                top: 0 * this.dpr,
                right: 8 * this.dpr,
                bottom: 0 * this.dpr
            });
        } else {
            bgres = imgname + "_rank_bg_m";
            titleFont = 18 * this.dpr;
            storebgres = "store_name_bg_m";
            storebgwidth = 88 * this.dpr;
            storebgheight = 17 * this.dpr;
            storefont = 12 * this.dpr;
            storeiconres = imgname + "_rank_icon_m";
            curWidth = 163 * this.dpr;
            (<any>this.storebg).setConfig({
                left: 11 * this.dpr,
                top: 0 * this.dpr,
                right: 11 * this.dpr,
                bottom: 0 * this.dpr
            });
        }
        ratio = curWidth / smallWidth;
        this.radio = ratio;
        this.bg.setFrame(bgres);
        this.titleText.setFontSize(titleFont);
        this.storebg.setFrame(storebgres);
        this.storebg.resize(storebgwidth, storebgheight);
        this.storeName.setFontSize(storefont);
        this.storeIcon.setFrame(storeiconres);
        this.setSize(this.bg.width, this.bg.height);
        this.titleText.y = -this.height * 0.5 + this.titleText.height * 0.5 + 10 * this.dpr * ratio;
        this.storebg.y = this.titleText.y + this.titleText.height * 0.5 + 10 * this.dpr * ratio;
        this.storeName.y = this.storebg.y;
        this.storeIcon.y = this.height * 0.5 - this.storeIcon.height * 0.5 - 10 * this.dpr * ratio;
    }

}
