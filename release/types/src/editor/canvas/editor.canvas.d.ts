/// <reference types="tooqingphaser" />
export interface IEditorCanvasConfig {
    width: number;
    height: number;
    node?: {};
    connection?: any;
    game_id?: string;
    game_created?: () => void;
    LOCAL_HOME_PATH?: string;
    parent?: string;
    osd?: string;
    api_root?: string;
    server_addr?: {
        host: string;
        port: number;
        secure: boolean;
    };
}
export declare class EditorCanvas {
    protected mGame: Phaser.Game | undefined;
    protected mConfig: IEditorCanvasConfig;
    protected mEmitter: Phaser.Events.EventEmitter;
    constructor(config: IEditorCanvasConfig);
    resize(width: number, height: number): void;
    enableClick(): void;
    disableClick(): void;
    destroy(): void;
}
