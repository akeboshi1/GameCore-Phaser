import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { Url, Background, Border } from "../../utils/resUtil";
import { NinePatch } from "../components/nine.patch";
import { Radio } from "../components/radio";
import { op_client, op_def, op_gameconfig_01 } from "pixelpai_proto";
import BBCodeText from "../../../lib/rexui/plugins/gameobjects/text/bbocdetext/BBCodeText";
import { ISelectCallItemData } from "../components/comboBox";
import { InteractivePanelMediator } from "./InteractivePanelMediator";
export class InteractivePanel extends Panel {
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

    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
    }
    /**
     * 通過參數進行ui佈局
     * @param param
     * @param radioClick
     */
    public show(param?: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI) {
        const size: Size = this.mWorld.getSize();
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShowing = true;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mData[0];
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
                this.mDescTF.text = descData.text;
                this.mDescCon.off("pointerdown", this.descConClick, this);
                this.mDescCon.on("pointerdown", this.descConClick, this);
                if (data.text[1]) {
                    const nameData: op_gameconfig_01.IText = data.text[1];
                    this.mNameCon.setData("nodeID", nameData.node.id);
                    this.mNameTF.text = nameData.text;
                    this.mNameTF.x = - this.mNameTF.width >> 1;
                    this.mNameCon.off("pointerdown", this.nameConClick, this);
                    this.mNameCon.on("pointerdown", this.nameConClick, this);
                }
            }
        }
        if (this.mRadio) this.mRadio.visible = false;
        if (data.button && data.button.length > 0) {
            let tmpHei: number = (data.button.length - 1) * 33 + 46
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
                    clickCallBack: (itemData: ISelectCallItemData) => {
                        if (!itemData || !med) return;
                        med.componentClick(itemData.data);
                    }
                });
                this.radioComplete();
            }
            this.setRadioData(data.button);
            this.mRadio.visible = true;
        }
        this.resize();
        if (this.mShowing) {
            return;
        }
        super.show(param);
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
        this.scaleX = this.scaleY = this.mWorld.uiScale;
        const size: Size = this.mWorld.getSize();
        this.mNameCon.add(this.mNameBg);
        this.mNameCon.add(this.mNameTF);
        this.mDescCon.add(this.mBg);
        this.mDescCon.add(this.mBorder);
        this.mDescCon.add(this.mDescTF);
        this.add(this.mNameCon);
        this.add(this.mDescCon);
        if (this.mWorld.game.device.os.desktop) {
            this.y = size.height / 2 - 250;
        } else {
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                this.mBg.resize((size.width - 10) / this.mWorld.uiScale, size.height * .5 / this.mWorld.uiScale);
                this.mBorder.resize((size.width - 20) / this.mWorld.uiScale, (size.height * .5 - 20) / this.mWorld.uiScale);
                this.setSize(this.mBg.width, this.mBg.height);
            } else {
                this.mBg.resize((size.width - 10) / this.mWorld.uiScale, size.height * .5 / this.mWorld.uiScale);
                this.mBorder.resize((size.width - 20) / this.mWorld.uiScale, (size.height * .5 - 20) / this.mWorld.uiScale);
                this.setSize(this.mBg.width, this.mBg.height);
            }
            this.y = this.mBg.height * 1.5 * this.mWorld.uiScale;
        }

        this.x = size.width >> 1;
        this.refreshUIPos();
        if (this.mRadio) {
            this.add(this.mRadio);
        }
    }

    public destroy() {
        this.mInitialized = false;
        if (this.mNameCon) {
            this.mNameCon.off("pointerdown", this.nameConClick, this);
            this.mNameCon.destroy(true);
        }
        if (this.mDescCon) {
            this.mDescCon.off("pointerdown", this.descConClick, this);
            this.mDescCon.destroy(true);
        }
        if (this.mLeftFaceIcon) {
            this.mLeftFaceIcon.off("pointerdown", this.leftFaceClick, this);
            this.mLeftFaceIcon.destroy(true);
        }
        if (this.mMidFaceIcon) {
            this.mMidFaceIcon.off("pointerdown", this.midFaceClick, this);
            this.mMidFaceIcon.destroy(true);
        }
        if (this.mRightFaceIcon) {
            this.mRightFaceIcon.off("pointerdown", this.midFaceClick, this);
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
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        this.mNameCon = this.mScene.make.container(undefined, false);
        this.mDescCon = this.mScene.make.container(undefined, false);
        this.mBg = new NinePatch(this.scene, 0, 0, 1080, 320, Background.getName(), null, Background.getConfig());
        this.setSize(this.mBg.width, this.mBg.height);
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
            fontSize: "20px",
            wrap: {
                mode: "char",
                width: this.mBorder.width
            },
        });
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

    private refreshUIPos() {
        const size: Size = this.mWorld.getSize();
        this.mDescCon.setSize(this.mBg.width, this.mBg.height);
        this.mNameCon.setSize(this.mNameBg.width, this.mNameBg.height);
        this.mNameTF.y = -8 * this.mWorld.uiScale;
        this.mDescTF.x = -this.mBorder.width / 2;
        this.mDescTF.y = -this.mBorder.height / 2;

        this.mDescCon.y = this.mWorld.game.device.os.desktop ? size.height / 2 + 80 : 0;
        this.mNameCon.x = 150 - this.mDescCon.width / 2;
        this.mNameCon.y = this.mDescCon.y - this.mDescCon.height / 2 - this.mNameCon.height / 2 - 10;
        this.mNameTF.setWrapWidth(this.mBorder.width);
        this.mDescTF.setWrapWidth(this.mBorder.width);

        this.mNameTF.x = - this.mNameTF.width >> 1;

        if (!this.mWorld.game.device.os.desktop) {
            const leftIconWid: number = this.mLeftFaceIcon.width * this.mWorld.uiScale;
            const leftIconHei: number = this.mLeftFaceIcon.height * this.mWorld.uiScale;
            let leftScale: number = 1;
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                leftScale = leftIconWid > size.width * .5 ? size.width * .5 / leftIconWid : leftIconWid / size.width * .5;
            } else {
                leftScale = leftIconHei > size.height * .5 ? size.height * .5 / leftIconHei : leftIconHei / size.height * .5;
            }
            this.mLeftFaceIcon.scaleX = this.mLeftBaseScaleX * leftScale * .7;
            this.mLeftFaceIcon.scaleY = this.mLeftBaseScaleY * leftScale * .7;
            this.mLeftFaceIcon.x = this.mNameCon.x;
            this.mLeftFaceIcon.y = this.mNameCon.y + this.mNameCon.height / 2 + 10 - this.mLeftFaceIcon.height * leftScale * .7 / 2;

            let midScale: number = 1;
            const midIconWid: number = this.mMidFaceIcon.width * this.mWorld.uiScale;
            const midIconHei: number = this.mMidFaceIcon.height * this.mWorld.uiScale;
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                midScale = midIconWid > size.width * .5 ? size.width * .5 / midIconWid : midIconWid / size.width * .5;
            } else {
                midScale = midIconHei > size.height * .5 ? size.height * .5 / midIconHei : midIconHei / size.height * .5;
            }
            this.mMidFaceIcon.scaleX = this.mMidBaseScaleX * midScale * .7;
            this.mMidFaceIcon.scaleY = this.mMidBaseScaleY * midScale * .7;
            this.mMidFaceIcon.x = 0;
            this.mMidFaceIcon.y = this.mNameCon.y + this.mNameCon.height / 2 + 10 - this.mMidFaceIcon.height * midScale * .7 / 2;

            let rightScale: number = 1;
            const rightIconWid: number = this.mRightFaceIcon.width * this.mWorld.uiScale;
            const rightIconHei: number = this.mRightFaceIcon.height * this.mWorld.uiScale;
            if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                rightScale = rightIconWid > size.width * .5 ? size.width * .5 / rightIconWid : rightIconWid / size.width * .5;
            } else {
                rightScale = rightIconHei > size.height * .5 ? size.height * .5 / rightIconHei : rightIconHei / size.height * .5;
            }
            this.mRightFaceIcon.scaleX = this.mRightBaseScaleX * rightScale * .7;
            this.mRightFaceIcon.scaleY = this.mRightBaseScaleY * rightScale * .7;
            this.mRightFaceIcon.x = -this.mNameCon.x;
            this.mRightFaceIcon.y = this.mNameCon.y + this.mNameCon.height / 2 + 10 - this.mRightFaceIcon.height * rightScale * .7 / 2;
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

    private onLoadComplete() {
        const size: Size = this.mWorld.getSize();
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mData[0];
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
                if (!this.mWorld.game.device.os.desktop) {
                    if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                        scale = this.mLeftFaceIcon.width > size.width * .5 ? size.width * .5 / this.mLeftFaceIcon.width : this.mLeftFaceIcon.width / size.width * .5;
                    } else {
                        scale = this.mLeftFaceIcon.height > size.height * .5 ? size.height * .5 / this.mLeftFaceIcon.height : this.mLeftFaceIcon.height / size.height * .5;
                    }
                }
                this.mLeftFaceIcon.scaleX = scaleX * scale;
                this.mLeftFaceIcon.scaleY = scaleY * scale;
                this.mLeftFaceIcon.x = imgX + 200;
                this.mLeftFaceIcon.y = imgY + this.mLeftFaceIcon.height / 4;
                this.mLeftFaceIcon.setInteractive();
                this.addAt(this.mLeftFaceIcon, 0);
                this.mLeftFaceIcon.visible = true;
                this.mLeftFaceIcon.off("pointerdown", this.leftFaceClick, this);
                this.mLeftFaceIcon.on("pointerdown", this.leftFaceClick, this);
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_CENTER:
                this.mMidFaceIcon.setTexture(url);
                this.mMidFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mMidBaseScaleX = scaleX;
                this.mMidBaseScaleY = scaleY;
                if (!this.mWorld.game.device.os.desktop) {
                    if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                        scale = this.mMidFaceIcon.width > size.width * .5 ? size.width * .5 / this.mMidFaceIcon.width : this.mMidFaceIcon.width / size.width * .5;
                    } else {
                        scale = this.mMidFaceIcon.height > size.height * .5 ? size.height * .5 / this.mMidFaceIcon.height : this.mMidFaceIcon.height / size.height * .5;
                    }
                }
                this.mMidFaceIcon.scaleX = scaleX * scale;
                this.mMidFaceIcon.scaleY = scaleY * scale;
                this.mMidFaceIcon.x = 0;
                this.mMidFaceIcon.y = imgY + this.mMidFaceIcon.height / 4;
                this.addAt(this.mMidFaceIcon, 0);
                this.mMidFaceIcon.visible = true;
                this.mLeftFaceIcon.off("pointerdown", this.midFaceClick, this);
                this.mMidFaceIcon.on("pointerdown", this.midFaceClick, this);
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_RIGHT:
                this.mRightFaceIcon.setTexture(url);
                this.mRightFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mRightBaseScaleX = scaleX;
                this.mRightBaseScaleY = scaleY;
                if (!this.mWorld.game.device.os.desktop) {
                    if (this.mWorld.game.scale.orientation === Phaser.Scale.Orientation.LANDSCAPE) {
                        scale = this.mRightFaceIcon.width > size.width * .5 ? size.width * .5 / this.mRightFaceIcon.width : this.mRightFaceIcon.width / size.width * .5;
                    } else {
                        scale = this.mRightFaceIcon.height > size.height * .5 ? size.height * .5 / this.mRightFaceIcon.height : this.mRightFaceIcon.height / size.height * .5;
                    }
                }
                this.mRightFaceIcon.scaleX = scaleX * scale;
                this.mRightFaceIcon.scaleY = scaleY * scale;
                this.mRightFaceIcon.x = 200;
                this.mRightFaceIcon.y = imgY + this.mRightFaceIcon.height / 4;
                this.addAt(this.mRightFaceIcon, 0);
                this.mRightFaceIcon.visible = true;
                this.mRightFaceIcon.off("pointerdown", this.rightFaceClick, this);
                this.mRightFaceIcon.on("pointerdown", this.rightFaceClick, this);
                break;
        }
        this.resize();
    }

    private rightFaceClick() {
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!med) return;
        med.componentClick(this.mRightFaceIcon.getData("nodeID"));
    }

    private midFaceClick() {
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!med) return;
        med.componentClick(this.mMidFaceIcon.getData("nodeID"));
    }

    private leftFaceClick() {
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!med) return;
        med.componentClick(this.mLeftFaceIcon.getData("nodeID"));
    }

    private descConClick() {
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!this.mDescCon.getData("nodeID") || !med) return;
        med.componentClick(this.mDescCon.getData("nodeID"));
    }

    private nameConClick() {
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        if (!this.mNameCon.getData("nodeID") || !med) return;
        med.componentClick(this.mNameCon.getData("nodeID"));
    }

    private onLoadError(file: Phaser.Loader.File) {
    }

    private radioComplete() {
        this.mRadioCom = true;
        const size: Size = this.mWorld.getSize();
        if (!this.mRadio) return;
        // this.mRadio.x = 220;
        // this.mRadio.y = this.mDescCon.height + 200;
        this.resize();
    }
}
