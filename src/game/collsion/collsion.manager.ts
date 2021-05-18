/*
 * @Author: your name
 * @Date: 2021-05-17 21:40:12
 * @LastEditTime: 2021-05-18 10:13:45
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /game-core/src/game/collsion/collsion.manager.ts
 */
import { IRoomService } from "../room";
import * as SAT from "sat";
import { LogicPos } from "utils";

export class CollsionManager {
    private debug: boolean = false;
    private borders: Map<number, SAT.Polygon> = new Map();

    constructor(private roomService: IRoomService) {
    }

    add(id: number, boder: SAT.Polygon) {
        this.borders.set(id, boder);
    }

    remove(id: number) {
        this.borders.delete(id);
    }

    collideObjects(body: SAT.Polygon): SAT.Response[] {
        const responses: SAT.Response[] = [];
        this.borders.forEach((border, key) => {
            if (border !== body) {
                const response = new SAT.Response();
                if (SAT.testPolygonPolygon(body, border, response)) {
                    responses.push(response);
                }
            }
        });
        return responses;
    }

    update(time: number, delta: number) {
        if (!this.debug) {
            return;
        }
        this.roomService.game.renderPeer.showMatterDebug(Array.from(this.borders.values()));
    }

    addWall() {
        const size = this.roomService.roomSize;
        const { rows, cols } = size;
        const vertexSets = [this.roomService.transformTo90(new LogicPos(0, 0)), this.roomService.transformTo90(new LogicPos(cols, 0)), this.roomService.transformTo90(new LogicPos(cols, rows)), this.roomService.transformTo90(new LogicPos(0, rows))];

        let nextBody = null;
        let curVertex = null;
        for (let i = 0; i < vertexSets.length; i++) {
            curVertex = vertexSets[i];
            nextBody = vertexSets[i + 1];
            if (!nextBody) nextBody = vertexSets[0];
            let offset = 5;
            if (i === 1 || i === 2) {
                offset = -5;
            }
            const polygon = new SAT.Polygon(new SAT.Vector(curVertex.x - curVertex.x, curVertex.y - curVertex.y), [
                new SAT.Vector(curVertex.x, curVertex.y),
                new SAT.Vector(nextBody.x, nextBody.y),
                new SAT.Vector(nextBody.x, nextBody.y - offset),
                new SAT.Vector(curVertex.x, curVertex.y - offset)
            ]);
            this.add(Math.random(), polygon);
        }
    }

    v() {
        this.debug = true;
    }

    q() {
        this.debug = false;
    }

    destroy() {
        this.borders.clear();
    }
}
