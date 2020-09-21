import { BasePanel } from "../components/BasePanel";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { Url, Background, Border } from "../../utils/resUtil";
import { NinePatch } from "../components/nine.patch";
import { Radio } from "../components/radio";
import { op_client, op_def, op_gameconfig_01 } from "pixelpai_proto";
import { InteractivePanelMediator } from "./InteractivePanelMediator";
import { BBCodeText, TextArea, BaseMediator } from "apowophaserui";
export class InteractivePanel extends BasePanel {
    private static baseWidth: number = 720;
    private static baseHeight: number = 720;
    private mNameCon: Phaser.GameObjects.Container;
    private mDescCon: Phaser.GameObjects.Container;
    private mLeftFaceIcon: Phaser.GameObjects.Image;
    private mMidFaceIcon: Phaser.GameObjects.Image;
    private mRightFaceIcon: Phaser.GameObjects.Image;
    private mNameTF: BBCodeText;
    private mDescTF: BBCodeText;
    /**
     * 多项选择界面
     */
    private mRadio: Radio;

    private mBg: NinePatch;
    private mBorder: NinePatch;
    private mNameBg: Phaser.GameObjects.Image;
    private mRadioCom: boolean = false;
    private mLeftBaseScaleX: number = 1;
    private mLeftBaseScaleY: number = 1;
    private mMidBaseScaleX: number = 1;
    private mMidBaseScaleY: number = 1;
    private mRightBaseScaleX: number = 1;
    private mRightBaseScaleY: number = 1;
    private mTextArea: TextArea;
    private mDisDelection: number = 10;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        // this.setEnabled(false);
        this.setTween(false);
    }
    /**
     * 通過參數進行ui佈局
     * @param param
     * @param radioClick
     */
    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        super.show(param);
        const size: Size = this.mWorld.getSize();
        this.mShowData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShow = true;
        const med: BaseMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME);
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        if (this.mLeftFaceIcon) this.mLeftFaceIcon.visible = false;
        if (this.mRightFaceIcon) this.mRightFaceIcon.visible = false;
        if (this.mMidFaceIcon) this.mMidFaceIcon.visible = false;
        if (data.display && data.display.length > 0) {
            const uiDisplay: op_gameconfig_01.IDisplay = data.display[0];
            const url: string = Url.getOsdRes(uiDisplay.texturePath);
            if (this.scene.cache.obj.get(url)) {
                this.onLoadComplete();
            } else {
                this.scene.load.image(url, url);
                this.scene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadComplete, this);
                this.scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, this.onLoadError, this);
                this.scene.load.start();
            }
        }

        this.mDescTF.text = "";
        this.mNameTF.text = "";
        if (data.text) {
            if (data.text.length > 0) {
                const descData: op_gameconfig_01.IText = data.text[0];
                this.mDescCon.setData("nodeID", descData.node.id);
                this.mTextArea.setText(descData.text);
                // this.mDescTF.text = descData.text;
                this.mDescCon.off("pointerup", this.descConClick, this);
                this.mDescCon.on("pointerup", this.descConClick, this);
                if (data.text[1]) {
                    const nameData: op_gameconfig_01.IText = data.text[1];
                    this.mNameCon.setData("nodeID", nameData.node.id);
                    this.mNameTF.text = nameData.text;
                    this.mNameTF.x = - this.mNameTF.width >> 1;
                    this.mNameCon.off("pointerup", this.nameConClick, this);
                    this.mNameCon.on("pointerup", this.nameConClick, this);
                }
            }
        }
        if (this.mRadio) this.mRadio.visible = false;
        if (data.button && data.button.length > 0) {
            const tmpHei: number = (data.button.length - 1) * 33 + 46;
            if (!this.mRadio) {
                this.mRadio = new Radio(this.mScene, {
                    wid: 350,
                    hei: tmpHei,
                    resKey: "juqing",
                    resPng: "./resources/ui/juqing/juqing.png",
                    resJson: "./resources/ui/juqing/juqing.json",
                    resBg: "radio_bg.png",
                    resArrow: "radio_arrow.png",
                    fontStyle: { size: 20, color: "#ffcc00", bold: false },
                    completeBack: () => {
                        this.radioComplete();
                    },
                    clickCallBack: (itemShowData: any) => {
                        if (!itemShowData || !med) return;
                        (med as InteractivePanelMediator).componentClick(itemShowData.data);
                    }
                });
                this.radioComplete();
            }
            this.setRadioData(data.button);
            this.mRadio.visible = true;
        }
        this.resize();
        if (this.mShow) {
            return;
        }
    }

    public hide() {
        super.hide();
    }

    public update(param?: any) {
        this.show(param);
    }

    public getRadio(): Radio {
        return this.mRadio;
    }

    public setRadioData(data: any[]) {
        this.mRadio.setRadioData(data);
    }

    public resize(wid: number = 0, hei: number = 0) {
        this.scale = this.mWorld.uiScale;
        const size: Size = this.mWorld.getSize();
        const width = this.mWorld.getSize().width;
        const height = this.mWorld.getSize().height;
        const zoom = this.mWorld.uiScale;
        this.mNameCon.add(this.mNameBg);
        this.mNameCon.add(this.mNameTF);
        this.mDescCon.add(this.mBg);
        this.mDescCon.add(this.mBorder);
        this.mDescCon.add(this.mDescTF);
        this.mDescCon.add(this.mTextArea);
        this.add(this.mNameCon);
        this.add(this.mDescCon);
        this.setSize(width, height);
        if (this.mWorld.game.device.os.desktop) {
            this.y = size.height / 2 - 250;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.mBg.resize((size.width - 10) / this.mWorld.uiScale, size.height * .5 / this.mWorld.uiScale);
                this.mBorder.resize((size.width - 20) / this.mWorld.uiScale, (size.height * .5 - 20) / this.mWorld.uiScale);
            } else {
                this.mBg.resize((size.width - 10) / this.mWorld.uiScale, size.height * .5 / this.mWorld.uiScale);
                this.mBorder.resize((size.width - 20) / this.mWorld.uiScale, (size.height * .5 - 20) / this.mWorld.uiScale);
            }
            this.y = this.mBg.height * 1.5 * this.mWorld.uiScale;
        }
        // this.y = 0;

        this.x = size.width >> 1;
        this.refreshUIPos();
        if (this.mRadio) {
            this.add(this.mRadio);
        }
        this.mTextArea.childrenMap.child.setMinSize(this.mBorder.width - 10 * this.dpr * zoom, this.mBorder.height - 3 * this.dpr * zoom);
        this.mTextArea.layout();
        this.mTextArea.setPosition(width / 2, this.y + this.mDescCon.y);
        const textMask = this.mTextArea.childrenMap.text;
        textMask.x = -this.mBorder.width >> 1;
        textMask.y = -this.mBorder.height / 2 + 20 * this.dpr;
        textMask.resize(this.mBorder.width, this.mDescTF.displayHeight + 2000);
        // textMask.bottomChildOY = this.mDescTF.displayHeight + 20 * this.dpr * zoom;
        this.mTextArea.scrollToBottom();
        super.resize(wid, hei);
    }

    // public addListen() {
    // super.addListen();
    // this.on("panelClick", this.panelClick, this);
    // }

    // public removeListen() {
    //     super.removeListen();
    //     this.off("panelClick", this.panelClick, this);
    // }

    public destroy() {
        this.mInitialized = false;
        if (this.mNameCon) {
            this.mNameCon.destroy(true);
        }
        if (this.mDescCon) {
            this.mDescCon.destroy(true);
        }
        if (this.mLeftFaceIcon) {
            this.mLeftFaceIcon.destroy(true);
        }
        if (this.mMidFaceIcon) {
            this.mMidFaceIcon.destroy(true);
        }
        if (this.mRightFaceIcon) {
            this.mRightFaceIcon.destroy(true);
        }
        if (this.mNameTF) {
            this.mNameTF.destroy(true);
        }
        if (this.mDescTF) {
            this.mDescTF.destroy(true);
        }
        if (this.mRadio) {
            this.mRadio.destroy();
        }
        this.mNameCon = null;
        this.mDescCon = null;
        this.mLeftFaceIcon = null;
        this.mMidFaceIcon = null;
        this.mRightFaceIcon = null;
        this.mNameTF = null;
        this.mDescTF = null;
        this.mRadio = null;
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.atlas("juqing", Url.getRes("ui/juqing/juqing.png"), Url.getRes("ui/juqing/juqing.json"));
        super.preload();
    }

    protected init() {
        const width = this.mWorld.getSize().width;
        const height = this.mWorld.getSize().height;
        const zoom: number = this.mWorld.uiScale;
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.mNameCon = this.mScene.make.container(undefined, false);
        this.mDescCon = this.mScene.make.container(undefined, false);
        this.mBg = new NinePatch(this.scene, 0, 0, 1080, 320, Background.getName(), null, Background.getConfig());
        this.setSize(width, height);
        this.mBorder = new NinePatch(this.scene, 0, 0, 1040, 280, Border.getName(), null, Border.getConfig());

        this.mLeftFaceIcon = this.mScene.make.image(undefined, false);
        this.mMidFaceIcon = this.mScene.make.image(undefined, false);
        this.mRightFaceIcon = this.mScene.make.image(undefined, false);

        this.mNameTF = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "20px",
            wrap: {
                mode: "char",
                width: this.mBorder.width
            },
        });

        this.mNameBg = this.mScene.make.image(undefined, false);
        this.mNameBg.setTexture("juqing", "juqing_name.png");
        this.mDescTF = new BBCodeText(this.mScene, 0, 0, "", {
            // width: this.mBorder.width - 20 * this.dpr * zoom,
            fontSize: "20px",
            halign: "left",
            textMask: false,
            padding: {
                top: 0,
                bottom: 0,
                left: 8 * this.dpr * zoom,
                right: 3 * this.dpr * zoom,
            },
            wrap: {
                mode: "character",
                width: this.mBorder.width - 12 * this.dpr * zoom,
            },
        });

        this.mTextArea = new TextArea(this.mScene, {
            x: width / 2,
            y: this.mBorder.y + this.mBorder.height / 2 + 80 * this.dpr * zoom,
            width: this.mBorder.width,
            height: this.mBorder.height - 20 * this.dpr * zoom,
            // background: (<any>this.scene).rexUI.add.roundRectangle(0, 0, 2, 2, 0, 0xFF9900, .2),
            textWidth: this.mBorder.width - 12 * this.dpr * zoom,
            textHeight: 0,
            text: this.mDescTF,
        })
            .layout();
        // const bg1 = this.mScene.make.graphics(undefined, false);
        // bg1.fillStyle(0xffcc00);
        // bg1.fillRect(-this.mBg.width >> 1, -this.mBg.height >> 1, this.mBg.width, this.mBg.height);
        // this.mDescCon.add(bg1);
        this.mDescCon.setSize(this.mBg.width, this.mBg.height);
        this.mNameCon.setSize(this.mNameBg.width, this.mNameBg.height);
        this.mDescCon.setInteractive();
        this.mNameCon.setInteractive();
        super.init();
    }

    protected tweenComplete(show: boolean) {
        super.tweenComplete(show);
        if (show) this.resize();
    }

    // private panelClick(pointer: Phaser.Input.Pointer) {
    //     if (Tool.checkPointerContains(this.mNameCon, pointer)) {
    //         this.nameConClick(pointer);
    //         return;
    //     }
    //     if (Tool.checkPointerContains(this.mDescCon, pointer)) {
    //         this.descConClick(pointer);
    //         return;
    //     }
    //     if (this.mLeftFaceIcon && Tool.checkPointerContains(this.mLeftFaceIcon, pointer)) {
    //         this.leftFaceClick(pointer);
    //         return;
    //     }
    //     if (this.mMidFaceIcon && Tool.checkPointerContains(this.mMidFaceIcon, pointer)) {
    //         this.midFaceClick(pointer);
    //         return;
    //     }
    //     if (this.mRightFaceIcon && Tool.checkPointerContains(this.mRightFaceIcon, pointer)) {
    //         this.rightFaceClick(pointer);
    //         return;
    //     }
    // }

    private refreshUIPos() {
        const size: Size = this.mWorld.getSize();
        const zoom = this.mWorld.uiScale;
        this.mDescCon.setSize(this.mBg.width, this.mBg.height);
        this.mNameCon.setSize(this.mNameBg.width, this.mNameBg.height);
        this.mNameTF.y = -8 * this.mWorld.uiScale;
        // this.mDescTF.x = -this.mBorder.width / 2;
        // this.mDescTF.y = -this.mBorder.height / 2;
        this.mDescCon.y = this.mWorld.game.device.os.desktop ? size.height / 2 + 80 : 0;
        this.mNameCon.x = 150 - this.mDescCon.width / 2;
        this.mNameCon.y = this.mDescCon.y - this.mDescCon.height / 2 - this.mNameCon.height / 2 - 10;
        this.mNameTF.setWrapWidth(this.mBorder.width);
        this.mDescTF.setWrapWidth(this.mBorder.width - 10 * this.dpr * zoom);
        this.mNameTF.x = - this.mNameTF.width >> 1;
        const desConWorldY: number = this.mDescCon.getWorldTransformMatrix().ty;
        if (!this.mWorld.game.device.os.desktop) {
            const leftIconWid: number = this.mLeftFaceIcon.width * this.mWorld.uiScale;
            const leftIconHei: number = this.mLeftFaceIcon.height * this.mWorld.uiScale;
            const leftScale: number = this.getScale(InteractivePanel.baseWidth, InteractivePanel.baseHeight, leftIconWid, leftIconHei);
            this.mLeftFaceIcon.scaleX = this.mLeftBaseScaleX * leftScale * .7;
            this.mLeftFaceIcon.scaleY = this.mLeftBaseScaleY * leftScale * .7;
            this.mLeftFaceIcon.x = this.mNameCon.x;
            this.mLeftFaceIcon.y = this.mNameTF.y - this.mLeftFaceIcon.height; // desConWorldY - this.mLeftFaceIcon.height / 2 - this.mDescCon.height / 2; // this.mNameCon.y + this.mNameCon.height / 2 + 10 - this.mLeftFaceIcon.height * leftScale * .7 / 2;

            const midIconWid: number = this.mMidFaceIcon.width * this.mWorld.uiScale;
            const midIconHei: number = this.mMidFaceIcon.height * this.mWorld.uiScale;
            const midScale = this.getScale(InteractivePanel.baseWidth, InteractivePanel.baseHeight, midIconWid, midIconHei);
            this.mMidFaceIcon.scaleX = this.mMidBaseScaleX * midScale * .7;
            this.mMidFaceIcon.scaleY = this.mMidBaseScaleY * midScale * .7;
            this.mMidFaceIcon.x = 0;
            this.mMidFaceIcon.y = this.mNameTF.y - this.mMidFaceIcon.height;
            // this.mMidFaceIcon.y = this.mNameCon.y + this.mNameCon.height / 2 + 10 - this.mMidFaceIcon.height * midScale * .7 / 2;

            const rightIconWid: number = this.mRightFaceIcon.width * this.mWorld.uiScale;
            const rightIconHei: number = this.mRightFaceIcon.height * this.mWorld.uiScale;
            const rightScale = this.getScale(InteractivePanel.baseWidth, InteractivePanel.baseHeight, rightIconWid, rightIconHei);
            this.mRightFaceIcon.scaleX = this.mRightBaseScaleX * rightScale * .7;
            this.mRightFaceIcon.scaleY = this.mRightBaseScaleY * rightScale * .7;
            this.mRightFaceIcon.x = -this.mNameCon.x;
            this.mRightFaceIcon.y = this.mNameTF.y - this.mRightFaceIcon.height;
            // this.mRightFaceIcon.y = this.mNameCon.y + this.mNameCon.height / 2 + 10 - this.mRightFaceIcon.height * rightScale * .7 / 2;
        }

        if (this.mRadioCom) {
            if (this.mWorld.game.device.os.desktop) {
                this.mRadio.x = this.mBg.x + this.mBg.width / 2 - this.mRadio.width;
                this.mRadio.y = this.mDescCon.y + this.mDescCon.height / 2 - this.mRadio.height;
            } else {
                this.mRadio.x = this.mBg.width / 2 - this.mRadio.width;
                this.mRadio.y = this.mBg.height / 2 - this.mRadio.height;
            }
        }
    }

    private getScale(baseWid, baseHei, curWid, curHei): number {
        return baseWid / curWid > baseHei / curHei ? baseWid / curWid : baseHei / curHei;
    }

    private onLoadComplete() {
        const size: Size = this.mWorld.getSize();
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mShowData[0];
        const uiDisplay: op_gameconfig_01.IDisplay = data.display[0];
        const url: string = Url.getOsdRes(uiDisplay.texturePath);
        const imgX: number = -this.mBorder.width / 2;
        const imgY: number = -this.mBorder.height / 2;
        const scaleX: number = uiDisplay.scaleX;
        const scaleY: number = uiDisplay.scaleY;
        let scale: number = 1;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        switch (uiDisplay.horizontal) {
            case op_def.HorizontalAlignment.HORIZONTAL_LEFT:
                this.mLeftFaceIcon.setTexture(url);
                this.mLeftFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mLeftBaseScaleX = scaleX;
                this.mLeftBaseScaleY = scaleY;
                scale = this.getScale(InteractivePanel.baseWidth, InteractivePanel.baseHeight, this.mLeftFaceIcon.width, this.mLeftFaceIcon.height);
                this.mLeftFaceIcon.scaleX = scaleX * scale;
                this.mLeftFaceIcon.scaleY = scaleY * scale;
                this.mLeftFaceIcon.x = imgX + 200;
                // this.mLeftFaceIcon.y = desConWorldY - this.mLeftFaceIcon.height / 2;
                // this.mLeftFaceIcon.y = imgY + this.mLeftFaceIcon.height / 4;
                this.mLeftFaceIcon.setInteractive();
                this.addAt(this.mLeftFaceIcon, 0);
                this.mLeftFaceIcon.visible = true;
                this.mLeftFaceIcon.off("pointerup", this.leftFaceClick, this);
                this.mLeftFaceIcon.on("pointerup", this.leftFaceClick, this);
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_CENTER:
                this.mMidFaceIcon.setTexture(url);
                this.mMidFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mMidBaseScaleX = scaleX;
                this.mMidBaseScaleY = scaleY;
                scale = this.getScale(InteractivePanel.baseWidth, InteractivePanel.baseHeight, this.mMidFaceIcon.width, this.mMidFaceIcon.height);
                this.mMidFaceIcon.scaleX = scaleX * scale;
                this.mMidFaceIcon.scaleY = scaleY * scale;
                this.mMidFaceIcon.x = 0;
                // this.mMidFaceIcon.y = desConWorldY - this.mMidFaceIcon.height / 2;
                // this.mMidFaceIcon.y = imgY + this.mMidFaceIcon.height / 4;
                this.addAt(this.mMidFaceIcon, 0);
                this.mMidFaceIcon.visible = true;
                this.mMidFaceIcon.setInteractive();
                this.mLeftFaceIcon.off("pointerup", this.midFaceClick, this);
                this.mMidFaceIcon.on("pointerup", this.midFaceClick, this);
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_RIGHT:
                this.mRightFaceIcon.setTexture(url);
                this.mRightFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mRightBaseScaleX = scaleX;
                this.mRightBaseScaleY = scaleY;
                scale = this.getScale(InteractivePanel.baseWidth, InteractivePanel.baseHeight, this.mRightFaceIcon.width, this.mRightFaceIcon.height);
                this.mRightFaceIcon.scaleX = scaleX * scale;
                this.mRightFaceIcon.scaleY = scaleY * scale;
                this.mRightFaceIcon.x = 200;
                // this.mRightFaceIcon.y = desConWorldY - this.mRightFaceIcon.height / 2;
                // this.mRightFaceIcon.y = imgY + this.mRightFaceIcon.height / 4;
                this.addAt(this.mRightFaceIcon, 0);
                this.mRightFaceIcon.visible = true;
                this.mRightFaceIcon.setInteractive();
                this.mRightFaceIcon.off("pointerup", this.rightFaceClick, this);
                this.mRightFaceIcon.on("pointerup", this.rightFaceClick, this);
                break;
        }
        this.resize();
    }

    private rightFaceClick(pointer) {
        if (!this.checkPointer(pointer)) return;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!med) return;
        med.componentClick(this.mRightFaceIcon.getData("nodeID"));
    }

    private midFaceClick(pointer) {
        if (!this.checkPointer(pointer)) return;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!med) return;
        med.componentClick(this.mMidFaceIcon.getData("nodeID"));
    }

    private leftFaceClick(pointer) {
        if (!this.checkPointer(pointer)) return;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!med) return;
        med.componentClick(this.mLeftFaceIcon.getData("nodeID"));
    }

    private descConClick(pointer) {
        if (!this.checkPointer(pointer)) return;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!this.mDescCon.getData("nodeID") || !med) return;
        med.componentClick(this.mDescCon.getData("nodeID"));
    }

    private nameConClick(pointer) {
        if (!this.checkPointer(pointer)) return;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!this.mNameCon.getData("nodeID") || !med) return;
        med.componentClick(this.mNameCon.getData("nodeID"));
    }

    private checkPointer(pointer: Phaser.Input.Pointer): boolean {
        return Math.abs(pointer.downX - pointer.upX) < this.mDisDelection &&
            Math.abs(pointer.downY - pointer.upY) < this.mDisDelection;
    }

    private onLoadError(file: Phaser.Loader.File) {
    }

    private radioComplete() {
        this.mRadioCom = true;
        if (!this.mRadio) return;
        this.mRadio.x = 220;
        this.mRadio.y = this.mDescCon.height + 200;
        this.resize();
    }
}
