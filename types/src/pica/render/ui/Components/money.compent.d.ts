import { Handler } from "utils";
export declare class MoneyCompent extends Phaser.GameObjects.Container {
    money: number;
    diamond: number;
    private dpr;
    private zoom;
    private moneyvalue;
    private diamondvalue;
    private moneyAddBtn;
    private send;
    constructor(scene: Phaser.Scene, width: number, height: number, dpr: number, zoom: number);
    setHandler(send: Handler): void;
    setMoneyData(money: number, diamond: number): void;
    protected create(): void;
    private onRechargeHandler;
}
