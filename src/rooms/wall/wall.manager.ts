import { IRoomService } from "../room";
import { Wall, Direction } from "./wall";
import { PacketHandler, PBpacket } from "net-socket-packet";
import { op_client } from "pixelpai_proto";
import { Pos } from "../../utils/pos";
import { Logger } from "../../utils/log";
export class WallManager extends PacketHandler {
    private mWalls: Map<number, Wall> = new Map<number, Wall>();
    constructor(protected mRoom: IRoomService) {
        super();

        // if (this.mRoom.connection) {
        //     this.mRoom.connection.addPacketListener(this);
        //     this.addHandlerFun(op_client.OPCODE._OP_VIRTUAL_WORLD_REQ_CLIENT_ADD_SPRITE_END, this.onDawWallHandler);
        // }
    }

    destroy() {
        if (this.mRoom.connection) {
            this.mRoom.connection.removePacketListener(this);
        }
        this.mWalls.forEach((wall: Wall) => wall.destroy());
        this.mWalls.clear();
    }

    protected _add(x: number, y: number, dir: Direction) {
        const pos = this.mRoom.transformTo90(new Pos(x, y));
        const wall = new Wall(this.mRoom, x * 1000000 + y * 1000, pos, dir);
        // wall.setPosition(pos);
    }

    private onDawWallHandler(packet: PBpacket) {
        const terrains = this.mRoom.world.elementStorage.getTerrainCollection();
        if (!terrains) {
            return;
        }
        const tmp = this.mRoom.world.getConfig().game_id.split(".");
        if (tmp.length < 2) {
            return;
        }
        if (tmp[1] !== "5e410ba50681ad5557b4d6e9") {
            return;
        }
        const map = terrains.data;
        for (let i = 0; i < map.length; i++) {
            for (let j = 0; j < map[0].length; j++) {
                if (map[i][j] === 0) {
                    continue;
                }
                if (this.isUp(i, j, map)) {
                    this._add(i, j, Direction.UP);
                } else if (this.isLeft(i, j, map)) {
                    this._add(i, j, Direction.RIGHT);
                } else if (this.isRight(i, j, map)) {
                    // if (lastW < j) {
                    //   i++;
                    //   break;
                    // }
                    this._add(i, j, Direction.LEFT);
                } else if (this.isDown(i, j, map)) {
                    this._add(i, j, Direction.DOWN);
                }
                // lastW = j;
                // break;
            }
        }
    }

    private isUp(rows: number, cols: number, map: number[][]) {
        if (rows === 0) {
            if (cols === 0) {
                return true;
            } else if (map[rows][cols - 1] === 0) {
                return true;
            }
            return false;
        } else if (cols === 0) {
            if (rows === 0) {
                return true;
            } else if (map[rows - 1][cols] === 0) {
                return true;
            }
            return false;
        }
        if (map[rows - 1][cols] === 0 && map[rows][cols - 1] === 0) {
            return true;
        }
        return false;
    }

    private isLeft(rows: number, cols: number, map: number[][]) {
        if (cols === 0) {
            if (rows > 0) {
                return true;
            }
        } else if (rows > 0) {
            if (cols > 0 && map[rows][cols - 1] === 0) {
                return true;
            }
        }
    }

    private isRight(rows: number, cols: number, map: number[][]) {
        if (rows === 0) {
            if (cols > 0) {
                return true;
            }
        } else if (cols > 0) {
            if (rows > 0 && map[rows - 1][cols] === 0) {
                return true;
            }
        }
    }

    private isDown(rows: number, cols: number, map: number[][]) {
        if (rows > 0 && cols > 0) {
            if (map[rows - 1][cols - 1] === 0 && map[rows - 1][cols] !== 0 && map[rows][cols - 1] !== 0) {
                return true;
            }
        }
    }
}
