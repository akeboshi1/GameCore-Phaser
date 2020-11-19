import { op_client } from "pixelpai_proto";
import { LogicPos } from "utils";
import { Sprite } from "../display/sprite/sprite";

export class PlayerModel extends Sprite {
    constructor(data: op_client.IActor) {
        super(data);
        this.pos = new LogicPos(data.x, data.y, data.z);
        this.alpha = 1;
        this.package = data.package;
        this.sceneId = data.sceneId;
        this.uuid = data.uuid;
        this.platformId = data.platformId;
    }
}
