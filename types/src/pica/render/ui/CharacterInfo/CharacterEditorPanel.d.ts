export declare class CharacterEditorPanel extends Phaser.GameObjects.Container {
    private title;
    private inputText;
    private idText;
    private constellationText;
    private birthdayText;
    private cityText;
    private signInput;
    private dpr;
    private key;
    constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, key: string, dpr: number);
    destroy(): void;
    private createText;
    private geti18n;
    private createLine;
    private onBackHandler;
    private onSaveHandler;
}
