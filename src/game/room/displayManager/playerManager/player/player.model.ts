import { op_client} from "pixelpai_proto";
import { LogicPos } from "../../../../../utils/logic.pos";
import { Sprite } from "../../sprite/sprite";

export class PlayerModel extends Sprite {
    constructor(data: op_client.IActor) {
        super(data);
        this.mPos = new LogicPos(data.x, data.y, data.z);
        this.mAlpha = 1;
        this.mPackage = data.package;
        this.mSceneId = data.sceneId;
        this.mUuid = data.uuid;
        this.mPlatformId = data.platformId;
    }
}
