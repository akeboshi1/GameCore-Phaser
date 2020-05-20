import {EditorRoomService} from "../rooms/editor.room";

export enum BrushEnum {
    MOVE = "move",
    BRUSH = "brush",
    SELECT = "select",
    ERASER = "eraser",
    FILL = "FILL",
}

export class Brush {
    private mMode: BrushEnum = BrushEnum.SELECT;

    constructor(private mEditorRoom: EditorRoomService) {
    }
    set mode(mode: BrushEnum) {
        this.mMode = mode;
    }

    get mode(): BrushEnum {
        return this.mMode;
    }
}
