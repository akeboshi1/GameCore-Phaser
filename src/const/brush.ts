export enum BrushEnum {
    MOVE = "move",
    BRUSH = "brush",
    SELECT = "select",
    ERASER = "eraser",
    FILL = "FILL",
}

export class Brush {
    private mMode: BrushEnum = BrushEnum.BRUSH;

    set mode(mode: BrushEnum) {
        this.mMode = mode;
    }

    get mode(): BrushEnum {
        return this.mMode;
    }
}
