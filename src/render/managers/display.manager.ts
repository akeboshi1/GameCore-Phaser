import { RunningAnimation, IFramesModel, IDragonbonesModel } from "structureinterface";
import { Logger } from "utils";
import { DisplayField, DisplayObject } from "../display/display.object";
import { SceneManager } from "../scenes/scene.manager";
import { FramesDisplay } from "../display/frames/frames.display";
import { PlayScene } from "../scenes/play.scene";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";

export class DisplayManager {
    private displays: Map<number, DisplayObject>;

    constructor(private game: Phaser.Game, private sceneManager: SceneManager) {
        this.displays = new Map();
    }

    public addDragonbonesDisplay(data: IFramesModel | IDragonbonesModel): void {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) return;
        const display: DisplayObject = new DragonbonesDisplay(scene, data);
        this.displays.set(data.id, display);
        display.load(data);
        (<PlayScene>scene).layerManager.addToLayer("surfaceLayer", display);
    }

    public addTerrainDisplay(data: IFramesModel ) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) return;
        const display: DisplayObject = new FramesDisplay(scene, data);
        this.displays.set(data.id, display);
        display.load(data);
        (<PlayScene>scene).layerManager.addToLayer("surfaceLayer", display);
    }

    public addFramesDisplay(data: IFramesModel) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) return;
        const display: DisplayObject = new FramesDisplay(scene, data);
        this.displays.set(data.id, display);
        display.load(data);
        (<PlayScene>scene).layerManager.addToLayer("surfaceLayer", display);
    }

    public addWallDisplay(data: IFramesModel | IDragonbonesModel) {
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

    public load(displayID: number, data: any, field?: DisplayField) {
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

    public play(displayID: number, animation: RunningAnimation, field?: DisplayField, times?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("DisplayObject not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.play(animation, field, times);
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

    public setDisplayBadges(displayID: number, cards: []) {
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
        // display.showEffect();
    }

    public setDisplayData(sprite: any) {
        const display = this.displays.get(sprite.id);
        if (!display) return;
        display.setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
        display.changeAlpha(sprite.alpha);
    }

    public getDisplay(id: number): DisplayObject {
        return this.displays.get(id);
    }
}
