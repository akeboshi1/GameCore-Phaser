import { Sprite } from "baseGame";
import { op_client } from "pixelpai_proto";
export class PlayerModel extends Sprite {
    public inputMask: number;
    constructor(data: op_client.IActor) {
        super(data);
        this.alpha = 1;
        this.package = data.package;
        this.sceneId = data.sceneId;
        this.uuid = data.uuid;
        this.inputMask = data.inputMask;
        // this.platformId = data.platformId;
        this.setAnimationName("idle");
    }
}
