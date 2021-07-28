export interface IFrame {
    filename: string;
    frame: {};
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: {};
    sourceSize: {};
    pivot?: {};
}

export class Atlas {
    atlas: {};
    width: number = 0;
    height: number = 0;
    private frames: IFrame[];

    constructor() {
        this.frames = [];
        this.atlas = {frames: this.frames, size: {w: this.width, h: this.height}};
    }

    addFrame(name: string, rect: {x: number, y: number, width: number, height: number}) {
        this.frames.push({
            filename: name,
            frame: {x: rect.x, y: rect.y, w: rect.width, h: rect.height},
            rotated: false,
            trimmed: false,
            spriteSourceSize: {x: 0, y: 0, w: rect.width, h: rect.height},
            sourceSize: {w: rect.width, h: rect.height}
        });
    }

    setFrame(frame) {
        this.frames = frame;
        this.atlas = {frames: this.frames, size: {w: this.width, h: this.height}};
    }

    removeFrame(name: string) {
        this.frames[name] = null;
        delete this.frames[name];
    }

    clearFrames() {
        this.frames.length = 0;
    }

    setSize(w: number, h: number) {
        this.width = w;
        this.height = h;
        this.atlas = {frames: this.frames, size: {w: this.width, h: this.height}};
    }

    toString() {
        return JSON.stringify(this.atlas);
    }
}
