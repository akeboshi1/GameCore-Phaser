import {IPos, Logger, LogicPos} from "utils";
import {SceneManager} from "../scenes/scene.manager";
import {FramesDisplay} from "../display/frames/frames.display";
import {PlayScene} from "../scenes/play.scene";
import {DragonbonesDisplay} from "../display/dragonbones/dragonbones.display";
import {DisplayField, ElementStateType, IScenery} from "structure";
import {BlockManager} from "../display/scenery/block.manager";
import {Render} from "../render";
import {IFramesModel} from "structure";
import {IDragonbonesModel} from "structure";
import {RunningAnimation} from "structure";
import {op_def} from "pixelpai_proto";
import {MatterBodies} from "../display/debugs/matter";
import {ServerPosition} from "../display/debugs/server.pointer";
import {BasicScene} from "../scenes";
import {FallEffect} from "picaRender";
import {IDisplayObject} from "../display";

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
    private displays: Map<number, DragonbonesDisplay | FramesDisplay>;
    private scenerys: Map<number, BlockManager>;
    private mUser: IDisplayObject;
    private matterBodies: MatterBodies;
    private serverPosition: ServerPosition;
    private preLoadList: any[];
    private loading: boolean = false;

    // ====实例id
    private uuid: number = 0;

    constructor(private render: Render) {
        this.sceneManager = render.sceneManager;
        this.displays = new Map();
        this.scenerys = new Map();
        this.preLoadList = [];
    }

    get user(): IDisplayObject {
        return this.mUser;
    }

    public update(time: number, delta: number) {
        if (this.preLoadList && this.preLoadList.length > 0 && !this.loading) {
            this.loading = true;
            this.loadProgress();
        }
    }

    public resize(width: number, height: number) {
        this.scenerys.forEach((scenery) => {
            scenery.resize(width, height);
        });
    }

    public updateModel(id: number, data: IDragonbonesModel) {
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        const display: IDisplayObject = this.displays.get(id);
        if (display) {
            display.load(data);
        }
    }

    public addDragonbonesDisplay(id: number, data: IDragonbonesModel) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display;
        if (!this.displays.has(id)) {
            display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, NodeType.CharacterNodeType);
            this.displays.set(id, display);
            this.preLoadList.push(display);
        } else {
            display = this.displays.get(id);
        }
        display.load(data);
        (<PlayScene> scene).layerManager.addToLayer("surfaceLayer", display);
    }

    public addUserDragonbonesDisplay(data: IDragonbonesModel, isUser: boolean = false) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display;
        if (!this.displays.has(data.id)) {
            display = new DragonbonesDisplay(scene, this.render, data.id, this.uuid++, NodeType.CharacterNodeType);
            this.displays.set(data.id, display);
        } else {
            display = this.displays.get(data.id);
        }
        // 主角龙骨无视其余资源优先加载
        display.load(data);
        display.startLoad();
        (<PlayScene> scene).layerManager.addToLayer("surfaceLayer", display);
        if (isUser) this.mUser = display;
        return display;
    }

    public addTerrainDisplay(id: number, data: IFramesModel) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, NodeType.TerrainNodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(id);
        }
        display.load(data);
        (<PlayScene> scene).layerManager.addToLayer("groundLayer", display);
        return display;
    }

    public addFramesDisplay(id: number, data: IFramesModel, field?: DisplayField) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, NodeType.ElementNodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(id);
        }
        display.load(data, field);
        (<PlayScene> scene).layerManager.addToLayer("surfaceLayer", display);
        return display;
    }

    // public addToSurfaceLayer(display: DisplayObject) {
    //     const scene: PlayScene = <PlayScene>this.sceneManager.getMainScene();
    //     if (!scene) {
    //         Logger.getInstance().fatal(`scene does not exist`);
    //         return;
    //     }
    //     scene.layerManager.addToLayer(scene.LAYER_SURFACE, display);
    // }

    public removeDisplay(displayID: number): void {
        if (!this.displays.has(displayID)) {
            // Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.destroy();
        this.displays.delete(displayID);
    }

    public addFillEffect(x: number, y: number, status: op_def.PathReachableStatus) {
        const mainScene: BasicScene = this.render.sceneManager.getMainScene() as BasicScene;
        const fall = new FallEffect(mainScene, this.render.scaleRatio);
        fall.show(status);
        fall.setPosition(x, y);
        mainScene.layerManager.addToLayer("sceneUILayer", fall);
    }

    public load(displayID: number, data: any, field?: DisplayField) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.load(data, field);
    }

    public changeAlpha(displayID: number, val?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.changeAlpha(val);
    }

    public fadeIn(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.fadeIn();
    }

    public fadeOut(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.fadeOut();
    }

    public play(displayID: number, animation: RunningAnimation, field?: DisplayField, times?: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        display.play(animation);
    }

    public mount(displayID: number, targetID: number, targetIndex?: number) {
        const display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const target = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().error("BaseDisplay not found: ", targetID);
            return;
        }
        target.setRootMount(display);
        display.mount(target, targetIndex);
    }

    public unmount(displayID: number, targetID: number) {
        const display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }

        const target = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().error("BaseDisplay not found: ", targetID);
            return;
        }
        target.setRootMount(null);
        display.unmount(target);
    }

    public addEffect(targetID: number, effectID: number, display: IFramesModel) {
        const target = this.getDisplay(targetID);
        const effect = this.addFramesDisplay(effectID, display, DisplayField.Effect);
        if (!target || !effect) {
            return;
        }
        effect.once("initialized", () => {
            target.addEffect(effect);
        });
    }

    public removeEffect(displayID: number) {
        const display = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        display.removeEffect();
        display.destroy();
    }

    public showEffect(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        // display.showEffect();
    }

    public setModel(sprite: any) {
        const display = this.displays.get(sprite.id);
        if (!display) return;
        if (!sprite.pos) sprite.pos = new LogicPos(0, 0, 0);
        display.titleMask = sprite.titleMask;
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

    public removeSkybox(id: number) {
        const scenery = this.scenerys.get(id);
        if (!scenery) {
            return;
        }
        scenery.destroy();
        this.scenerys.delete(id);
    }

    public getDisplay(id: number): DragonbonesDisplay | FramesDisplay | undefined {
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

    public showTopDisplay(id: number, state?: ElementStateType) {
        const display = this.getDisplay(id);
        if (!display) {
            return;
        }
        display.showTopDisplay(state);
    }

    public showMatterDebug(bodies) {
        if (!this.matterBodies) {
            this.matterBodies = new MatterBodies(this.render);
        }
        this.matterBodies.renderWireframes(bodies);
    }

    public hideMatterDebug() {
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = undefined;
        }
    }

    public drawServerPosition(x: number, y: number) {
        if (!this.serverPosition) {
            this.serverPosition = new ServerPosition(this.render);
        }
        this.serverPosition.draw(x, y);
    }

    public destroy() {
        this.loading = false;
        if (this.preLoadList) {
            this.preLoadList.length = 0;
            this.preLoadList = [];
        }
        if (this.displays) {
            this.displays.forEach((display) => {
                if (display) display.destroy();
            });
            this.displays.clear();
        }

        if (this.scenerys) {
            this.scenerys.forEach((block) => {
                if (block) block.destroy();
            });
            this.scenerys.clear();
        }
        if (this.matterBodies) {
            this.matterBodies.destroy();
            this.matterBodies = null;
        }
        if (this.serverPosition) {
            this.serverPosition.destroy();
            this.serverPosition = null;
        }
    }

    private loadProgress() {
        const display: IDisplayObject = this.preLoadList.shift();
        if (!display) {
            this.loading = false;
            return;
        }
        display.startLoad(() => {
            this.loadProgress();
        }).catch(() => {
            this.loadProgress();
        });
    }
}
