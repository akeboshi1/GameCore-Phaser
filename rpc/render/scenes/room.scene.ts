import { BasicScene } from "./basic.scene";

export class RoomScene extends BasicScene {
    protected mRoom: any;

    public init(data: any) {
        if (data) {
            this.mRoom = data.room;
        }
    }

}
