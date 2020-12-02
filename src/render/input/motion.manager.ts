import { Render } from "gamecoreRender";
import { NodeType } from "../managers";
export class MotionManager {
    public enable: boolean;
    private scaleRatio: number;
    private scene: Phaser.Scene;
    private gameObject: Phaser.GameObjects.GameObject;
    private dirty: boolean = false;
    private holdTime: any;
    private holdDelay: number = 200;
    private curtime: number;
    constructor(private render: Render) {
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
        if (this.dirty === false) return;
        this.curtime += delta;
        if (this.curtime < 200) {
            return;
        }
        this.curtime = 0;
        // this.dirty = false;
        const pointer = this.scene.input.activePointer;
        if (!pointer) return;
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

    private start(worldX: number, worldY: number, id?: number) {
        // const user = this.render.user;
        // if (!user) {
        //     return;
        // }
        // this.render.user.moveMotion(worldX, worldY, id);
        this.render.mainPeer.moveMotion(worldX, worldY, id);
    }

    private movePath(worldX: number, worldY: number, id?: number) {
        // const user = this.render.user;
        // if (!user) {
        //     return;
        // }
        // this.render.user.findPath(worldX, worldY, id);
        this.render.mainPeer.findPath(worldX, worldY, id);
    }

    private stop() {
        this.render.mainPeer.stopMove();
        // this.render.user.stopMove();
    }

    private async onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.dirty = false;
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
                        this.clearGameObject();
                        return;
                    }
                    // const position = ele.getPosition();
                    const walkpos = await this.render.mainPeer.getInteractivePosition(id);
                    if (walkpos) {
                        this.movePath(walkpos.x, walkpos.y, id);
                    } else {
                        this.movePath(ele.x, ele.y, id);
                    }
                }
            } else {
                this.movePath(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio);
            }
        }
        this.clearGameObject();
    }

    private onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.holdTime = setTimeout(() => {
            this.dirty = true;
        }, this.holdDelay);
    }

    private onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        // this.start(pointer.worldX, pointer.worldY);
        this.dirty = true;
    }

    private onPointeroutHandler() {
        this.dirty = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        this.stop();
        clearTimeout(this.holdTime);
    }

    private onGameObjectDownHandler(pointer, gameObject) {
        this.gameObject = gameObject;
    }

    private onGameObjectUpHandler(pointer, gameObject) {
    }

    private clearGameObject() {
        this.gameObject = null;
        clearTimeout(this.holdTime);
    }
}
