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
    private mWorld: WorldService;
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
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
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

        if (data.text) {
            if (data.text.length > 0) {
                const descData: op_gameconfig_01.IText = data.text[0];
                this.mDescCon.setData("nodeID", descData.node.id);
                this.mDescTF.text = descData.text;
                this.mDescCon.on("pointerdown", () => {
                    if (!this.mDescCon.getData("nodeID") || !med) return;
                    med.componentClick(this.mDescCon.getData("nodeID"));
                });
                if (data.text[1]) {
                    const nameData: op_gameconfig_01.IText = data.text[1];
                    this.mNameCon.setData("nodeID", nameData.node.id);
                    this.mNameTF.text = nameData.text;
                    this.mNameCon.on("pointerdown", () => {
                        if (!this.mNameCon.getData("nodeID") || !med) return;
                        med.componentClick(this.mNameCon.getData("nodeID"));
                    });
                }
            }

        }

        if (data.button && data.button.length > 0) {
            this.mRadio = new Radio(this.mScene, {
                wid: 328,
                hei: 142,
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
            this.add(this.mRadio);
            this.mRadio.setRadioData(data.button);
        }
    }

    public update(param?: op_client.OP_VIRTUAL_WORLD_RES_CLIENT_UPDATE_UI) {

    }

    public getRadio(): Radio {
        return this.mRadio;
    }

    public setRadioData(data: any[]) {
        this.mRadio.setRadioData(data);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width / 2;
        this.y = size.height - this.height >> 1;
    }
    public hide() {
        super.hide();
        this.destroy();
    }

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
        this.mWorld.uiManager.getUILayerManager().addToToolTipsLayer(this);
        const size: Size = this.mWorld.getSize();
        const wid: number = size.width;
        const hei: number = size.height;

        this.mNameCon = this.mScene.make.container(undefined, false);
        this.mDescCon = this.mScene.make.container(undefined, false);
        const backGround: NinePatch = new NinePatch(this.scene, 0, 0, 1080, 320, Background.getName(), null, Background.getConfig());
        const border = new NinePatch(this.scene, 0, 0, 1040, 280, Border.getName(), null, Border.getConfig());

        this.mLeftFaceIcon = this.mScene.make.image(undefined, false);
        this.mMidFaceIcon = this.mScene.make.image(undefined, false);
        this.mRightFaceIcon = this.mScene.make.image(undefined, false);

        this.mNameTF = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "20px",
            wrap: {
                mode: "char",
                width: 200
            },
        });

        const nameBg = this.mScene.make.image(undefined, false);
        nameBg.setTexture("juqing", "juqing_name.png");
        this.mNameCon.add(nameBg);
        this.mNameCon.add(this.mNameTF);

        this.mDescTF = new BBCodeText(this.mScene, 0, 0, "", {
            fontSize: "20px",
            wrap: {
                mode: "char",
                width: 420 * this.mWorld.uiScale
            },
        });
        this.mNameTF.x = -65;
        this.mNameTF.y = -8;
        this.mDescTF.x = -border.width / 2;
        this.mDescTF.y = -border.height / 2;
        this.mDescCon.setSize(backGround.width, backGround.height);
        this.mNameCon.setSize(nameBg.width, nameBg.height);
        this.mDescCon.add(backGround);
        this.mDescCon.add(border);
        this.mDescCon.add(this.mDescTF);
        this.mDescCon.y = size.height / 2 + 80;
        this.mNameCon.x = 150 - this.mDescCon.width / 2;
        this.mNameCon.y = this.mDescCon.y - this.mDescCon.height / 2 - this.mNameCon.height / 2 - 10;
        this.mDescCon.setInteractive();
        this.mNameCon.setInteractive();

        this.add(this.mLeftFaceIcon);
        this.add(this.mMidFaceIcon);
        this.add(this.mRightFaceIcon);
        this.add(this.mNameCon);
        this.add(this.mDescCon);

        super.init();
    }

    private onLoadComplete() {
        const size: Size = this.mWorld.getSize();
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mData[0];
        const uiDisplay: op_gameconfig_01.IDisplay = data.display[0];
        const url: string = uiDisplay.texturePath;
        const med: InteractivePanelMediator = this.mWorld.uiManager.getMediator(InteractivePanelMediator.NAME) as InteractivePanelMediator;
        switch (uiDisplay.horizontal) {
            case op_def.HorizontalAlignment.HORIZONTAL_LEFT:
                this.mLeftFaceIcon.setTexture(url);
                this.mLeftFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mLeftFaceIcon.x = size.width / 2 - this.mLeftFaceIcon.width;
                this.mLeftFaceIcon.y = -100;
                this.mLeftFaceIcon.setInteractive();
                this.mLeftFaceIcon.on("pointerdown", () => {
                    if (!med) return;
                    med.componentClick(this.mLeftFaceIcon.getData("nodeID"));
                });
                this.add(this.mLeftFaceIcon);
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_CENTER:
                this.mMidFaceIcon.setTexture(url);
                this.mMidFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mMidFaceIcon.x = this.mWorld.getSize().width >> 1;
                this.mMidFaceIcon.y = -100;
                this.mMidFaceIcon.on("pointerdown", () => {
                    if (!med) return;
                    med.componentClick(this.mMidFaceIcon.getData("nodeID"));
                });
                this.add(this.mMidFaceIcon);
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_RIGHT:
                this.mRightFaceIcon.setTexture(url);
                this.mRightFaceIcon.setData("nodeID", uiDisplay.node.id);
                this.mRightFaceIcon.x = (this.mWorld.getSize().width >> 1) + 200;
                this.mRightFaceIcon.y = -100;
                this.mRightFaceIcon.on("pointerdown", () => {
                    if (!med) return;
                    med.componentClick(this.mRightFaceIcon.getData("nodeID"));
                });
                this.add(this.mRightFaceIcon);
                break;
        }
    }

    private onLoadError(file: Phaser.Loader.File) {
    }

    private radioComplete() {
        const size: Size = this.mWorld.getSize();
        this.mRadio.x = size.width - this.mRadio.width - 10;
        this.mRadio.y = size.height - this.mRadio.height;
        this.add(this.mRadio);
    }

}
