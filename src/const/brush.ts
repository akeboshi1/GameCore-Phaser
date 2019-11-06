import {op_client} from "pixelpai_proto";
import {FramesModel, IFramesModel} from "../rooms/display/frames.model";
import {Animation} from "../rooms/display/animation";
import {Pos} from "../utils/pos";
import {EditorRoomService} from "../rooms/editor.room";
import {Logger} from "../utils/log";

export enum BrushEnum {
    MOVE = "move",
    BRUSH = "brush",
    SELECT = "select",
    ERASER = "eraser",
    FILL = "FILL",
}

export class Brush {
    private mMode: BrushEnum = BrushEnum.SELECT;
    private mAlignGrid: boolean = false;
    private mFrameModel: IFramesModel;

    constructor(private mEditorRoom: EditorRoomService) {
    }

    setMouseFollow(content: op_client.IOP_EDITOR_REQ_CLIENT_MOUSE_FOLLOW) {
        const anis = content.animation;
        this.mFrameModel = new FramesModel({ animations: {
            defaultAnimationName: anis.name,
            display: content.display,
            animationData: [new Animation(content.animation)]
        } });
    }

    transitionGrid(x: number, y: number, ) {
        const source = new Pos(x, y);
        const pos = this.mEditorRoom.transformToMini45(source);
        if (this.alignGrid === false) {
            return this.checkBound(pos, source);
        }

        return this.checkBound(pos);
    }

    checkBound(pos: Pos, source?: Pos) {
        const bound = new Pos(pos.x, pos.y);
        const size = this.mEditorRoom.miniSize;
        if (pos.x < 0) {
            bound.x = 0;
        } else if (pos.x > size.rows) {
            bound.x = size.rows;
        }

        if (pos.y < 0) {
            bound.y = 0;
        } else if (pos.y > size.cols) {
            bound.y = size.cols;
        }
        if (bound.equal(pos) && source) {
            return source;
        }
        return this.mEditorRoom.transformToMini90(bound);
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
