import { Render } from "../render";
import { MainUIScene } from "../scenes/main.ui.scene";
import { op_def } from "pixelpai_proto";
import { SceneName, LogicPos } from "structure";
export class MotionManager {
    public enable: boolean;
    protected scene: Phaser.Scene;
    protected uiScene: Phaser.Scene;
    protected gameObject: Phaser.GameObjects.GameObject;
    protected scaleRatio: number;
    protected isHolding: boolean = false;
    protected holdTime: any;
    protected holdDelay: number = 200;
    protected curtime: number;
    protected isRunning = true;
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
        if (this.uiScene) this.uiScene.input.on("gameobjectdown", this.onUiGameObjectDownHandler, this);
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
        if (this.uiScene) this.uiScene.input.off("gameobjectdown", this.onUiGameObjectDownHandler, this);
    }

    resize(width: number, height: number) {
        this.scaleRatio = this.render.scaleRatio;
    }

    update(time: number, delta: number) {
        if (!this.isRunning) return;
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
        const position = this.getPreUserPos(pointer);
        this.start(position.x / this.scaleRatio, position.y / this.scaleRatio);
    }

    setScene(scene: Phaser.Scene) {
        this.removeListener();
        this.scene = scene;
        if (!this.scene) {
            return;
        }
        this.uiScene = this.render.game.scene.getScene(SceneName.MAINUI_SCENE);
        this.addListener();
    }

    pauser() {
        this.isRunning = false;

        this.isHolding = false;
        this.clearGameObject();
    }

    resume() {
        this.isRunning = true;
    }

    destroy() {
        this.removeListener();
        this.clearGameObject();
        this.scene = null;
        this.uiScene = null;
    }

    public async onGuideOnPointUpHandler(pointer: Phaser.Input.Pointer, id: number) {
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        if (id) {
            if (id) {
                const ele = this.render.displayManager.getDisplay(id);
                if (ele.nodeType === op_def.NodeType.CharacterNodeType) {
                    // TODO
                    this.render.mainPeer.activePlayer(id);
                    this.clearGameObject();
                    return;
                }
                let targets = await this.render.mainPeer.getInteractivePosition(id);
                if (!targets || targets.length === 0) {
                    const { x, y } = ele;
                    targets = [{ x, y }];
                }
                this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
            }
        } else {
            this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
        }
        this.clearGameObject();
    }

    protected async onPointerDownHandler(pointer: Phaser.Input.Pointer) {
        if (!this.isRunning) return;
        if (!this.render.guideManager || this.render.guideManager.canInteractive()) return;
        this.scene.input.on("pointermove", this.onPointerMoveHandler, this);
        this.holdTime = setTimeout(() => {
            this.isHolding = true;
        }, this.holdDelay);
    }

    protected async onPointerUpHandler(pointer: Phaser.Input.Pointer) {
        this.moveToTargetAndActive(pointer);
    }

    protected async moveToTargetAndActive(pointer: Phaser.Input.Pointer) {
        if (!this.isRunning) return;
        this.isHolding = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        if (!this.render.guideManager || this.render.guideManager.canInteractive()) return;
        if (Math.abs(pointer.downX - pointer.upX) >= 5 * this.render.scaleRatio && Math.abs(pointer.downY - pointer.upY) >= 5 * this.render.scaleRatio || pointer.upTime - pointer.downTime > this.holdDelay) {
            this.stop();
        } else {
            if (this.gameObject) {
                const id = this.gameObject.getData("id");
                if (id) {
                    if (!this.render.guideManager || this.render.guideManager.canInteractive(id)) return;
                    await this.getEleMovePath(id, pointer);
                }
            } else {
                this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
            }
        }
        this.clearGameObject();
    }

    protected async getEleMovePath(id, pointer) {
        const ele = this.render.displayManager.getDisplay(id);
        if (!ele || !ele.hasInteractive) { // ?????????????????????????????????????????????
            this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, [new LogicPos(pointer.worldX / this.scaleRatio, pointer.worldY / this.scaleRatio)]);
            return;
        }
        if (ele.nodeType === op_def.NodeType.CharacterNodeType) {
            // TODO
            this.render.mainPeer.activePlayer(id);
            this.clearGameObject();
            return;
        }
        let targets = await this.render.mainPeer.getInteractivePosition(this.getMountId(id));
        if (!targets || targets.length === 0) {
            const { x, y } = ele;
            targets = [{ x, y }];
        }
        this.movePath(pointer.worldX / this.render.scaleRatio, pointer.worldY / this.render.scaleRatio, 0, targets, id);
    }

    protected async onPointerMoveHandler(pointer: Phaser.Input.Pointer) {
        if (!this.isRunning) return;
        this.isHolding = true;
    }

    protected onUiGameObjectDownHandler(pointer) {
        if (!this.isRunning) return;
        if (!this.render.guideManager || this.render.guideManager.canInteractive()) return;
        this.isHolding = false;
        this.scene.input.off("pointermove", this.onPointerMoveHandler, this);
        // const position = this.getPreUserPos(pointer);
        // if (!position) return;
        this.stop();
        clearTimeout(this.holdTime);
    }

    protected onGameObjectDownHandler(pointer, gameObject) {
        if (!this.isRunning) return;
        const id = gameObject ? gameObject.getData("id") : undefined;
        if (!this.render.guideManager || this.render.guideManager.canInteractive(id)) return;
        this.gameObject = gameObject;
    }

    protected onGameObjectUpHandler(pointer, gameObject) {
        if (!this.isRunning) return;
        if (!this.render.guideManager || this.render.guideManager.canInteractive()) return;
    }

    protected getMountId(id: number) {
        const ele = this.render.displayManager.getDisplay(id);
        if (!ele) return -1;
        if (ele.rootMount) {
            return this.getMountId((<any>ele.rootMount).id);
        }
        return ele.id;
    }

    protected movePath(x: number, y: number, z: number, targets: {}, id?: number) {
        // todo check

        this.render.mainPeer.findPath(targets, id);
        // this.render.physicalPeer.findPath(targets, id);
    }

    protected clearGameObject() {
        this.gameObject = null;
        if (this.holdTime) clearTimeout(this.holdTime);
    }

    protected start(worldX: number, worldY: number, id?: number) {
        this.render.mainPeer.moveMotion(worldX, worldY, id);
    }

    protected stop() {
        this.render.mainPeer.stopSelfMove(true);
    }

    protected getPreUserPos(pointer): Phaser.Math.Vector2 {
        if (!this.scene || !this.scene.cameras || !this.scene.cameras.main) return null;
        const { x, y } = this.render.displayManager.user;
        const tmpX = pointer.worldX / this.scaleRatio - x;
        const tmpY = pointer.worldY / this.scaleRatio - y;
        return this.scene.cameras.main.getWorldPoint(pointer.x - tmpX, pointer.y - tmpY);
    }
}
