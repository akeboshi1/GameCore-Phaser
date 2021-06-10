import { IPos, IPosition45Obj } from "utils";
import { FramesDisplay } from "../display/frames/frames.display";
import { DragonbonesDisplay } from "../display/dragonbones/dragonbones.display";
import { DisplayField, ElementStateType, IScenery } from "structure";
import { Render } from "../render";
import { IFramesModel } from "structure";
import { IDragonbonesModel } from "structure";
import { RunningAnimation } from "structure";
import { op_def } from "pixelpai_proto";
import { IDisplayObject } from "../display";
export declare enum NodeType {
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
export declare class DisplayManager {
    protected render: Render;
    private sceneManager;
    private displays;
    private scenerys;
    private mUser;
    private matterBodies;
    private serverPosition;
    private preLoadList;
    private loading;
    private mModelCache;
    private mGridLayer;
    private uuid;
    constructor(render: Render);
    get user(): IDisplayObject;
    update(time: number, delta: number): void;
    resize(width: number, height: number): void;
    updateModel(id: number, data: IDragonbonesModel): void;
    addDragonbonesDisplay(id: number, data: IDragonbonesModel, layer: number, nodeType: NodeType): void;
    addUserDragonbonesDisplay(data: IDragonbonesModel, isUser: boolean, layer: number): DragonbonesDisplay;
    addTerrainDisplay(id: number, data: IFramesModel, layer: number): FramesDisplay;
    addFramesDisplay(id: number, data: IFramesModel, layer: number, field?: DisplayField): FramesDisplay;
    addToLayer(layerName: string, display: FramesDisplay | DragonbonesDisplay, index?: number): void;
    removeDisplay(displayID: number): void;
    addFillEffect(x: number, y: number, status: op_def.PathReachableStatus): void;
    load(displayID: number, data: any, field?: DisplayField): void;
    changeAlpha(displayID: number, val?: number): void;
    fadeIn(displayID: number): void;
    fadeOut(displayID: number): void;
    play(displayID: number, animation: RunningAnimation, field?: DisplayField, times?: number): void;
    mount(displayID: number, targetID: number, targetIndex?: number): void;
    unmount(displayID: number, targetID: number, pos?: IPos): void;
    addEffect(targetID: number, effectID: number, display: IFramesModel): void;
    removeEffect(targetID: number, displayID: number): void;
    showEffect(displayID: number): void;
    setModel(sprite: any): void;
    startFireMove(id: number, pos: any): void;
    addSkybox(scenery: IScenery): void;
    updateSkyboxState(state: any): void;
    removeSkybox(id: number): void;
    getDisplay(id: number): DragonbonesDisplay | FramesDisplay | undefined;
    displayDoMove(id: number, moveData: any): void;
    showNickname(id: number, name: string): any;
    showTopDisplay(id: number, state?: ElementStateType): void;
    showMatterDebug(bodies: any): void;
    hideMatterDebug(): void;
    drawServerPosition(x: number, y: number): void;
    hideServerPosition(): void;
    liftItem(id: number, display: any, animation: any): void;
    clearMount(id: number): void;
    throwElement(userId: number, targetId: number, display: any, animation: any): void;
    snapshot(): Promise<void>;
    destroy(): void;
    showGrids(size: IPosition45Obj, maps: number[][]): void;
    hideGrids(): void;
    private loadProgress;
}
