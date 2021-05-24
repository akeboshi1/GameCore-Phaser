/// <reference types="phaser" />
export declare class CheckboxGroup extends Phaser.Events.EventEmitter {
    private mList;
    private mSelectedButton;
    constructor();
    appendItem(item: any): this;
    appendItemAll(items: any[]): this;
    removeItem(item: any): this;
    selectIndex(index: number): this;
    select(item: any): void;
    reset(): void;
    destroy(): void;
    private onGameObjectUpHandler;
    get selectedIndex(): number;
}
