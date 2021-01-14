import { Bodies, Body, Composite, Engine, World } from "tooqingmatter-js";
import { PhysicalPeer } from "../../services/physical.worker";
import { ISizeChart } from "structure";
import { AStar, ChatCommandInterface, IPos, IPosition45Obj, Pos, Position45 } from "utils";
import { MatterObject } from "./matter.object";
import { MatterUserObject } from "./matter.user.object";

export class MatterWorld implements ChatCommandInterface, ISizeChart {
    public readonly engine: Engine;
    public readonly localWorld: World;
    public enabled = true;
    public autoUpdate = true;
    // public map: number[][];
    public matterUser: MatterUserObject;
    private mAstar: AStar;
    private drawBodies: boolean = false;
    private ignoreSensors?: Map<number, MatterObject>;
    private mSize: IPosition45Obj;
    private mMiniSize: IPosition45Obj;
    // private elements: Map<number, MatterObject>;

    constructor(private peer: PhysicalPeer) {
        this.engine = Engine.create(undefined, { positionIterations: 8, velocityIterations: 10 });
        this.localWorld = this.engine.world;
        this.localWorld.gravity.x = 0;
        this.localWorld.gravity.y = 0;
        this.ignoreSensors = new Map();
        this.mAstar = new AStar(this);
        this.drawWall();
    }

    public clear() {
        World.clear(this.engine.world, false);
        Engine.clear(this.engine);
    }

    public initAstar(map: any) {
        this.mAstar.init(map);
    }

    set size(size: IPosition45Obj) {
        this.mSize = size;
    }

    get size(): IPosition45Obj {
        return this.mSize;
    }

    set miniSize(size: IPosition45Obj) {
        this.mMiniSize = size;
    }

    get miniSize(): IPosition45Obj {
        return this.mMiniSize;
    }

    public update() {
        if (this.enabled && this.autoUpdate) {
            Engine.update(this.engine);
            if (!this.drawBodies) {
                return;
            }
            const bodies = Composite.allBodies(this.localWorld);
            this.renderWireframes(bodies);
        }
    }

    public setUser(user: MatterUserObject) {
        this.matterUser = user;
    }

    public findPath(targets: IPos[], targetId?: number, toReverse: boolean = false) {
        if (!targets || !this.matterUser) {
            return;
        }
        this.matterUser.findPath(targets, targetId, toReverse);
    }

    public getPath(startPos: IPos, targets: IPos[], toReverse: boolean = false): IPos[] {
        return this.mAstar.find(startPos, targets, toReverse);
    }

    // public tryMove() {
    //     const player = this.matterUser;
    //     if (!player) {
    //         return;
    //     }
    //     const moveData = player.moveData;
    //     const pos = moveData.posPath;
    //     if (!pos || pos.length < 0) {
    //         return;
    //     }

    //     const step = moveData.step || 0;
    //     if (step >= pos.length) {
    //         return;
    //     }

    //     const playerPosition = player.getPosition();
    //     // const position = op_def.PBPoint3f.create();
    //     // position.x = playerPosition.x;
    //     // position.y = playerPosition.y;

    //     if (pos[step] === undefined) {
    //         // Logger.getInstance().log("move error", pos, step);
    //         return;
    //     }
    //     // const nextPosition = op_def.PBPoint3f.create();
    //     // nextPosition.x = pos[step].x;
    //     // nextPosition.y = pos[step].y;

    //     this.peer.mainPeer.tryMove(playerPosition.x, playerPosition.y, pos[step].x, pos[step].y);
    // }

    public setSensor(body: Body, val: boolean) {
        if (!body) {
            return;
        }
        if (this.ignoreSensors.get(body.id)) {
            return;
        }
        body.isSensor = val;
        const pairs = this.engine.pairs;
        const list = pairs.list;
        list.map((pair: any) => {
            const bodyA = this.ignoreSensors.get(pair.bodyA.id);
            const bodyB = this.ignoreSensors.get(pair.bodyB.id);
            if (!bodyA && !bodyB) {
                pair.isSensor = val;
            }
        });
        // Logger.getInstance().log(this.localWorld, this.enabled);
    }

    public debugEnable() {
        this.drawBodies = true;
    }

    public debugDisable() {
        this.drawBodies = false;
        this.peer.render.hideMatterDebug();
    }

    public add(body: Body | Body[], ignoreSensor: boolean = false, ele?: MatterObject) {
        if (!this.localWorld) {
            return;
        }
        const bodys = [].concat(body);
        for (const b of bodys) {
            if (ignoreSensor) {
                this.ignoreSensors.set(b.id, b);
            }
        }
        // if (ignoreSensor) this.
        // const bodys = [].concat(body);
        // for (const b of bodys) {
        //     if (ele) this.elements.set(b.id, ele);
        // }
        World.add(this.localWorld, body);
    }

    public remove(object, deep?: boolean) {
        if (!this.localWorld) {
            return;
        }
        const body = (object.body) ? object.body : object;

        this.ignoreSensors.delete(body.id);

        // this.elements.delete(body.id);

        Composite.remove(this.localWorld, body, deep);
    }

    public async drawWall() {
        const size = await this.peer.mainPeer.getCurrentRoomSize();
        if (!size) {
            return;
        }
        const { rows, cols } = size;
        const dpr = await this.peer.mainPeer.getScaleRatio();
        const vertexSets = [Position45.transformTo90(new Pos(0, 0), size), Position45.transformTo90(new Pos(cols, 0), size), Position45.transformTo90(new Pos(cols, rows), size), Position45.transformTo90(new Pos(0, rows), size)];
        vertexSets.map((pos) => {
            pos.x *= dpr;
            pos.y *= dpr;
        });

        const walls = [];
        let nextBody = null;
        let curVertex = null;
        for (let i = 0; i < vertexSets.length; i++) {
            curVertex = vertexSets[i];
            nextBody = vertexSets[i + 1];
            if (!nextBody) nextBody = vertexSets[0];
            walls[i] = Bodies.fromVertices(curVertex.x - (curVertex.x - nextBody.x >> 1), curVertex.y - (curVertex.y - nextBody.y >> 1), [[{ x: curVertex.x, y: curVertex.y }, { x: nextBody.x, y: nextBody.y }, { x: nextBody.x, y: nextBody.y - 5 * dpr }, { x: curVertex.x, y: curVertex.y - 5 * dpr }]], { isStatic: true });
        }

        walls.map((body) => {
            body.inertia = Infinity;
            body.inverseInertia = Infinity;
        });
        this.add(walls);
    }

    public isWalkableAt(x: number, y: number) {
        return this.mAstar.isWalkableAt(x, y);
    }

    public setWalkableAt(x: number, y: number, val: boolean) {
        this.mAstar.setWalkableAt(y, x, val);
        // const map = this.map;
        // const value = map[x][y];
        // if (value === 0) {
        //     this.mAstar.setWalkableAt(y, x, false);
        // } else {
        //     this.mAstar.setWalkableAt(y, x, val);
        // }
    }

    public v() {
        this.debugEnable();
    }
    public q() {
        this.debugDisable();
    }

    private renderWireframes(bodies: Body[]) {
        const result = [];
        for (const body of bodies) {
            if (!body.render.visible) {
                continue;
            }
            result.push([]);
            for (let k = (body.parts.length > 1) ? 1 : 0; k < body.parts.length; k++) {
                const part = body.parts[k];

                const vertLength = part.vertices.length;
                result[result.length - 1].push(part.vertices);
                for (let i = 0; i < vertLength; i++) {
                    result[result.length - 1][i] = { x: part.vertices[i].x, y: part.vertices[i].y };
                }

                // graphics.moveTo(part.vertices[0].x, part.vertices[0].y);

                // for (let j = 1; j < vertLength; j++) {
                //     graphics.lineTo(part.vertices[j].x, part.vertices[j].y);
                // }
                // graphics.lineTo(part.vertices[0].x, part.vertices[0].y);
            }
        }
        this.peer.render.showMatterDebug(result);
        // Logger.getInstance().log("=====>>", result);
    }
}
