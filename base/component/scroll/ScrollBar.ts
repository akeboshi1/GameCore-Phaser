import "phaser-ce";
import { UI } from "../../../Assets";
import { NiceSliceButton } from "../button/NiceSliceButton";
import { Rectangle, TileSprite } from "phaser-ce";

export class ScrollBar {
    protected game: Phaser.Game;
    protected target: PIXI.DisplayObjectContainer;
    protected parent: PIXI.DisplayObjectContainer;
    protected _x: number;
    protected _y: number;
    protected _w: number;
    protected _h: number;
    private dragging: boolean;
    private pressedDown: boolean;
    private timestamp: number;
    private targetX: number;
    private targetY: number;
    private autoScrollX: boolean;
    private autoScrollY: boolean;
    private inputX: number;
    private inputY: number;
    private startX: number;
    private startY: number;
    private velocityX: number;
    private velocityY: number;
    private amplitudeX: number;
    private amplitudeY: number;
    private directionWheel: number;
    private velocityWheelX: number;
    private velocityWheelY: number;
    private startedInside: boolean;
    private allowScrollStopOnTouch: boolean;
    private scrollTween: Phaser.Tween;
    private now: number;
    private settings = {
        kineticMovement: false,
        timeConstantScroll: 325, //really mimic iOS
        horizontalScroll: false,
        verticalScroll: true,
        horizontalWheel: false,
        verticalWheel: true,
        deltaWheel: 40,
        clickXThreshold: 5,
        clickYThreshold: 5,
        offsetX: 0,
        offsetY: 0
    };
    private velocityWheelXAbs: number;
    private velocityWheelYAbs: number;
    private elapsed: number;

    private slideSize: Phaser.Rectangle;
    private slider: Phaser.Sprite;
    private slideTarget: any;
    private slideLine: Phaser.Graphics;
    private slideButton: Phaser.Graphics;
    private slideNineButton: NiceSliceButton;

    constructor(game: Phaser.Game, target: PIXI.DisplayObjectContainer, parent: PIXI.DisplayObjectContainer, rect: Phaser.Rectangle, slideSize?: Phaser.Rectangle, params?: any, ) {
        this.game = game;
        this.target = target;
        this.parent = parent;
        this._x = rect.x;
        this._y = rect.y;
        this._w = rect.width;
        this._h = rect.height;
        this.slideSize = slideSize;
        if (params) {
            this.configure(params);
        }
        this.init();
    }

    private _maskGraphics: Phaser.Graphics;

    public get maskGraphics(): Phaser.Graphics {
        return this._maskGraphics;
    }

    public configure(options: any): void {
        if (options) {
            for (let property in options) {
                if (this.settings.hasOwnProperty(property)) {
                    this.settings[property] = options[property];
                }
            }
        }
    }

    public start(): void {
        if (this.game && this.game.input) {
            this.game.input.onDown.add(this.beginMove, this);
            this.game.input.addMoveCallback(this.moveCanvas, this);
            this.game.input.onUp.add(this.endMove, this);
            this.game.input.mouse.mouseWheelCallback = this.mouseWheel.bind(this);
        }
    }

    public stop(): void {
        if (this.game && this.game.input) {
            this.game.input.onDown.remove(this.beginMove, this);

            this.game.input.deleteMoveCallback(this.moveCanvas, this);

            this.game.input.onUp.remove(this.endMove, this);

            this.game.input.mouse.mouseWheelCallback = null;
        }
    }

    public update(): void {
        this.elapsed = Date.now() - this.timestamp;
        this.velocityWheelXAbs = Math.abs(this.velocityWheelX);
        this.velocityWheelYAbs = Math.abs(this.velocityWheelY);

        if (this.autoScrollX && this.amplitudeX !== 0) {
            let delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
            if (delta > 0.5 || delta < -0.5) {
                this.target.x = this.targetX + delta;
            }
            else {
                this.autoScrollX = false;
                //this.x = -this.targetX;
            }
        }

        if (this.autoScrollY && this.amplitudeY !== 0) {

            let delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
            if (delta > 0.5 || delta < -0.5) {
                this.target.y = this.targetY + delta;
            }
            else {
                this.autoScrollY = false;
                //this.y = -this.targetY;
            }
        }

        if (!this.autoScrollX && !this.autoScrollY) {
            this.dragging = false;
        }

        if (this.settings.horizontalWheel && this.velocityWheelXAbs > 0.1) {
            this.dragging = true;
            this.amplitudeX = 0;
            this.autoScrollX = false;
            this.target.x += this.velocityWheelX;
            this.velocityWheelX *= 0.95;
        }

        if (this.settings.verticalWheel && this.velocityWheelYAbs > 0.1) {
            this.dragging = true;
            this.autoScrollY = false;
            this.target.y += this.velocityWheelY;
            this.updateSlide();
            this.velocityWheelY *= 0.95;
        }

        this.limitMovement();
    }

    public setPosition(position: Phaser.Point) {
        if (position.x) {
            this.target.x += position.x - this._x;
            // this.maskGraphics.x = this._x = position.x;
        }
        if (position.y) {
            this.target.y += position.y - this._y;
            this.updateSlide();
            this.judgeBoundary();
            // this.maskGraphics.y = this._y = position.y;
        }
    }

    protected init(): void {
        if (this._maskGraphics) {
            this.parent.removeChild(this._maskGraphics);
            this._maskGraphics.destroy();
            this._maskGraphics = null;
        }
        this._maskGraphics = this.game.make.graphics(0, 0);
        this._maskGraphics.beginFill(0x00ffff, 0.2);
        this._maskGraphics.drawRect(this._x, this._y, this._w, this._h);
        this._maskGraphics.endFill();
        this.parent.addChild(this._maskGraphics);
        // this._maskGraphics.inputEnabled = true;
        this.target.mask = this._maskGraphics;

        this.slideSize = new Phaser.Rectangle(this._x + this._w, this._y, this._x + this._w, this._y + this._h);

        if (this.slideLine) {
            this.slideLine.clear();
            this.parent.removeChild(this.slideLine);
            this.slideLine = null;
        }
        this.slideLine = this.game.make.graphics();
        this.slideLine.clear();
        this.slideLine.lineStyle(2, 0x808080);
        this.slideLine.moveTo(this.slideSize.x + 10,  this.slideSize.y);
        this.slideLine.lineTo(this.slideSize.width + 10, this.slideSize.height);
        this.parent.addChild(this.slideLine);

        this.makeSlide();

        this.dragging = false;
        this.pressedDown = false;
        this.timestamp = 0;

        this.targetX = 0;
        this.targetY = 0;

        this.autoScrollX = false;
        this.autoScrollY = false;

        this.inputX = 0;
        this.inputY = 0;

        this.startX = 0;
        this.startY = 0;

        this.velocityX = 0;
        this.velocityY = 0;

        this.amplitudeX = 0;
        this.amplitudeY = 0;

        this.directionWheel = 0;

        this.velocityWheelX = 0;
        this.velocityWheelY = 0;
    }

    protected beginMove(target): void {
        if (this.slideTarget === "slide") {
            return;
        }
        if (this.allowScrollStopOnTouch && this.scrollTween) {
            this.scrollTween.pause();
        }
        console.log("target: ", target);

        if (this.game && this.game.input) {
            this.startedInside = true;

            this.startX = this.inputX = this.game.input.x;
            this.startY = this.inputY = this.game.input.y;
            this.pressedDown = true;
            this.timestamp = Date.now();
            this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
            this.slideTarget = "game";
            console.log("game");
        }
        else {
            this.startedInside = false;
        }
    }

    protected beginSlideMove() {
        if (this.slider) {
            this.startX = this.inputX = this.game.input.x;
            this.startY = this.inputY = this.game.input.y;

            this.startedInside = true;
            this.pressedDown = true;
            this.timestamp = Date.now();
            this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
            this.slideTarget = "slide";
            console.log("slide");
        }
    }

    protected moveCanvas(pointer: Phaser.Pointer, x: number, y: number): void {
        if (!this.pressedDown) return;
        console.log("target: ", this.slideTarget);
        this.now = Date.now();
        let elapsed = this.now - this.timestamp;
        this.timestamp = this.now;

        if (this.settings.horizontalScroll) {
            let delta = x - this.startX; //Compute move distance
            if (delta !== 0) this.dragging = true;
            this.startX = x;
            // console.log();
            this.velocityX = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityX;
            this.target.x += delta;
        }

        if (this.settings.verticalScroll) {
            let delta = y - this.startY; //Compute move distance
            if (delta !== 0) this.dragging = true;
            this.startY = y;
            this.velocityY = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityY;
            if (this.slideTarget === "game") {
                this.target.y += delta;
                this.updateSlide();
                this.judgeBoundary();
            } else {
                this.slider.y += delta;
                console.log("slider.y: ", this.slider.y, delta);
                this.updateTarget();
                this.judgeBoundary();
            }

            // this.slider.y += delta;
        }

        // this.limitMovement();
    }

    protected endMove(): void {
        if (this.startedInside) {
            this.pressedDown = false;
            this.autoScrollX = false;
            this.autoScrollY = false;

            if (!this.settings.kineticMovement) return;

            this.now = Date.now();

            if (this.game.input.activePointer.withinGame) {
                if (this.velocityX > 10 || this.velocityX < -10) {
                    this.amplitudeX = 0.8 * this.velocityX;
                    this.targetX = Math.round(this.target.x + this.amplitudeX);
                    this.autoScrollX = true;
                }

                if (this.velocityY > 10 || this.velocityY < -10) {
                    this.amplitudeY = 0.8 * this.velocityY;
                    this.targetY = Math.round(this.target.y + this.amplitudeY);
                    this.autoScrollY = true;
                }
            }
            if (!this.game.input.activePointer.withinGame) {
                this.velocityWheelXAbs = Math.abs(this.velocityWheelX);
                this.velocityWheelYAbs = Math.abs(this.velocityWheelY);
                if (this.settings.horizontalScroll && (this.velocityWheelXAbs < 0.1 || !this.game.input.activePointer.withinGame)) {
                    this.autoScrollX = true;
                }
                if (this.settings.verticalScroll && (this.velocityWheelYAbs < 0.1 || !this.game.input.activePointer.withinGame)) {
                    this.autoScrollY = true;
                }
            }

            if (Math.abs(this.game.input.x - this.inputX) <= this.settings.clickXThreshold && Math.abs(this.game.input.y - this.inputY) <= this.settings.clickYThreshold) {
                let child: any;
                // for (let i = 0; i < this.children.length; i++) {
                //     child = this.getChildAt(i);
                //     if (child.getBounds().contains(this.game.input.x, this.game.input.y) && child.inputEnabled && child.events.onInputUp.getNumListeners() > 0) {
                //         child.events.onInputUp.dispatch();
                //     }
                // }
            }
            this.slideTarget = null;
        }
    }

    protected endSlideMove() {
        this.slideTarget = null;
    }

    protected mouseWheel(event: any): void {
        if (!this.settings.horizontalWheel && !this.settings.verticalWheel) return;

        event.preventDefault();

        let delta = this.game.input.mouse.wheelDelta * 120 / this.settings.deltaWheel;

        if (this.directionWheel !== this.game.input.mouse.wheelDelta) {
            this.velocityWheelX = 0;
            this.velocityWheelY = 0;
            this.directionWheel = this.game.input.mouse.wheelDelta;
        }

        if (this.settings.horizontalWheel) {
            this.autoScrollX = false;

            this.velocityWheelX += delta;
        }

        if (this.settings.verticalWheel) {
            this.autoScrollY = false;

            this.velocityWheelY += delta;
        }
    }

    protected limitMovement(): void {
        if (this.settings.horizontalScroll) {
            if (this.target.x > this._x)
                this.target.x = this._x;
            if (this.target.x < -(this.width - this._w - this._x)) {
                if (this.width > this._w) {
                    this.target.x = -(this.width - this._w - this._x);
                }
                else {
                    this.target.x = this._x;
                }
            }
        }

        if (this.settings.verticalScroll) {
            if (this.target.y > this._y)
                this.target.y = this._y;
            if (this.target.y < -(this.height - this._h - this._y)) {
                if (this.height > this._h) {
                    this.target.y = -(this.height - this._h - this._y);
                }
                else {
                    this.target.y = this._y;
                }
                this.updateSlide();
                this.judgeBoundary();
            }
        }

        // this.maskGraphics.x = this._x - this.target.x;
        // this.maskGraphics.y = this._y - this.target.y;
    }

    public get width(): number {
        return this.target.width - this.settings.offsetX;
    }

    public get height(): number {
        return this.target.height - this.settings.offsetY;
    }

    public scroll(value: number = 1): void {
        this.target.y = this._y - (this.height - this._h) * value;
        this.updateSlide();
        this.judgeBoundary();
        this.limitMovement();
    }

    public resize(rect: Phaser.Rectangle, slideSize?: Phaser.Rectangle) {
        this._x = rect.x;
        this._y = rect.y;
        this._w = rect.width;
        this._h = rect.height;
        this.slideSize = slideSize;
        this.init();
    }

    private makeSlide() {
        if (this.slider) {
            this.parent.removeChild(this.slider);
            this.slider.destroy();
            this.slider = null;
        }
        this.slider = this.game.make.sprite(this.slideSize.x, this.slideSize.y);
        this.parent.addChild(this.slider);
        let button = new NiceSliceButton(this.game, 0, 0, UI.ButtonChat.getName(), "button_over.png", "button_out.png", "button_down.png", 20, 60, {
          top: 4,
          bottom: 4,
          left: 4,
          right: 4}, "");
        this.slider.addChild(button);
        this.slider.inputEnabled = true;

        this.slideButton = this.game.make.graphics();
        this.slideButton.beginFill(0xFF9900, 0);
        this.slideButton.drawRect(0, 0, button.width, button.height);
        this.slideButton.endFill();
        this.slider.addChild(this.slideButton);
        this.slideButton.inputEnabled = true;
        this.slideButton.events.onInputDown.add(this.beginSlideMove, this);
        this.slideButton.events.onInputUp.add(this.endSlideMove, this);
        if (this.target.height > this._h) {
            this.slider.visible = true;
        } else {
            this.slider.visible = false;
        }
    }

    private judgeBoundary() {
        if (this.slider.y > this.slideSize.height - 60) {
            this.slider.y = this.slideSize.height - 60;
        }
        if (this.slider.y < this.slideSize.y) {
            this.slider.y = this.slideSize.y;
        }
    }

    private updateSlide() {
        if (this.target.height > this._h) {
            this.slider.visible = true;
        } else {
            this.slider.visible = false;
            return;
        }
        let height = Math.abs(this.target.y - this.slideSize.y);
        this.slider.y = (height / (this.target.height - this._h)) * (this.slideSize.height) + this.slideSize.y;
    }

    private updateTarget() {
        const rate = (this.slider.y - this.slideSize.y) / (this._h - 60);
        this.target.y = this.slideSize.y + (0 - rate * (this.target.height - this._h));
    }
}