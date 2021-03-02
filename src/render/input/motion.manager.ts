import { Render } from "../render";
import { NodeType } from "../managers";
import { MainUIScene } from "../scenes/main.ui.scene";
import { Logger, LogicPos, Tool } from "utils";

export class MotionManager {
    public enable: boolean;
    protected scene: Phaser.Scene;
    private gameObject: Phaser.GameObjects.GameObject;
    private scaleRatio: number;
    private isHolding: boolean = false;
    private holdTime: any;
    private holdDelay: number = 200;
    private curtime: number;
    // private curDirection: number = 0;
    constructor(protected render: Render) {
        this.scaleRatio = render.scaleRatio;
    }

    addListener() {
        if (!this.scene) {
            return;
        }
        this.scene.input.on("pointerup", this.onPointerUpHandler, this);
        this.scene.input.on("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.on("gameobjectdown", this.onGameObjectDownHandler, this);
        this.scene.input.on("gameobjectup", this.onGameObjectUpHandler, this);
    }

    removeListener() {
        if (!this.scene) {
            return;
        }
        this.scene.input.off("pointerup", this.onPointerUpHandler, this);
        this.scene.input.off("pointerdown", this.onPointerDownHandler, this);
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.scene.input.off("gameobjectdown", this.onGameObjectDownHandler, this);
        this.scene.input.off("gameobjectup", this.onGameObjectUpHandler, this);
    }

    resize(width: number, height: number) {
        this.scaleRatio = this.render.scaleRatio;
    }

    update(time: number, delta: number) {
        if (this.isHolding === false) return;
        this.curtime += delta;
        if (this.curtime < 200) {
            return;
        }
        this.curtime = 0;
        const pointer = this.scene.input.activePointer;
        if (pointer.camera) {
            if (pointer.camera.scene && pointer.camera.scene.sys.settings.key === MainUIScene.name) {
                this.isHolding = false;
                this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
                this.clearGameObject();
                return;
            }
        }
        if (!pointer || !this.render.displayManager || !this.render.displayManager.user || !this.render.displayManager.user.visible) return;
        const { x, y } = this.render.displayManager.user;
        const tmpX = pointer.worldX / this.scaleRatio - x;
        const tmpY = pointer.worldY / this.scaleRatio - y;
        const position = this.scene.cameras.main.getWorldPoint(pointer.x - tmpX, pointer.y - tmpY);
        this.start(position.x / this.scaleRatio, position.y / this.scaleRatio);
    }

    setScene(scene: Phaser.Scene) {
        this.removeListener();
        this.scene = scene;
        if (!this.scene) {
            return;
        }
        this.addListener();
    }

    destroy() {
        this.removeListener();
    }

    public async onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        if (this.render.guideManager.canInteractive()) return;
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.holdTime = setTimeout(() => {
            this.isHolding = true;
        }, this.holdDelay);
    }

    protected async onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        if (this.render.guideManager.canInteractive()) return;
        this.isHolding = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        if (Math.abs(pointer.downX - pointer.upX) >= 5 * this.render.scaleRatio && Math.abs(pointer.downY - pointer.upY) >= 5 * this.render.scaleRatio || pointer.upTime - pointer.downTime > this.holdDelay) {
            this.stop();
        } else {
            if (this.gameObject) {
                const id = this.gameObject.getData("id");
                if (id) {
                    const ele = this.render.displayManager.getDisplay(id);
                    if (ele.nodeType === NodeType.CharacterNodeType) {
                        // TODO
                        this.render.mainPeer.activePlayer(id);
                        this.clearGameObject();
                        return;
                    }
                    let targets = await this.render.physicalPeer.getInteractivePosition(id);
                    if (!targets || targets.length === 0) {
                        const { x, y } = ele;
                        targets = [{ x, y }];
                    }
                    this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
                }
            } else {
                this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
            }
        }
        this.clearGameObject();
    }

    protected async onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        this.isHolding = true;
    }

    protected onPointeroutHandler() {
        if (this.render.guideManager.canInteractive()) return;
        this.isHolding = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.stop();
        clearTimeout(this.holdTime);
    }

    protected onGameObjectDownHandler(pointer, gameObject) {
        if (this.render.guideManager.canInteractive()) return;
        this.gameObject = gameObject;
    }

    protected onGameObjectUpHandler(pointer, gameObject) {
        if (this.render.guideManager.canInteractive()) return;
    }

    private start(worldX: number, worldY: number, id?: number) {
        // const user = this.render.user;
        // if (!user) {
        //     return;
        // }
        // this.render.user.moveMotion(worldX, worldY, id);
        // this.render.mainPeer.moveMotion(worldX, worldY, id);
        this.render.physicalPeer.moveMotion(worldX, worldY, id);
    }

    private movePath(x: number, y: number, z: number, targets: {}, id?: number) {
        // const user = this.render.user;
        // if (!user) {
        //     return;'
        // }
        // this.render.user.findPath(worldX, worldY, id);
        // const startPos = this.render.displayManager.user.getPosition();
        this.render.physicalPeer.findPath(targets, id);
    }

    private stop() {
        this.render.physicalPeer.stopMove();
        // this.render.user.stopMove();
    }

    private clearGameObject() {
        this.gameObject = null;
        clearTimeout(this.holdTime);
    }
}
