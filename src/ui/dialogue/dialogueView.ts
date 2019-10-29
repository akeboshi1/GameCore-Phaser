import { Panel } from "../components/panel";
import { WorldService } from "../../game/world.service";
import { Size } from "../../utils/size";
import { Url, Background, Border } from "../../utils/resUtil";
import { NinePatch } from "../components/nine.patch";
import { Radio } from "../components/radio";
import { op_client, op_def } from "pixelpai_proto";

export class DialogueView extends Panel {
    private mWorld: WorldService;
    private mFaceIcon: Phaser.GameObjects.Image;
    private mNameBg: Phaser.GameObjects.Image;
    private mNameTF: Phaser.GameObjects.Text;
    private mDescTF: Phaser.GameObjects.Text;
    private mDialogueCon: Phaser.GameObjects.Container;
    /**
     * 多项选择界面
     */
    private mRadio: Radio;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene);
        this.mWorld = world;
    }

    public show(param?: any) {
        this.mData = param;
        if (!this.mInitialized) {
            this.preload();
            return;
        }
        this.mShowing = true;
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mData[0];
        if (data.uiDisplay && data.uiDisplay.length > 0) {
            const uiDisplay: op_def.IUIDisplay = data.uiDisplay[0];
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
    }

    public getRadio(): Radio {
        if (!this.mRadio) {
            this.mRadio = new Radio(this.mScene, {
                wid: 328,
                hei: 142,
                resKey: "juqingRadio",
                resPng: "./resources/ui/juqing/juqing.png",
                resJson: "./resources/ui/juqing/juqing.json",
                resBg: "radio_bg.png",
                resArrow: "radio_arrow.png",
                fontStyle: { size: 20, color: "#ffcc00", bold: false },
                completeBack: () => {
                    this.radioComplete();
                },
                clickCallBack: () => {
                    if (this.mRadio && this.mRadio.parentContainer) {
                        this.mRadio.clearRadioData();
                        this.mRadio.parentContainer.remove(this.mRadio);
                    }
                }
            });
        }
        return this.mRadio;
    }

    public setRadioData(data: any[]) {
        this.mRadio.setRadioData(data);
    }

    public resize() {
        const size: Size = this.mWorld.getSize();
        this.x = size.width >> 1;
        this.y = size.height - this.height >> 1;
    }
    public hide() {
        super.hide();
        this.destroy();
    }

    public destroy() {
        this.mInitialized = false;
        super.destroy();
    }

    protected preload() {
        if (!this.mScene) {
            return;
        }
        this.scene.load.image(Background.getName(), Background.getPNG());
        this.scene.load.image(Border.getName(), Border.getPNG());
        this.mScene.load.atlas("dialogue", Url.getRes("ui/juqing/juqing.png"), Url.getRes("ui/juqing/juqing.json"));
        super.preload();
    }

    protected init() {
        const size: Size = this.mWorld.getSize();
        const wid: number = size.width;
        const hei: number = size.height;

        const backGround: NinePatch = new NinePatch(this.scene, 0, 0, 1080, 320, Background.getName(), null, Background.getConfig());
        backGround.x = backGround.width >> 1;
        backGround.y = backGround.height >> 1;
        this.add(backGround);

        const border = new NinePatch(this.scene, 8, 20, 900, 280, Border.getName(), null, Border.getConfig());
        border.x = 8 + (border.width >> 1);
        border.y = 20 + (border.height >> 1);
        this.add(border);

        this.mDialogueCon = this.mScene.make.container(undefined, false);
        this.add(this.mDialogueCon);

        this.mFaceIcon = this.mScene.make.image(undefined, false);
        this.mDialogueCon.add(this.mFaceIcon);

        this.mNameTF = this.mScene.make.text(undefined, false);
        this.mDialogueCon.add(this.mNameTF);

        this.mNameBg = this.mScene.make.image(undefined, false);
        this.mNameBg.setTexture("juqing", "juqing_name.png");
        this.mDialogueCon.add(this.mNameBg);

        this.mDescTF = this.mScene.make.text(undefined, false);
        this.add(this.mDescTF);

        this.setSize(wid, hei);
        super.init();
    }

    private onLoadComplete() {
        const data: op_client.IOP_VIRTUAL_WORLD_RES_CLIENT_SHOW_UI = this.mData[0];
        const uiDisplay: op_def.IUIDisplay = data.uiDisplay[0];
        switch (uiDisplay.horizontal) {
            case op_def.HorizontalAlignment.HORIZONTAL_LEFT:
                this.mDialogueCon.x = 0;
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_CENTER:
                this.mDialogueCon.y = this.mWorld.getSize().width >> 1;
                break;
            case op_def.HorizontalAlignment.HORIZONTAL_RIGHT:
                this.mDialogueCon.x = (this.mWorld.getSize().width >> 1) + 200;
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
