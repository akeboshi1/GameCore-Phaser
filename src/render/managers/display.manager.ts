import { Logger, LogicPos } from "utils";
import { DisplayField, DisplayObject } from "../display/display.object";
import { SceneManager } from "../scenes/scene.manager";
import { FramesDisplay } from "../display/frames/frames.display";
import { PlayScene } from "../scenes/play.scene";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { IScenery } from "structure";
import { BlockManager } from "../display/scenery/block.manager";
import { Render } from "../render";
import { IFramesModel } from "structure";
import { IDragonbonesModel } from "structure";
import { RunningAnimation } from "structure";
export enum NodeType {
    UnknownNodeType = 0,
    GameNodeType = 1,
    SceneNodeType = 2,
    ElementNodeType = 3,
    TerrainNodeType = 4,
    CharacterNodeType = 5,
    LocationType = 6,
    MovableType = 7,
    DisplayType = 8,
    AttributeType = 9,
    FunctionType = 10,
    AnimationsType = 11,
    EventType = 12,
    MapSizeType = 13,
    UIType = 14,
    TimerType = 15,
    PackageType = 16,
    PackageItemType = 17,
    AvatarType = 18,
    SettingsType = 19,
    CampType = 20,
    MutexType = 21,
    AnimationDataType = 22,
    ForkType = 23,
    ButtonType = 24,
    TextType = 25,
    AccessType = 26,
    SpawnPointType = 27,
    CommodityType = 28,
    ShopType = 29,
    PaletteType = 30,
    TerrainCollectionType = 31,
    AssetsType = 32,
    MossType = 33,
    MossCollectionType = 34,
    SceneryType = 35,
    ModsType = 36,
    InputTextType = 37
}
export class DisplayManager {
    private sceneManager: SceneManager;
    private displays: Map<number, DisplayObject>;
    private scenerys: Map<number, BlockManager>;

    constructor(private render: Render) {
        this.sceneManager = render.sceneManager;
        this.displays = new Map();
        this.scenerys = new Map();
    }

    public resize(width: number, height: number) {
        this.scenerys.forEach((scenery) => {
            scenery.resize(width, height);
        });
    }

    public addDragonbonesDisplay(data: IDragonbonesModel): void {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DisplayObject;
        if (!this.displays.has(data.id)) {
            display = new DragonbonesDisplay(scene, this.render, data.id, NodeType.CharacterNodeType);
            this.displays.set(data.id, display);
        } else {
            display = this.displays.get(data.id);
        }
        display.load(data);
        (<PlayScene>scene).layerManager.addToLayer("surfaceLayer", display);
    }

    public addTerrainDisplay(data: IFramesModel) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DisplayObject;
        if (!this.displays.has(data.id)) {
            display = new FramesDisplay(scene, this.render, data.id, NodeType.TerrainNodeType);
            this.displays.set(data.id, display);
        } else {
            display = this.displays.get(data.id);
        }
        display.load(data);
        (<PlayScene>scene).layerManager.addToLayer("surfaceLayer", display);
    }

    public addFramesDisplay(data: IFramesModel) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getSceneByName(PlayScene.name);
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DisplayObject;
        if (!this.displays.has(data.id)) {
            display = new FramesDisplay(scene, this.render, data.id, NodeType.ElementNodeType);
            this.displays.set(data.id, display);
        } else {
            display = this.displays.get(data.id);
        }
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
        if (!sprite.pos) sprite.pos = new LogicPos(0, 0, 0);
        display.setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
        display.changeAlpha(sprite.alpha);
    }

    public addSkybox(scenery: IScenery) {
        const skybox = new BlockManager(scenery, this.render);
        this.scenerys.set(scenery.id, skybox);
    }

    public updateSkyboxState(state) {
        this.scenerys.forEach((scenery) => {
            scenery.setState(state);
        });
    }

    public removeSkybox(scenery: IScenery) {

    }

    public getDisplay(id: number): DisplayObject {
        return this.displays.get(id);
    }

    public displayDoMove(id: number, moveData: any) {
        const display = this.getDisplay(id);
        if (display) display.doMove(moveData);
    }

    public showNickname(id: number, name: string) {
        const display = this.getDisplay(id);
        if (!display) {
            return;
        }
        display.showNickname(name);
        // if (display) display.showNickname(name);
    }
}
