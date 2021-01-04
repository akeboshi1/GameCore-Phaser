import { Bodies } from "matter-js";
import { MAIN_WORKER, PHYSICAL_WORKER, RENDER_PEER } from "structure";
import { Export, RPCPeer, webworker_rpc } from "webworker-rpc";
import { IMatterObject, MatterObject } from "./physical/matter.object";
import { MatterWorld } from "./physical/matter.world";
import decomp from "poly-decomp";
import { MatterUserObject } from "./physical/matter.user.object";
import { EventDispatcher, IPos, LogicPos } from "utils";
// The World act as the global Phaser.World instance;
// @ts-ignore
global.decomp = decomp;

export const fps: number = 45;
export const delayTime = 1000 / fps;
export class PhysicalPeer extends RPCPeer {
    public scaleRatio: number;
    protected currentTime: number = 0;
    protected mWorkerLoop: any;
    protected mEmitter: EventDispatcher;
    private matterWorld: MatterWorld;
    private matterObjectMap: Map<number, IMatterObject>;
    constructor() {
        super(PHYSICAL_WORKER);
        this.matterObjectMap = new Map();
        this.mEmitter = new EventDispatcher();
    }

    get world(): MatterWorld {
        return this.matterWorld;
    }

    get emitter(): EventDispatcher {
        return this.mEmitter;
    }

    getMatterObj(id: number): IMatterObject {
        return this.matterObjectMap.get(id);
    }

    public run(): Promise<any> {
        return new Promise<any>((resolve) => {
            this.currentTime = new Date().getTime();
            const self = this;
            this.mWorkerLoop = setInterval(() => {
                resolve(new Date().getTime() - self.currentTime);
                clearInterval(self.mWorkerLoop);
            }, delayTime);
        });
    }

    public async update() {
        let now: number = 0;
        let tmpTime: number = new Date().getTime();
        for (; ;) {
            await this.run();
            now = new Date().getTime();
            let delay = now - tmpTime;
            if (delay < delayTime) delay = delayTime;
            if (this.matterWorld) {
                this.matterWorld.update();
                if (this.matterWorld.matterUser) this.matterWorld.matterUser.update(now, delay);
            }
            tmpTime = now;
        }
    }

    get mainPeer() {
        return this.remote[MAIN_WORKER].MainPeer;
    }

    get render() {
        return this.remote[RENDER_PEER].Render;
    }

    @Export()
    public start() {
        this.update();
    }

    @Export([webworker_rpc.ParamType.str])
    public renderEmitter(eventType: string, data?: any) {
        this.mEmitter.emit(eventType, data);
    }

    @Export()
    public initAstar(map: any) {
        this.matterWorld.initAstar(map);
    }

    @Export()
    public setRoomSize(size: any) {
        this.matterWorld.size = size;
    }

    @Export()
    public setMiniRoomSize(size: any) {
        this.matterWorld.miniSize = size;
    }

    @Export([webworker_rpc.ParamType.num])
    public setScaleRatio(scaleRatio: number) {
        this.scaleRatio = scaleRatio;
    }

    @Export()
    public createMatterWorld() {
        if (!this.matterWorld) {
            this.matterWorld = new MatterWorld(this);
        }
        this.exportProperty(this.matterWorld, this).onceReady(() => {
        });
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public setElementWalkable(x: number, y: number, boo: boolean) {
        this.matterWorld.setElementWalkable(x, y, boo);
    }

    // @Export()
    // public createMap(map: any) {
    //     if (this.matterWorld) this.matterWorld.createMap(map);
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public addToMap(id: number) {
    //     const obj = this.matterObjectMap.get(id);
    //     if (!obj) {
    //         return;
    //     }
    //     this.matterWorld.addToMap(obj.model);
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public removeFromMap(id: number) {
    //     const obj = this.matterObjectMap.get(id);
    //     if (!obj) {
    //         return;
    //     }
    //     this.matterWorld.removeFromMap(obj.model);
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public setMatterWorld(id: number) {
    //     let obj = this.matterObjectMap.get(id);
    //     if (!obj) {
    //         obj = new MatterObject(this, id);
    //         this.matterObjectMap.set(id, obj);
    //     }
    //     obj.setMatterWorld(this.matterWorld);
    // }

    @Export()
    public startMove() {
        this.matterWorld.matterUser.startMove();
    }

    @Export()
    public stopMove() {
        this.matterWorld.matterUser.stopMove();
    }

    @Export()
    public debugEnable() {
        this.matterWorld.debugEnable();
    }

    @Export()
    public debugDisable() {
        this.matterWorld.debugDisable();
    }

    // render通知physical移动
    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public moveMotion(worldX: number, worldY: number, id?: number) {
        const matterUser = this.matterWorld.matterUser;
        if (!matterUser) {
            return;
        }
        matterUser.moveMotion(worldX, worldY);
    }

    @Export()
    public findPath(startPos: IPos, targets: [], targetId?: number, toReverse: boolean = false) {
        this.matterWorld.findPath(startPos, targets, targetId, toReverse);
    }

    @Export()
    public getPath(startPos: IPos, targetPosList: IPos[], toReverse: boolean) {
        return this.matterWorld.getPath(startPos, targetPosList, toReverse);
    }

    // @Export()
    // public tryMove() {
    //     this.world.tryMove();
    // }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public isWalkableAt(x: number, y: number): any {
        return this.matterWorld.isWalkableAt(x, y);
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public setTerrainWalkable(x: number, y: number, val: boolean) {
        this.matterWorld.setWalkableAt(x, y, val);
    }

    @Export()
    public updateModel(model: any) {
        const id = model.id;
        const obj = this.matterObjectMap.get(id);
        if (!obj) return;
        obj.updateModel(model);
    }

    @Export()
    public updateAnimations(displayInfo: any) {
        const id = displayInfo.id;
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.updateAnimations(displayInfo);
    }

    @Export([webworker_rpc.ParamType.num])
    public createMatterObject(id) {
        if (this.matterObjectMap.get(id)) return;
        const obj = new MatterObject(this, id);
        this.matterObjectMap.set(id, obj);
    }

    @Export([webworker_rpc.ParamType.num])
    public createMatterUserObject(id) {
        if (this.matterObjectMap.get(id)) return;
        const obj = new MatterUserObject(this, id);
        this.matterObjectMap.set(id, obj);
        this.matterWorld.setUser(obj);
    }

    @Export([webworker_rpc.ParamType.num])
    public async getInteractivePosition(id: number) {
        const ele = this.getMatterObj(id);
        if (ele) {
            return await ele.getInteractivePositionList();
        }
        return null;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.str])
    public changePlayerState(id: number, state: string, times?: number) {
        const dragonbones = this.getMatterObj(id);
        if (dragonbones) dragonbones.changeState(state, times);
    }

    @Export([webworker_rpc.ParamType.num])
    public move(id: number, path?: any) {
        const dragonbones = this.getMatterObj(id);
        if (dragonbones) dragonbones.move(path);
    }

    @Export()
    public setModel(sprite: any) {
        const id = sprite.id;
        const obj = this.matterObjectMap.get(id);
        if (obj) {
            obj.setModel(sprite);
        }
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public setStatic(id: number, val: boolean) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setStatic(val);
    }

    @Export([webworker_rpc.ParamType.num])
    public applyForce(id: number, force: any) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.applyForce(force);
    }

    @Export([webworker_rpc.ParamType.num])
    public setVelocityX(id: number) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setVelocityX();
    }

    @Export([webworker_rpc.ParamType.num])
    public setVelocityY(id: number) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setVelocityY();
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setVelocity(id: number, x: number, y: number) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setVelocity(x, y);
    }

    @Export([webworker_rpc.ParamType.num])
    public setOffset(id: number, val: any) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj._offset.x = val.x;
        obj._offset.y = val.y;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public setPosition(id: number, x: number, y: number, z?: number) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setPosition({ x, y, z }, false);
    }

    @Export([webworker_rpc.ParamType.num])
    public destroyMatterObject(id: number) {
        const obj = this.matterObjectMap.get(id);
        if (!obj) return;
        obj.destroy();
    }

    @Export([webworker_rpc.ParamType.num])
    public setBody(id: number) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setBody(this.scaleRatio);
    }

    @Export([webworker_rpc.ParamType.num])
    public addBody(id: number, sensor: boolean = false) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj._sensor = sensor;
        obj.addBody(this.scaleRatio);
    }

    @Export([webworker_rpc.ParamType.num])
    public removeBody(id: number) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.removeBody();
    }

    @Export([webworker_rpc.ParamType.num])
    public setVertices(id: number, vertexSets: any) {
        let obj = this.matterObjectMap.get(id);
        if (!obj) {
            obj = new MatterObject(this, id);
            this.matterObjectMap.set(id, obj);
        }
        obj.setVertices(vertexSets);
    }

    // @Export([webworker_rpc.ParamType.num])
    // public getBody(id: number) {
    //     const obj: MatterObject = this.matterObjectMap(id);
    //     if (!obj) return null;
    //     return obj.body;
    // }

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public mount(id: number, eleId: number, index: number) {
    //     const obj = this.matterObjectMap.get(id);
    //     if (!obj) return;
    //     const ele = this.matterObjectMap.get(eleId);
    //     if (!ele) return;
    //     obj.mount(ele, index);
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public unmount(id: number) {
    //     const obj = this.matterObjectMap.get(id);
    //     if (!obj) return;
    //     obj.unmount();
    // }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public addMount() {

    }

    // @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    // public removeMount(id: number, eleId: number) {
    //     const obj = this.matterObjectMap.get(id);
    //     if (!obj) return;
    //     const ele = this.matterObjectMap.get(eleId);
    //     if (!ele) return;
    //     obj.removeMount(ele);
    // }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.boolean])
    public setSensor(id: number, boo: boolean) {
        const obj = this.matterObjectMap.get(id);
        if (!obj) return;
        this.matterWorld.setSensor(obj.body, boo);
    }

    @Export([webworker_rpc.ParamType.num])
    public positionPrev(id: number) {
        const obj = this.matterObjectMap.get(id);
        if (!obj) return;
        // tslint:disable-next-line:no-console
        // console.log("positionPrev====", obj.body.positionPrev);
        return (<any>obj.body).positionPrev;
    }

    @Export([webworker_rpc.ParamType.num])
    public position(id: number) {
        const obj = this.matterObjectMap.get(id);
        if (!obj) return;
        // tslint:disable-next-line:no-console
        // console.log("position====", obj.body.position);
        return obj.body.position;
    }

    @Export([webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
    public createBodyFromVertices(id: number, x: number, y: number, paths: any, addToWorld?: boolean, param?: any) {
        const obj: IMatterObject = this.matterObjectMap.get(id);
        if (!obj) return;
        const body = Bodies.fromVertices(x, y, paths, param);
        obj.setExistingBody(body, addToWorld);
    }

    // @Export([webworker_rpc.ParamType.num])
    // public completeDragonBonesAnimationQueue(id: number) {
    //     const dragonbones = this.matterObjectMap.get(id);
    //     if (dragonbones) dragonbones.completeAnimationQueue();
    // }

    // @Export([webworker_rpc.ParamType.num])
    // public completeFrameAnimationQueue(id: number) {
    //     const frames = this.matterObjectMap.get(id);
    //     if (frames) frames.completeAnimationQueue();
    // }
}
const context: PhysicalPeer = new PhysicalPeer();
