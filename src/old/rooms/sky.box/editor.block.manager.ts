import { BlockManager } from "./block.manager";
import { IScenery } from "./scenery";
import { IRoomService } from "../room";

export class EditorBlockManager extends BlockManager {
    constructor(scenery: IScenery, room: IRoomService) {
        super(scenery, room);
    }

    protected move() {
    }
}
