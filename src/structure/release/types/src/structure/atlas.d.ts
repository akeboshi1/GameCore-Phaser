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
    toString(): string;
}
