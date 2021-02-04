export interface IElement {
    id: string;
    sn: string;
    itemId: string;
    name: string;
    nodeType: number;
    rarity: number;
    scale: boolean;
    serializeString: string;
    texture_path: string;
    type: number;
    Animations: IAnimation[];
    Attributes: string[];
    Funcs: object;
    animation_name: string;
    combine: number;
    data_path: string;
    des: string;
    dir: number;
    forge: number;
    grade: number;
    uiid: number;
}

export interface IAnimation {
    BaseLoc: string;
    CollisionArea: string;
    FrameRate: number;
    WalkableArea: string;
    animation_name: string;
    arrFrame: number[];
    arrFrameName: string[];
    arrPoint: number[];
    arrwalkableOriginPoint: number[];
    frameDurations: number[];
    interactiveArea: Array<{ x: number, y: number }>;
    layers: ILayer[];
    mountLayer: IMountLayer[];
    loop: boolean;
}

export interface ILayer {
    frameNames: string[];
    frameVisible: boolean[];
    offsetLoc: { x: number, y: number };
    name: string;
}
export interface IMountLayer {
    index: number;
    mountPoint?: Array<{ x: number, y: number }>;
    frameVisible?: number[];
}
export interface IAnimationData {
    node?: any;
    frame?: number[];
    frameRate?: number;
    walkableArea?: string;
    collisionArea?: string;
    loop?: boolean;
    originPoint?: number[];
    walkOriginPoint?: number[];
    baseLoc?: string;
    frameName?: string[];
    interactiveArea?: Array<{ x: number, y: number }>;
    mainInteractivePoints?: Array<{ x: number, y: number }>;
    frameDuration?: number[];
    layer?: ILayer[];
    mountLayer?: IMountLayer[];
}
