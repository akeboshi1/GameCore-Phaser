import {IRoomService} from "../room";
import {FramesDisplay} from "../display/frames.display";
import {DragonbonesDisplay} from "../display/dragonbones.display";
import {ReferenceArea} from "./reference.area";

export class ReferenceEffect {
    private mArea: ReferenceArea;
    constructor(private mScene: Phaser.Scene, private mRoomService: IRoomService) {
        // this.mArea = new ReferenceArea(this.mScene);
    }

    setElement(ele: FramesDisplay | DragonbonesDisplay) {

    }
}
