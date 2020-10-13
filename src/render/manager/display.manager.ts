import { op_def } from "pixelpai_proto";
import { Export, RPCEmitter, RPCExecutor, RPCParam } from "webworker-rpc";
import { AnimationData } from "../../game/room/displayManager/animation/ianimation";
import { IFramesModel } from "../../game/room/displayManager/elementManager/model/iframe.model";
import { Logger } from "../../utils/log";
import { DisplayField, DisplayObject } from "../display/display.object";
import { IDragonbonesModel } from "../display/dragonbones.model";
import { SceneManager } from "./scene.manager";

export interface IDisplayManagerService {
    addDisplay(sceneID: number, displayID: number, data: any): void;
    removeDisplay(displayID: number): void;

    load(displayID: number, data: IFramesModel | IDragonbonesModel, field?: DisplayField);
    // destroyDisplay(displayID: number, fromScene?: boolean): void;
    changeAlpha(displayID: number, val?: number);
    fadeIn(displayID: number);
    fadeOut(displayID: number);
    play(displayID: number, animationName: AnimationData, field?: DisplayField, times?: number);
    mount(displayID: number, ele: Phaser.GameObjects.Container, targetIndex?: number);
    unmount(displayID: number, ele: Phaser.GameObjects.Container);
    removeEffect(displayID: number, field: DisplayField);
    removeDisplayField(displayID: number, field: DisplayField);
    setDisplayBadges(displayID: number, cards: op_def.IBadgeCard[]);
    showRefernceArea(displayID: number);
    hideRefernceArea(displayID: number);
    scaleTween(displayID: number): void;
    showEffect(displayID: number);
}

export abstract class DisplayManager extends RPCEmitter implements IDisplayManagerService {
    protected displays: Map<number, DisplayObject> = new Map<number, DisplayObject>();

    constructor(private game: Phaser.Game, private sceneManager: SceneManager) {
        super();

        this.exportRegistries();
    }

    public addDisplay(sceneID: number, displayID: number, data: any): void {
        const scene = this.sceneManager.getScene(sceneID);
        if (!scene) return;

        const display = new DisplayObject(scene, data);
        this.displays.set(displayID, display);
    }
    public removeDisplay(displayID: number): void {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.removeFromParent();
        display.destroy();
        this.displays.delete(displayID);
    }

    public load(displayID: number, data: IFramesModel | IDragonbonesModel, field?: DisplayField) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.load(data, field);
    }

    public changeAlpha(displayID: number, val?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.changeAlpha(val);
    }

    public fadeIn(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.fadeIn();
    }

    public fadeOut(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.fadeOut();
    }

    public play(displayID: number, animationName: AnimationData, field?: DisplayField, times?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.play(animationName, field, times);
    }

    public mount(displayID: number, ele: Phaser.GameObjects.Container, targetIndex?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.mount(ele, targetIndex);
    }

    public unmount(displayID: number, ele: Phaser.GameObjects.Container) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.unmount(ele);
    }

    public removeEffect(displayID: number, field: DisplayField) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.removeEffect(field);
    }

    public removeDisplayField(displayID: number, field: DisplayField) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.removeDisplay(field);
    }

    public setDisplayBadges(displayID: number, cards: op_def.IBadgeCard[]) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.setDisplayBadges(cards);
    }

    public showRefernceArea(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.showRefernceArea();
    }

    public hideRefernceArea(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.hideRefernceArea();
    }

    public scaleTween(displayID: number): void {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.scaleTween();
    }

    public showEffect(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.showEffect();
    }

    private exportRegistries() {
        this.addRegistry(new RPCExecutor("addDisplay", this.constructor.name));
        this.addRegistry(new RPCExecutor("removeDisplay", this.constructor.name));
        this.addRegistry(new RPCExecutor("load", this.constructor.name));
        this.addRegistry(new RPCExecutor("changeAlpha", this.constructor.name));
        this.addRegistry(new RPCExecutor("fadeIn", this.constructor.name));
        this.addRegistry(new RPCExecutor("fadeOut", this.constructor.name));
        this.addRegistry(new RPCExecutor("play", this.constructor.name));
        this.addRegistry(new RPCExecutor("mount", this.constructor.name));
        this.addRegistry(new RPCExecutor("unmount", this.constructor.name));
        this.addRegistry(new RPCExecutor("removeEffect", this.constructor.name));
        this.addRegistry(new RPCExecutor("removeDisplayField", this.constructor.name));
        this.addRegistry(new RPCExecutor("setDisplayBadges", this.constructor.name));
        this.addRegistry(new RPCExecutor("showRefernceArea", this.constructor.name));
        this.addRegistry(new RPCExecutor("hideRefernceArea", this.constructor.name));
        this.addRegistry(new RPCExecutor("scaleTween", this.constructor.name));
        this.addRegistry(new RPCExecutor("showEffect", this.constructor.name));
    }
}
