import { IRoomService } from "../../../rooms/room";
import { Size } from "../../../utils/size";
import { WorldService } from "../../../game/world.service";
import { Logger } from "../../../utils/log";
import { IBag } from "../basebag";
import { ItemSlot } from "../item.slot";
import { UIMediatorType } from "../../ui.mediatorType";
import { PBpacket } from "net-socket-packet";
import { op_virtual_world } from "pixelpai_proto";
import { PlayerDataModel } from "../../../service/player/playerDataModel";
import { BagPanel } from "../bag/bagPanel";

/**
 * 背包显示栏
 */
export class BagUIMobile implements IBag {
    // bagBtn
    public bagBtn: Phaser.GameObjects.Sprite;
    public bagSlotList: ItemSlot[];
    private mShowing: boolean;
    private mScene: Phaser.Scene;
    private mWorld: WorldService;
    private mParentCon: Phaser.GameObjects.Container;
    private mBagBtnCon: Phaser.GameObjects.Container;
    private mBagBg: Phaser.GameObjects.Sprite;
    private mResStr: string;
    private mResPng: string;
    private mResJson: string;
    constructor(scene: Phaser.Scene, world: WorldService) {
        this.mScene = scene;
        this.mWorld = world;
        const size: Size = this.mWorld.getSize();
        this.mParentCon = this.mScene.add.container(0, 0);
        this.mParentCon.scaleX = this.mParentCon.scaleY = world.uiScale;
        // this.createPanel();
    }
    public isShow(): boolean {
        return this.mShowing;
    }
    public show() {
        if (this.mShowing) {
            // this.hide();
            return;
        }
        this.mShowing = true;
        this.createPanel();
    }
    public update() {

    }
    public hide() {
        this.destroy();
    }
    public resize() {
        const size: Size = this.mWorld.getSize();
        this.mParentCon.x = size.width - this.mBagBg.width;
        this.mParentCon.y = this.mBagBg.height >> 1;
    }
    public destroy() {
        this.mParentCon.destroy(true);
    }

    private createPanel() {
        this.mResStr = "bagMobile";
        this.mResPng = "./resources/ui/bag/bag.png";
        this.mResJson = "./resources/ui/bag/bag.json";
        if (!this.mScene.cache.obj.has(this.mResStr)) {
            this.mScene.load.atlas(this.mResStr, this.mResPng, this.mResJson);
            this.mScene.load.once(Phaser.Loader.Events.COMPLETE, this.onLoadCompleteHandler, this);
            this.mScene.load.start();
        } else {
            this.onLoadCompleteHandler();
        }
    }

    private onLoadCompleteHandler() {
        this.mBagBtnCon = this.mScene.add.container(0, 0);
        this.mBagBg = this.mScene.add.sprite(0, 0, this.mResStr, "bag_BtnBg");
        this.bagBtn = this.mScene.add.sprite(this.mBagBg.x, this.mBagBg.y, this.mResStr, "bag_Btn");
        this.mBagBtnCon.addAt(this.mBagBg, 0);
        this.mBagBtnCon.addAt(this.bagBtn, 1);
        this.mBagBtnCon.setSize(56, 56);
        this.mBagBtnCon.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.mBagBg.width, this.mBagBg.height), Phaser.Geom.Rectangle.Contains);
        this.mParentCon.add(this.mBagBtnCon);
        this.bagBtn.setInteractive();
        this.bagBtn.on("pointerdown", this.bagHandler, this);
        this.resize();
    }

    private bagHandler(pointer) {
        this.mWorld.uiManager.getMediator(UIMediatorType.BagMediator).show();
        // =============index = 0 为背包按钮
        const pkt: PBpacket = new PBpacket(op_virtual_world.OPCODE._OP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE);
        const content: op_virtual_world.IOP_CLIENT_REQ_VIRTUAL_WORLD_QUERY_PACKAGE = pkt.content;
        const playerModel: PlayerDataModel = this.mWorld.modelManager.getModel(PlayerDataModel.NAME) as PlayerDataModel;
        content.id = playerModel.mainPlayerInfo.package[0].id;
        content.page = 1;
        content.perPage = BagPanel.PageMaxCount;
        this.mWorld.connection.send(pkt);

        this.preNextBtnScaleHandler(this.mBagBtnCon);
        // Logger.debug(button);
    }

    private preNextBtnScaleHandler(gameObject: Phaser.GameObjects.Container, scaleX: number = 1) {
        this.mScene.tweens.add({
            targets: gameObject,
            duration: 50,
            ease: "Linear",
            props: {
                scaleX: { value: .5 * scaleX },
                scaleY: { value: .5 },
            },
            yoyo: true,
            repeat: 0,
        });
        gameObject.scaleX = scaleX;
        gameObject.scaleY = 1;
    }
}
