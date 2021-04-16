import { AnimationsNode, AttributeNode, ElementNode, EventNode, FunctionNode, LayerEnum, Lite } from "game-capsule";
import { BaseConfigData } from "gamecore";
import { IAnimation, IAnimationData } from "picaStructure";
import { IElementPi } from "src/pica/structure/ielementpi";
import { Logger } from "utils";
import { op_virtual_world, op_client, op_def } from "pixelpai_proto";
export class ElmentPiConfig extends BaseConfigData {

    public responseType: XMLHttpRequestResponseType = "arraybuffer";
    public elePiMap: Map<string, IElementPi> = new Map();
    public get(sn: string): IElementPi {
        if (this.elePiMap.has(sn)) {
            return this.elePiMap.get(sn);
        } else {
            Logger.getInstance().error(`elementpi表未配置ID为:${sn}的数据`);
            return undefined;
        }
    }
    public has(sn: string) {
        if (this.elePiMap.has(sn)) return true;
        else return false;
    }

    public parseJson(json) {
        const lite = this.decodeItem(json);
        if (!lite) return;
        const sprite = new Sprite(<any>lite.root.children[0]);
        const obj: IElementPi = <any>sprite.getSerializeForCxx();
        const animationData = this.extendAnimationData(obj.Animations);
        obj.animations = animationData;
        obj.animationDisplay = { texturePath: obj.texture_path, dataPath: obj.data_path };
        this.elePiMap.set(obj.sn, obj);
    }
    protected extendAnimationData(animations: IAnimation[]) {
        if (!animations) return;
        const aniData = [];
        for (const ani of animations) {
            ani.layers.forEach((value) => {
                value.frameName = value["frameNames"];
            });
            aniData.push(this.createAnimationData(ani));
        }
        return aniData;
    }

    protected createAnimationData(animation: IAnimation) {
        const obj: IAnimationData = {
            frame: animation.arrFrame,
            frameRate: animation.FrameRate,
            walkableArea: animation.WalkableArea,
            collisionArea: animation.CollisionArea,
            loop: animation.loop,
            originPoint: animation.arrPoint,
            walkOriginPoint: animation.arrwalkableOriginPoint,
            baseLoc: animation.BaseLoc,
            frameName: animation.arrFrameName,
            interactiveArea: animation.interactiveArea,
            frameDuration: animation.frameDurations,
            layer: animation.layers,
            mountLayer: animation.mountLayers,
            node: { name: animation.animation_name, id: 0 }
        };
        return obj;
    }
    private decodeItem(response) {
        const arraybuffer = response;
        if (arraybuffer) {
            try {
                const item = new Lite();
                item.deserialize(new Uint8Array(arraybuffer));
                Logger.getInstance().debug("Decode: ItemPi -> lite", item);
                return item;
            } catch (error) {
                Logger.getInstance().error("catch error", error);
            }
        } else {
            Logger.getInstance().error("reject error");
        }
        return undefined;
    }
}

export class Sprite {
    uiid: number;
    events: EventNode[];
    attrs: AttributeNode[];
    sn: string;
    dir: number;
    type: number = 3;
    scale: boolean = false;
    name: string;
    des: string = "";
    animationName: string;
    dataPath: string;
    texturePath: string;
    animations: AnimationsNode | any;
    layer: LayerEnum | undefined;

    constructor(element: ElementNode) {
        const sprite: op_client.ISprite = element.convertToSprite();
        const attributeNodes: AttributeNode[] = [];
        const events: EventNode[] = [];
        let uiid: number = 0;
        for (const child of element.children) {
            if (child.type === op_def.NodeType.AttributeType) {
                attributeNodes.push(child as AttributeNode);
            } else if (child.type === op_def.NodeType.EventType) {
                events.push(child as EventNode);
            } else if (child.type === op_def.NodeType.UIType) {
                uiid = child.id;
            }
        }
        this.sn = element.sn;
        this.dir = sprite.direction as number;
        this.name = sprite.nickname || "";
        this.animationName = sprite.currentAnimationName || "idle";
        this.dataPath = sprite.display?.dataPath || "";
        this.texturePath = sprite.display?.texturePath || "";
        this.animations = element.animations || [];

        this.uiid = uiid;
        this.events = events;
        this.attrs = attributeNodes;
        this.layer = element.layer;
    }

    getAnimationsSerializeForCxx(): any[] {
        const animations: any[] = [];

        for (const animation of this.animations.animationData) {
            const ani = animation.createProtocolObject();
            const layers = [];
            if (ani.layer) {
                for (const l of ani.layer) {
                    layers.push({ frameNames: l.frameName, frameVisible: l.frameVisible, offsetLoc: l.offsetLoc });
                }
            }

            const mountLayers = {
                index: ani.mountLayer?.index,
                mountPoints: ani.mountLayer?.mountPoint,
                frameVisible: ani.mountLayer?.frameVisible,
            };
            animations.push({
                animation_name: animation.name,
                FrameRate: ani.frameRate,
                WalkableArea: ani.walkableArea,
                CollisionArea: ani.collisionArea,
                BaseLoc: ani.baseLoc,
                arrFrameName: ani.frameName,
                arrFrame: ani.frame,
                arrPoint: ani.originPoint,
                arrwalkableOriginPoint: ani.walkOriginPoint,
                loop: ani.loop,
                interactiveArea: ani.interactiveArea,
                frameDurations: ani.frameDuration,
                layers,
                mountLayers
            });
        }

        return animations;
    }

    getAttrSerializeForCxx(): any[] {
        const attrs: any[] = [];
        for (const attr of this.attrs) {
            const a = {
                attrkey: attr.key,
                attrInt: attr.intVal,
                attrStr: attr.strVal,
                attrBool: attr.boolVal,
                attrMed: attr.media
            };
            attrs.push(a);
        }
        return attrs;
    }

    getEventSerializeForCxx(): any[] {
        const events: any = {};
        for (const event of this.events) {
            const eventName = op_def.GameEvent[event.eventName];
            const funcs: any[] = [];
            for (const func of event.children) {
                if (func.type === op_def.NodeType.FunctionType) {
                    funcs.push({
                        fileName: (func as FunctionNode).fileName,
                        funcName: (func as FunctionNode).funcName,
                    });
                }
            }
            events[eventName] = funcs;
        }
        return events;
    }

    public getSerializeForCxx() {
        return {
            sn: this.sn,
            dir: this.dir,
            type: this.type,
            name: this.name,
            des: this.des,
            animation_name: this.animationName,
            scale: this.scale,
            data_path: this.dataPath,
            texture_path: this.texturePath,
            Attributes: this.getAttrSerializeForCxx(),
            Animations: this.getAnimationsSerializeForCxx(),
            uiid: this.uiid,
            Funcs: this.getEventSerializeForCxx(),
            layer: this.layer
        };
    }

    public getSerializeForCxxString() {
        return JSON.stringify(this.getSerializeForCxx());
    }

}
