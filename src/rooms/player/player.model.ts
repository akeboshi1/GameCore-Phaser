import { Sprite } from "../element/sprite";
import { op_client} from "pixelpai_proto";
import { Pos } from "../../utils/pos";

export class PlayerModel extends Sprite {
    constructor(data: op_client.IActor) {
        super(data);
        this.mPos = new Pos(data.x, data.y, data.z);
        this.mAlpha = 1;
        this.mWalkableArea = data.walkableArea;
        this.mCollisionArea = data.collisionArea;
        this.mOriginPoint = data.originPoint;
        this.mWalkOriginPoint = data.walkOriginPoint;
        this.mPackage = data.package;
        this.mSceneId = data.sceneId;
        this.mUuid = data.uuid;
        this.mPlatformId = data.platformId;
    }
}
