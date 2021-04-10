import IFrame from "./iframe";

export default class Atlas {
    atlas: {};
    private frames: IFrame[];
    constructor() {
        this.frames = [];
        this.atlas = { frames: this.frames };
    }

    addFrame(data: IFrame) {
        // this.frames[name] = data;
        this.frames.push(data);
    }

    setFrame(frame) {
        this.frames = frame;
        this.atlas = { frames: this.frames };
    }

    removeFrame(name: string) {
        this.frames[name] = null;
        delete this.frames[name];
    }

    clearFrames() {
        this.frames.length = 0;
    }

    toString() {
        return JSON.stringify(this.atlas);
    }
}
