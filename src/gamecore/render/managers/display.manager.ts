import { Tool } from "utils";
import { SceneManager } from "../scenes/scene.manager";
import { FramesDisplay } from "../display/frames/frames.display";
import { PlayScene } from "../scenes/play.scene";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { Render } from "../render";
import {
    RunningAnimation, IDragonbonesModel, DisplayField, ElementStateType,
    IScenery, LayerName, Handler, IPos, IPosition45Obj, Logger, LogicPos, IFramesModel
} from "structure";
import { op_def } from "pixelpai_proto";
import { MatterBodies } from "../display/debugs/matter";
import { ServerPosition } from "../display/debugs/server.pointer";
import { IDisplayObject } from "../display";
import { Astar } from "../display/debugs/astar";
import { Grids } from "../display/debugs/grids";
import { FramesModel } from "baseGame";
import { BlockManager } from "baseRender";

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
    private mUser: DragonbonesDisplay;
    private matterBodies: MatterBodies;
    private serverPosition: ServerPosition;
    private mAstarDebug: Astar;
    private mGridsDebug: Grids;
    private preLoadList: any[];
    private loading: boolean = false;
    private mModelCache: Map<number, any>;

    // ====实例id
    private uuid: number = 0;

    constructor(protected render: Render) {
        this.sceneManager = render.sceneManager;
        this.displays = new Map();
        this.scenerys = new Map();
        this.mModelCache = new Map();
        this.preLoadList = [];
    }

    get user(): DragonbonesDisplay {
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
        const display: any = this.displays.get(id);
        if (display) {
            display.load(data);
            this.render.mainPeer.elementDisplaySyncReady(id);
        }
    }

    public addDragonbonesDisplay(id: number, data: IDragonbonesModel, layer: number) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DragonbonesDisplay;
        if (!this.displays.has(id)) {
            display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, NodeType.CharacterNodeType);
            this.displays.set(id, display);
            this.preLoadList.push(display);
        } else {
            display = this.displays.get(id) as DragonbonesDisplay;
        }
        display.load(data);
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname) display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
    }

    public addUserDragonbonesDisplay(data: IDragonbonesModel, isUser: boolean = false, layer: number) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: DragonbonesDisplay;
        if (!this.displays.has(data.id)) {
            display = new DragonbonesDisplay(scene, this.render, data.id, this.uuid++, NodeType.CharacterNodeType);
            this.displays.set(data.id, display);
        } else {
            display = this.displays.get(data.id) as DragonbonesDisplay;
        }
        // 主角龙骨无视其余资源优先加载
        display.load(data);
        display.startLoad();
        if (isUser) this.mUser = display;
        const id = data.id;
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname) display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        return display;
    }

    public addTerrainDisplay(id: number, data: IFramesModel, layer: number) {
        if (!data) {
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: FramesDisplay;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, NodeType.TerrainNodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(id) as FramesDisplay;
        }
        display.load(data);
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname) display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        return display;
    }

    public addFramesDisplay(id: number, data: IFramesModel, layer: number, field?: DisplayField) {
        if (!data) {
            Logger.getInstance().debug("addFramesDisplay ====>", id);
            return;
        }
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        let display: FramesDisplay;
        if (!this.displays.has(id)) {
            display = new FramesDisplay(scene, this.render, id, NodeType.ElementNodeType);
            this.displays.set(id, display);
        } else {
            display = this.displays.get(id) as FramesDisplay;
        }
        display.load(data, field);
        const sprite = this.mModelCache.get(id);
        if (sprite) {
            display.titleMask = sprite.titleMask;
            if (sprite.nickname) display.showNickname(sprite.nickname);
            this.mModelCache.delete(id);
        }
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        return display;
    }

    public addToLayer(layerName: string, display: FramesDisplay | DragonbonesDisplay) {
        const scene: PlayScene = <PlayScene>this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        scene.layerManager.addToLayer(layerName, display);
    }

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
        const display: any = this.displays.get(displayID);
        display.changeAlpha(val);
    }

    public fadeIn(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display: any = this.displays.get(displayID);
        display.fadeIn();
    }

    public fadeOut(displayID: number) {
        if (!this.displays.has(displayID)) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display: any = this.displays.get(displayID);
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
        const target: any = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().error("BaseDisplay not found: ", targetID);
            return;
        }
        target.setRootMount(display);
        display.mount(target, targetIndex);
    }

    public unmount(displayID: number, targetID: number) {
        const display: any = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }

        const target: any = this.displays.get(targetID);
        if (!target) {
            Logger.getInstance().error("BaseDisplay not found: ", targetID);
            return;
        }
        target.setRootMount(null);
        display.unmount(target);
    }

    public addEffect(targetID: number, effectID: number, display: IFramesModel) {
        const target = this.getDisplay(targetID);
        let effect: any = this.getDisplay(effectID);
        if (!effect) effect = this.addFramesDisplay(effectID, display, parseInt(LayerName.SURFACE, 10), DisplayField.Effect);
        if (!target || !effect) {
            return;
        }
        if (effect.created) {
            target.addEffect(effect);
        } else {
            effect.createdHandler = new Handler(this, () => {
                target.addEffect(effect);
                effect.createdHandler = undefined;
            });
        }
    }

    public removeEffect(targetID: number, displayID: number) {
        const display: any = this.displays.get(displayID);
        if (!display) {
            Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const target = this.displays.get(targetID);
        if (target) target.removeEffect(display);
        display.destroy();
        this.displays.delete(displayID);
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
        if (!display) {
            this.mModelCache.set(sprite.id, sprite);
            return;
        }
        if (!sprite.pos) sprite.pos = new LogicPos(0, 0, 0);
        display.titleMask = sprite.titleMask;
        (<any>display).setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
        display.checkCollision(sprite);
        (<any>display).changeAlpha(sprite.alpha);
        display.hasInteractive = sprite.hasInteractive;
        if (sprite.nickname) display.showNickname(sprite.nickname);
    }

    public startFireMove(id: number, pos: any) {
        const display = this.displays.get(id);
        if (display) display.startFireMove(pos);
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
            return Logger.getInstance().debug(`can't show nickname ${name}`);
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

    public showGridsDebug(size: IPosition45Obj) {
        if (!this.mGridsDebug) {
            this.mGridsDebug = new Grids(this.render);
        }
        this.mGridsDebug.setData(size);
    }

    public hideGridsDebug() {
        if (this.mGridsDebug) {
            this.mGridsDebug.destroy();
            this.mGridsDebug = null;
        }
    }

    public showAstarDebug_init(map: number[][], posObj: IPosition45Obj) {
        if (!this.mAstarDebug) {
            this.mAstarDebug = new Astar(this.render);
        }

        this.mAstarDebug.initData(map, posObj);
    }

    public showAstarDebug_update(x: number, y: number, val: boolean) {
        if (!this.mAstarDebug) {
            // Logger.getInstance().error("AstarDebug not init");
            return;
        }

        this.mAstarDebug.updateData(x, y, val);
    }

    public showAstarDebug_findPath(start: IPos, tar: IPos, path: IPos[]) {
        if (!this.mAstarDebug) {
            // Logger.getInstance().error("AstarDebug not init");
            return;
        }

        this.mAstarDebug.showPath(start, tar, path);
    }

    public hideAstarDebug() {
        if (this.mAstarDebug) {
            this.mAstarDebug.destroy();
            this.mAstarDebug = null;
        }
    }

    public drawServerPosition(x: number, y: number) {
        if (!this.serverPosition) {
            this.serverPosition = new ServerPosition(this.render);
        }
        this.serverPosition.draw(x, y);
    }

    public hideServerPosition() {
        if (!this.serverPosition) return;
        this.serverPosition.destroy();
        this.serverPosition = null;
    }

    public liftItem(id: number, display, animation) {
        const player: any = this.displays.get(id);
        if (!player) {
            return;
        }
        if (!display || !animation) return;
        player.destroyMount();
        const scene = this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }

        const displayFrame = new FramesDisplay(scene, this.render);
        displayFrame.load(FramesModel.createFromDisplay(display, animation));
        player.mount(displayFrame, 0);
    }

    public clearMount(id: number) {
        const player: any = this.displays.get(id);
        if (player) {
            player.destroyMount();
        }
    }

    public throwElement(userId: number, targetId: number, display, animation) {
        const player: any = this.getDisplay(userId);
        if (!player) {
            return;
        }
        const target: any = this.getDisplay(targetId);
        if (!target) {
            return;
        }

        const scene = this.render.sceneManager.getMainScene();
        const displayFrame = new FramesDisplay(scene, this.render);
        displayFrame.load(FramesModel.createFromDisplay(display, animation));
        this.addToLayer(LayerName.SURFACE, displayFrame);
        const playerPos = player.getPosition();
        const targetPos = target.getPosition();
        // 30 大概手的位置
        displayFrame.setPosition(playerPos.x, playerPos.y - 30, playerPos.z);
        const distance = Tool.twoPointDistance(playerPos, targetPos) * 2;
        const tween = scene.tweens.add({
            targets: displayFrame,
            duration: distance,
            props: { x: targetPos.x, y: targetPos.y - 30 },
            onComplete: () => {
                tween.stop();
                displayFrame.destroy();
            }
        });

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

        if (this.mModelCache) {
            this.mModelCache.clear();
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
        if (this.mAstarDebug) {
            this.mAstarDebug.destroy();
            this.mAstarDebug = null;
        }
        if (this.mGridsDebug) {
            this.mGridsDebug.destroy();
            this.mGridsDebug = null;
        }
    }

    private loadProgress() {
        const display: IDisplayObject = this.preLoadList.shift();
        if (!display) {
            this.loading = false;
            return;
        }
        display.startLoad()
            .then(() => {
                this.loadProgress();
            })
            .catch(() => {
                this.loadProgress();
            });
    }
}
