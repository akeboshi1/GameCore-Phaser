import { IRoomService } from "../room";
import { MoveControll } from "./move.controll";
import * as SAT from "sat";

export class CollsionManager {
    private borders: Map<number, MoveControll> = new Map();

    constructor(private roomService: IRoomService) {
    }

    add(id: number, boder: MoveControll) {
        this.borders.set(id, boder);
    }

    remove(id: number) {
        this.borders.delete(id);
    }

    collideObjects(body: MoveControll): SAT.Response[] {
        const responses: SAT.Response[] = [];
        this.borders.forEach((border) => {
            if (border !== body) {
                const response = new SAT.Response();
                if (SAT.testPolygonPolygon(<SAT.Polygon>body.bodies, <SAT.Polygon>border.bodies, response)) {
                    responses.push(response);
                }
            }
        });
        return responses;
    }

    destroy() {
        this.borders.clear();
    }
}
