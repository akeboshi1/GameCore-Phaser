import { Bodies, Body, Composite, Engine, World, Events } from "matter-js";
import { Pos } from "utils";
import { IRoomService } from "../room/room";
import { MatterObject } from "./matter.object";

export class MatterWorld {
    public readonly engine: Engine;
    public readonly localWorld: World;
    public enabled = true;
    public autoUpdate = true;
    private room: IRoomService;
    // private elements: Map<number, MatterObject>;

    private debugGraphics: Phaser.GameObjects.Graphics;
    constructor(room: IRoomService) {
        this.room = room;
        this.engine = Engine.create(undefined, { positionIterations: 8, velocityIterations: 10 });
        this.localWorld = this.engine.world;
        this.localWorld.gravity.x = 0;
        this.localWorld.gravity.y = 0;

        // this.debugGraphics = room.scene.make.graphics(undefined);
        // room.addToSceneUI(this.debugGraphics);

        // this.elements = new Map();

        // Events.on(this.engine, "collisionStart", (event) => {
            // const pairs = event.pairs;
            // for (const pair of pairs) {
            //     const bodyA = pair.bodyA,
            //           bodyB = pair.bodyB;
            //     if (bodyA.label === "User" && bodyB.label === "Element" || bodyB.label === "User" && bodyA.label === "Element") {
            //         // TODO
            //     }
            // }
        // });

        this.drawWall();
    }

    public update() {
        if (this.enabled && this.autoUpdate) {
            Engine.update(this.engine);
            if (!this.debugGraphics) {
                return;
            }
            this.debugGraphics.clear();
            const bodies = Composite.allBodies(this.localWorld);
            this.renderWireframes(bodies);
        }
    }

    public setSensor(body: Body, val: boolean) {
        if (!body) {
            return;
        }
        body.isSensor = val;
        const pairs = this.engine.pairs;
        const list = pairs.list;
        list.map((pair) => pair.isSensor = val);
        // Logger.getInstance().log(this.localWorld, this.enabled);
    }

    public add(body: Body | Body[], ele?: MatterObject) {
        if (!this.localWorld) {
            return;
        }
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

        // this.elements.delete(body.id);

        Composite.remove(this.localWorld, body, deep);
    }

    public drawWall() {
        if (!this.room) {
            return;
        }
        const size = this.room.roomSize;
        if (!size) {
            return;
        }
        const { rows, cols } = size;
        const dpr = this.room.game.scaleRatio;
        // const point1 = this.room.transformTo90(new Pos(0, 0));
        const transformTo90 = this.room.transformTo90.bind(this.room);
        const vertexSets = [transformTo90(new Pos(0, 0)), transformTo90(new Pos(cols, 0)), transformTo90(new Pos(cols, rows)), transformTo90(new Pos(0, rows))];
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
            walls[i] = Bodies.fromVertices(curVertex.x - (curVertex.x - nextBody.x >> 1), curVertex.y - (curVertex.y - nextBody.y >> 1), [[{ x: curVertex.x, y: curVertex.y }, { x: nextBody.x, y: nextBody.y }, { x: nextBody.x, y: nextBody.y - 1 }, { x: curVertex.x, y: curVertex.y - 1 }]], { isStatic: true });
        }

        walls.map((body) => {
            body.inertia = Infinity;
            body.inverseInertia = Infinity;
        });
        this.add(walls);
    }

    private renderWireframes(bodies: Body[]) {
        const graphics = this.debugGraphics;
        graphics.lineStyle(1, 0xFF0000);
        graphics.beginPath();
        for (const body of bodies) {
            if (!body.render.visible) {
                continue;
            }
            for (let k = (body.parts.length > 1) ? 1 : 0; k < body.parts.length; k++) {
                const part = body.parts[k];

                const vertLength = part.vertices.length;

                graphics.moveTo(part.vertices[0].x, part.vertices[0].y);

                for (let j = 1; j < vertLength; j++) {
                    // if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                        graphics.lineTo(part.vertices[j].x, part.vertices[j].y);
                    // }
                    // } else {
                    //     graphics.moveTo(part.vertices[j].x, part.vertices[j].y);
                    // }

                    // if (part.vertices[j].isInternal && !showInternalEdges) {
                        // graphics.moveTo(part.vertices[(j + 1) % vertLength].x, part.vertices[(j + 1) % vertLength].y);
                    // }
                }
                graphics.lineTo(part.vertices[0].x, part.vertices[0].y);
            }
        }

        graphics.strokePath();
    }
}