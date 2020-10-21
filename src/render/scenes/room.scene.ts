import { BasicScene } from "./basic.scene";

export class RoomScene extends BasicScene {
    protected mRoomID: any;

    public init(data: any) {
        super.init(data);
        if (data) {
            this.mRoomID = data.roomid;
        }
    }

}
