import { IElementManager } from "../element/element.manager";
import { IPos, ISprite } from "structure";
import { Element, IElement } from "../element/element";
export declare class Player extends Element implements IElement {
    protected mElementManager: IElementManager;
    protected nodeType: number;
    protected mOffsetY: number;
    constructor(sprite: ISprite, mElementManager: IElementManager);
    setModel(model: ISprite): Promise<any>;
    changeState(val?: string, times?: number): void;
    stopMove(points?: any): void;
    completeMove(): void;
    setWeapon(weaponid: string): void;
    removeWeapon(): void;
    addToWalkableMap(): void;
    removeFromWalkableMap(): void;
    calcDirection(pos: IPos, target: IPos): void;
    protected checkDirection(): void;
    protected get offsetY(): number;
    protected addBody(): void;
    protected drawBody(): void;
    private mCheckStateHandle;
}
