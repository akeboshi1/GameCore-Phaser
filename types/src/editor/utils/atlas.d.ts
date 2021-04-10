import IFrame from "./iframe";
export default class Atlas {
    atlas: {};
    private frames;
    constructor();
    addFrame(data: IFrame): void;
    setFrame(frame: any): void;
    removeFrame(name: string): void;
    clearFrames(): void;
    toString(): string;
}
