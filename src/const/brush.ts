import {op_client} from "pixelpai_proto";
import {FramesModel, IFramesModel} from "../rooms/display/frames.model";
import {Animation} from "../rooms/display/animation";

export enum BrushEnum {
    MOVE = "move",
    BRUSH = "brush",
    SELECT = "select",
    ERASER = "eraser",
    FILL = "FILL",
}

export class Brush {
    private mMode: BrushEnum = BrushEnum.BRUSH;
    private mAlignGrid: boolean = false;
    private mFrameModel: IFramesModel;

    setMouseFollow(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW) {
        const anis = content.animation;
        this.mFrameModel = new FramesModel({ animations: {
            defaultAnimationName: anis.name,
            display: content.display,
            animationData: [new Animation(content.animation)]
        } });
    }

    get frameModel(): IFramesModel {
        return this.mFrameModel;
    }

    set mode(mode: BrushEnum) {
        this.mMode = mode;
    }

    get mode(): BrushEnum {
        return this.mMode;
    }

    set alignGrid(val: boolean) {
        this.mAlignGrid = val;
    }

    get alignGrid(): boolean {
        return this.mAlignGrid;
    }
}
