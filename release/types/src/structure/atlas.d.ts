export interface IFrame {
    filename: string;
    frame: {};
    rotated: boolean;
    trimmed: boolean;
    spriteSourceSize: {};
    sourceSize: {};
    pivot?: {};
}
export declare class Atlas {
    atlas: {};
    width: number;
    height: number;
    private frames;
    constructor();
    addFrame(name: string, rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    }): void;
    setFrame(frame: any): void;
    removeFrame(name: string): void;
    clearFrames(): void;
    setSize(w: number, h: number): void;
    toString(): string;
}
