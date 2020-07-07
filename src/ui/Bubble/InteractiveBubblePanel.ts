import { WorldService } from "../../game/world.service";
import { op_client, op_pkt_def, op_gameconfig } from "pixelpai_proto";
import { BasePanel } from "../components/BasePanel";
import { IElement } from "../../rooms/element/element";
import { Url } from "../../utils/resUtil";
import { InteractionBubbleContainer } from "./InteractionBubbleContainer";
import { Handler } from "../../Handler/Handler";
import { Pos } from "../../utils/pos";
import { Tool } from "../../utils/tool";
import { PlayScene } from "../../scenes/play";
export class InteractiveBubblePanel extends BasePanel {
    private content: Phaser.GameObjects.Container;
    private world: WorldService;
    private map = new Map<number, InteractionBubbleContainer>();
    private mBubble: InteractionBubbleContainer;
    constructor(scene: Phaser.Scene, world: WorldService) {
        super(scene, world);
        this.world = world;
        this.scale = 1;
    }

    resize(width: number, height: number) {
        super.resize(width, height);
        this.setSize(width, height);
    }

    init() {
        const width = this.scaleWidth;
        const height = this.scaleHeight;
        const zoom = this.scale;
        this.resize(width, height);
        super.init();
    }

    destroy() {
        if (this.map) {
            for (const key in this.map) {
                const bubble = this.map.get(Number(key));
                if (bubble) bubble.destroy();
            }
            this.map.clear();
        }
        super.destroy();
    }
    clearInteractionBubble(id: number) {
        if (this.map.has(id)) {
            const bubble = this.map.get(id);
            bubble.destroy();
            this.map.delete(id);
        }
    }
    showInteractionBubble(content: op_client.IOP_VIRTUAL_WORLD_REQ_CLIENT_SHOW_INTERACTIVE_BUBBLE, ele: IElement) {
        const dpr = this.dpr;
        content.display["resName"] = null;// "gems";
        content.display.texturePath = Url.getUIRes(dpr, "bubble/bubblebg.png");// "resources/test/columns";
        content.display.dataPath = Url.getUIRes(dpr, "bubble/tipsicon.png");// "resources/test/columns";
        const key = content.id;
        if (this.mBubble) this.mBubble.hide();
        if (this.map.has(key)) {
            this.mBubble = this.map.get(key);
        } else {
            this.mBubble = new InteractionBubbleContainer(this.scene, dpr);
            this.map.set(key, this.mBubble);
        }
        this.mBubble.setBubble(content, new Handler(this, this.onInteractiveBubbleHandler));
        const playScene = this.world.game.scene.getScene(PlayScene.name);
        this.updateBubblePos(ele, playScene);
        this.mBubble.setFollow(ele, playScene, (obj) => {
            this.updateBubblePos(ele, obj.scene);
        });
        this.mBubble.show = true;
        this.add(this.mBubble);
    }
    updateBubblePos(gameObject: any, scene: Phaser.Scene) {
        const dpr = this.dpr;
        const zoom = this.world.uiScale;
        const position = gameObject.getDisplay().getWorldTransformMatrix();
        if (position) {
            const pos = Tool.getPosByScenes(scene, new Pos(position.tx, (position.ty - 33 * dpr * zoom)));
            this.mBubble.setPosition(pos.x, pos.y);
        }
    }
    update() {
        if (!this.map) return;
        this.map.forEach((bubble) => {
            if (bubble && bubble.show) bubble.updatePos();
        });
    }

    private onInteractiveBubbleHandler(data: any) {
        this.emit("queryinteractive", data);
    }
}
