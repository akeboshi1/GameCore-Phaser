export interface IEditorCanvasConfig {
    width: number;
    height: number;
    node: {};
    connection: any;
    game_created: () => void;
    LOCAL_HOME_PATH?: string;
    parent?: string;
    osd?: string;
}
export declare class EditorCanvas {
    protected mGame: Phaser.Game | undefined;
    protected mConfig: IEditorCanvasConfig;
    protected mEmitter: Phaser.Events.EventEmitter;
    constructor(config: IEditorCanvasConfig);
    resize(width: number, height: number): void;
    destroy(): void;
}
