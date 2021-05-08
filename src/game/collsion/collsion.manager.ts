import { IRoomService } from "../room";
import * as SAT from "sat";

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

    public v() {
        this.debug = true;
    }
    public q() {
        this.debug = false;
    }

    destroy() {
        this.borders.clear();
    }
}
