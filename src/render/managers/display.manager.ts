import { Handler, IPos, IPosition45Obj, Logger, LogicPos } from "utils";
import { SceneManager } from "../scenes/scene.manager";
import { FramesDisplay } from "../display/frames/frames.display";
import { PlayScene } from "../scenes/play.scene";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { DisplayField, ElementStateType, IScenery, SceneName } from "structure";
import { BlockManager } from "../../base/render/sky.box/block.manager";
import { Render } from "../render";
import { IFramesModel } from "structure";
import { IDragonbonesModel } from "structure";
import { RunningAnimation } from "structure";
import { op_def } from "pixelpai_proto";
import { MatterBodies } from "../display/debugs/matter";
import { ServerPosition } from "../display/debugs/server.pointer";
import { IDisplayObject } from "../display";
import { Astar } from "../display/debugs/astar";
import { Grids } from "../display/debugs/grids";

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

export enum ResType {
    DragonBones,
    Frames,
    Terrain,
}

export interface IAnimationRes {
    id: number;
    animation: any;
    field?: number;
    times?: number;
}

export interface IDisplayRes {
    id: number;
    data: any;
    type?: number;
    layer?: string;
    field?: number;
    callBack?: Function;
}

export class DisplayManager {
    private sceneManager: SceneManager;
    private displays: Map<number, DragonbonesDisplay | FramesDisplay>;
    private scenerys: Map<number, BlockManager>;
    private mUser: IDisplayObject;
    private matterBodies: MatterBodies;
    private serverPosition: ServerPosition;
    private mAstarDebug: Astar;
    private mGridsDebug: Grids;
    // ====分帧处理显示对象缓存
    private mDisplayCacheMap: Map<number, any>;
    // ====分帧处理显示对象数据Model缓存
    private mDisplayModelMap: Map<number, any>;
    // ====分帧处理显示对象更新数据Model缓存
    private mDisplayUpdateModelMap: Map<number, any>;
    // ====分帧处理显示对象加载map
    private mDisplayLoadingMap: Map<number, any>;
    // ====分帧处理显示对象playanimation缓存map
    private mDisplayPlayCacheMap: Map<number, IAnimationRes>;
    // ====是否可交互缓存
    private mInteracitveMap: Map<number, any>;
    // ====角色名字缓存
    private mNameMap: Map<number, any>;

    private mTopDisMap: Map<number, any>;
    // ====是否正在分帧处理的资源
    private mLoading: boolean = false;
    // ====是否正在分帧处理playanimation
    private mPlaying: boolean = false;
    private mShowName: boolean = false;
    private mShowTop: boolean = false;

    // ====是否
    private mInteracitveBoo: boolean = false;

    // ====实例id
    private uuid: number = 0;

    // ====一帧内处理多少显示对象·
    private dealLen: number = 20;

    constructor(protected render: Render) {
        this.sceneManager = render.sceneManager;
        this.displays = new Map();
        this.scenerys = new Map();
        this.mDisplayCacheMap = new Map();
        this.mDisplayModelMap = new Map();
        this.mDisplayUpdateModelMap = new Map();
        this.mDisplayLoadingMap = new Map();
        this.mDisplayPlayCacheMap = new Map();
        this.mInteracitveMap = new Map();
        this.mNameMap = new Map();
        this.mTopDisMap = new Map();
    }

    get user(): IDisplayObject {
        return this.mUser;
    }

    get loading(): boolean {
        return this.mLoading;
    }

    set loading(val: boolean) {
        this.mLoading = val;
    }

    public update(time: number, delta: number) {
        // playScene没有创建完成前，不做添加场景处理
        if (!this.render.sceneCreated) {
            Logger.getInstance().fatal(`scene does not created`);
            return;
        }
        // 创建display
        if (this.mDisplayCacheMap && this.mDisplayCacheMap.size > 0 && !this.loading) {
            this.loading = true;
            this.loadProgress();
        }
        // 等待display创建完成 将更新的数据拷贝给displaycache，继续做loadProgress
        if (this.mDisplayCacheMap && this.mDisplayCacheMap.size < 1 && this.mDisplayUpdateModelMap && this.mDisplayUpdateModelMap.size > 0 && !this.loading) {
            this.loading = true;
            this.updateModelProgress();
        }
        if (this.mInteracitveMap && this.mInteracitveMap.size > 1 && !this.mInteracitveBoo) {
            this.mInteracitveBoo = true;
            this.updateInteracitveCacheProgress();
        }
        // 更新playanimation
        if (this.mDisplayPlayCacheMap && this.mDisplayPlayCacheMap.size > 1 && !this.mPlaying) {
            this.mPlaying = true;
            this.updatePlayCacheProgress();
        }

        if (this.mNameMap && this.mNameMap.size > 1 && !this.mShowName) {
            this.mShowName = true;
            this.updateShowName();
        }

        if (this.mTopDisMap && this.mTopDisMap.size > 1 && !this.mShowTop) {
            this.mShowTop = true;
            this.updateShowTop();
        }
    }

    public playAnimation(id: number, animation: any, field?: any, times?: number) {
        const display = this.getDisplay(id);
        if (display) {
            display.play(animation);
        } else {
            this.mDisplayPlayCacheMap.set(id, { id, animation, field, times });
        }
    }

    public resize(width: number, height: number) {
        this.scenerys.forEach((scenery) => {
            scenery.resize(width, height);
        });
    }

    public setModel(sprite: any) {
        const id = sprite.id;
        const data = this.mDisplayModelMap.get(id);
        if (data) {
            Object.assign(sprite, data);
        }
        const display = this.getDisplay(id);
        if (display) {
            if (!sprite.pos) sprite.pos = new LogicPos(0, 0, 0);
            display.titleMask = sprite.titleMask;
            display.setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
            display.checkCollision(sprite);
            display.changeAlpha(sprite.alpha);
            return;
        }
        this.mDisplayModelMap.set(id, sprite);
        Logger.getInstance().log("setModel ====>", sprite);
    }

    /**
     * updateModel只做缓存，缓存在所有对象创建完成之后在处理，资源优先用于创建显示对象
     * @param id
     * @param data
     */
    public updateModel(id: number, data: IDragonbonesModel | IFramesModel) {
        const preData = this.mDisplayUpdateModelMap.get(id);
        if (preData) Object.assign(data, preData);
        this.mDisplayUpdateModelMap.set(id, {
            id, data, callBack: () => {
                this.render.mainPeer.elementDisplaySyncReady(id);
            }
        });
    }

    public addDragonbonesDisplay(id: number, data: IDragonbonesModel, layer: number, field?: DisplayField, callBack?: Function) {
        if (!data) {
            return;
        }
        Logger.getInstance().log(`add dragonbones display`);
        // 先缓存数据
        this.mDisplayCacheMap.set(id, { id, data, type: ResType.DragonBones, layer: layer.toString(), field, callBack });
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
        (<PlayScene>scene).layerManager.addToLayer(layer.toString(), display);
        if (isUser) this.mUser = display;
        return display;
    }

    public addTerrainDisplay(id: number, data: IFramesModel, layer: number, field?: DisplayField, callBack?: Function) {
        if (!data) {
            return;
        }
        Logger.getInstance().log(`add frames terrain display`);
        // 先缓存数据
        this.mDisplayCacheMap.set(id, { id, data, type: ResType.Terrain, layer: layer.toString(), field, callBack });
    }

    public addFramesDisplay(id: number, data: IFramesModel, layer: number, field?: DisplayField, callBack?: Function) {
        if (!data) {
            Logger.getInstance().debug("addFramesDisplay ====>", id);
            return;
        }
        Logger.getInstance().log(`add frames display`, data);
        // 先缓存数据
        this.mDisplayCacheMap.set(id, { id, data, type: ResType.Frames, layer: layer.toString(), field, callBack });
    }

    public setInteractive(id: number, interactive: boolean) {
        const display = this.getDisplay(id);
        if (display) {
            if (interactive) {
                display.setInteractive();
            } else {
                display.disableInteractive();
            }
        } else {
            this.mInteracitveMap.set(id, { id, interactive });
        }
    }

    public addToSurfaceLayer(display: FramesDisplay | DragonbonesDisplay) {
        const scene: PlayScene = <PlayScene>this.sceneManager.getMainScene();
        if (!scene) {
            Logger.getInstance().fatal(`scene does not exist`);
            return;
        }
        scene.layerManager.addToLayer(PlayScene.LAYER_SURFACE, display);
    }

    public removeDisplay(displayID: number): void {
        if (!this.displays.has(displayID)) {
            // Logger.getInstance().error("BaseDisplay not found: ", displayID);
            return;
        }
        const display = this.displays.get(displayID);
        if (display) {
            display.destroy();
            this.displays.delete(displayID);
        }
    }

    public addFillEffect(x: number, y: number, status: op_def.PathReachableStatus) {
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
        let effect;
        this.addFramesDisplay(effectID, display, parseInt(PlayScene.LAYER_SURFACE, 10), DisplayField.Effect, (effDis) => {
            effect = effDis;
        });
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
        const display = this.displays.get(displayID);
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
            this.mNameMap.set(id, { id, name });
            return;
        }
        display.showNickname(name);
    }

    public showTopDisplay(id: number, state?: ElementStateType) {
        const display = this.getDisplay(id);
        if (!display) {
            this.mTopDisMap.set(id, { id, state });
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

    public destroy() {
        this.loading = false;
        if (this.mDisplayCacheMap) {
            this.mDisplayCacheMap.clear();
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
        const len = this.mDisplayCacheMap.size > this.dealLen ? this.dealLen : this.mDisplayCacheMap.size;
        let index = 0;
        const scene = this.sceneManager.getSceneByName(SceneName.PLAY_SCENE);
        const tmpList = [];
        this.mDisplayCacheMap.forEach((displayRes) => {
            const id = displayRes.id;
            if (index >= len || this.mDisplayLoadingMap.get(id)) {
                return;
            }
            const data = displayRes.data;
            const type = displayRes.type;
            const layer = displayRes.layer;
            const field = displayRes.field;
            const callBack = displayRes.callBack;
            let display: DragonbonesDisplay | FramesDisplay;
            if (!this.displays.has(id)) {
                switch (type) {
                    case ResType.DragonBones:
                        display = new DragonbonesDisplay(scene, this.render, id, this.uuid++, NodeType.CharacterNodeType);
                        break;
                    case ResType.Frames:
                        display = new FramesDisplay(scene, this.render, id, NodeType.ElementNodeType);
                        break;
                    case ResType.Terrain:
                        display = new FramesDisplay(scene, this.render, id, NodeType.TerrainNodeType);
                        break;
                }
                this.displays.set(id, display);
                (<PlayScene>scene).layerManager.addToLayer(layer.toString(), <any>display);
            } else {
                display = this.displays.get(id) as DragonbonesDisplay | FramesDisplay;
            }
            (<any>display).createdHandler = new Handler(this, () => {
                const completeID = display.id;
                if (this.mDisplayLoadingMap.get(completeID)) {
                    this.mDisplayLoadingMap.delete(completeID);
                }
                const sprite = this.mDisplayModelMap.get(completeID);
                if (sprite) {
                    if (!sprite.pos) sprite.pos = new LogicPos(0, 0, 0);
                    display.titleMask = sprite.titleMask;
                    display.setPosition(sprite.pos.x, sprite.pos.y, sprite.pos.z);
                    display.checkCollision(sprite);
                    display.changeAlpha(sprite.alpha);
                }
                if (callBack) callBack(display);
                // 分帧处理会出现同一个资源被多个显示对象加载，可能在遍历未完成前就进入回调函数，index做下拦截
                if (index < len) return;
                if (this.mDisplayLoadingMap.size < 1) {
                    tmpList.forEach((tmpID) => {
                        if (this.mDisplayCacheMap.get(tmpID)) this.mDisplayCacheMap.delete(tmpID);
                    });
                    this.mLoading = false;
                }
            });
            index++;
            this.mDisplayLoadingMap.set(id, displayRes);
            tmpList.push(id);
            display.load(data, field);
        });
    }

    private updateModelProgress() {
        const len = this.mDisplayUpdateModelMap.size > this.dealLen ? this.dealLen : this.mDisplayUpdateModelMap.size;
        const tmpList = [];
        this.mDisplayUpdateModelMap.forEach((displayRes) => {
            const id = displayRes.id;
            const data = displayRes.data;
            const field = displayRes.field;
            const display: DragonbonesDisplay | FramesDisplay = this.displays.get(id) as DragonbonesDisplay | FramesDisplay;
            if (!display) return;
            tmpList.push(id);
            display.load(data, field);
        });
        tmpList.forEach((tmpID) => {
            if (this.mDisplayUpdateModelMap.get(tmpID)) this.mDisplayUpdateModelMap.delete(tmpID);
        });
        this.mLoading = false;
    }

    private updatePlayCacheProgress() {
        if (!this.mDisplayPlayCacheMap || this.mDisplayPlayCacheMap.size < 1) return;
        const tmpList = [];
        this.mDisplayPlayCacheMap.forEach((animationRes) => {
            const id = animationRes.id;
            const animation = animationRes.animation;
            const display = this.getDisplay(id);
            if (display) {
                display.play(animation);
                tmpList.push(id);
            }
        });
        tmpList.forEach((id) => {
            if (this.mDisplayPlayCacheMap.get(id)) this.mDisplayPlayCacheMap.delete(id);
        });
        this.mPlaying = false;
    }

    private updateInteracitveCacheProgress() {
        const tmpList = [];
        this.mInteracitveMap.forEach((data) => {
            const id = data.id;
            const interactive = data.interactive;
            const display = this.getDisplay(id);
            if (display) {
                interactive ? display.setInteractive() : display.disableInteractive();
                tmpList.push(id);
            }
        });
        tmpList.forEach((id) => {
            if (this.mInteracitveMap.get(id)) this.mInteracitveMap.delete(id);
        });
        this.mInteracitveBoo = false;
    }

    private updateShowName() {
        const tmpList = [];
        this.mNameMap.forEach((data) => {
            const id = data.id;
            const name = data.name;
            const display = this.getDisplay(id);
            if (display) {
                display.showNickname(name);
                tmpList.push(id);
            }
        });
        tmpList.forEach((id) => {
            if (this.mNameMap.get(id)) this.mNameMap.delete(id);
        });
        this.mInteracitveBoo = false;
    }

    private updateShowTop() {
        const tmpList = [];
        this.mTopDisMap.forEach((data) => {
            const id = data.id;
            const state = data.state;
            const display = this.getDisplay(id);
            if (display) {
                display.showTopDisplay(state);
                tmpList.push(id);
            }
        });
        tmpList.forEach((id) => {
            if (this.mTopDisMap.get(id)) this.mTopDisMap.delete(id);
        });
        this.mShowTop = false;
    }
}
