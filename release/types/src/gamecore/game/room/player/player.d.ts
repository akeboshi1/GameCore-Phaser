import { IElementManager } from "../element/element.manager";
import { IDragonbonesModel, IPos, ISprite } from "structure";
import { Element, IElement } from "../element/element";
export declare class Player extends Element implements IElement {
    get nodeType(): number;
    protected mOffsetY: number;
    constructor(sprite: ISprite, mElementManager: IElementManager);
    setModel(model: ISprite): Promise<any>;
    load(displayInfo: IDragonbonesModel, isUser?: boolean): Promise<any>;
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
