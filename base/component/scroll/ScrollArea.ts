import "phaser-ce";

export class ScrollArea extends Phaser.Group {
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
        kineticMovement: true,
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
    private sliderBG: Phaser.Graphics;
    private sliderContainer: Phaser.Group;

    constructor(game: Phaser.Game, rect: Phaser.Rectangle, params?: any, slideSize?: Phaser.Rectangle) {
        super(game);
        this.x = this._x = rect.x;
        this.y = this._y = rect.y;
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

    /*public addChild(child: PIXI.DisplayObject): PIXI.DisplayObject {
        this.maskGraphics.x = this.parent.x + this._x;
        this.maskGraphics.y = this.parent.y + this._y;
        return super.addChild(child);
    }*/

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
                this.x = this.targetX + delta;
            }
            else {
                this.autoScrollX = false;
                //this.x = -this.targetX;
            }
        }

        if (this.autoScrollY && this.amplitudeY !== 0) {

            let delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll);
            if (delta > 0.5 || delta < -0.5) {
                this.y = this.targetY + delta;
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
            this.x += this.velocityWheelX;
            this.velocityWheelX *= 0.95;
        }

        if (this.settings.verticalWheel && this.velocityWheelYAbs > 0.1) {
            this.dragging = true;
            this.autoScrollY = false;
            this.y += this.velocityWheelY;
            this.velocityWheelY *= 0.95;
        }

        this.limitMovement();
    }

    public setPosition(position: Phaser.Point) {
        if (position.x) {
            this.x += position.x - this._x;
            this.maskGraphics.x = this._x = position.x;
        }
        if (position.y) {
            this.y += position.y - this._y;
            this.maskGraphics.y = this._y = position.y;
        }
    }

    protected init(): void {
        this._maskGraphics = this.game.make.graphics(0, 0);
        this._maskGraphics.beginFill(0x00ffff);
        this._maskGraphics.drawRect(0, 0, this._w, this._h);
        this._maskGraphics.endFill();
        this.add(this._maskGraphics);
        // this._maskGraphics.inputEnabled = true;
        this.mask = this._maskGraphics;

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

    protected beginMove(): void {
        if (this.allowScrollStopOnTouch && this.scrollTween) {
            this.scrollTween.pause();
        }

        if (this.game && this.game.input && this.maskGraphics.getBounds().contains(this.game.input.x, this.game.input.y)) {
            this.startedInside = true;

            this.startX = this.inputX = this.game.input.x;
            this.startY = this.inputY = this.game.input.y;
            this.pressedDown = true;
            this.timestamp = Date.now();
            this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0;
        }
        else {
            this.startedInside = false;
        }
    }

    protected moveCanvas(pointer: Phaser.Pointer, x: number, y: number): void {
        if (!this.pressedDown) return;

        this.now = Date.now();
        let elapsed = this.now - this.timestamp;
        this.timestamp = this.now;

        if (this.settings.horizontalScroll) {
            let delta = x - this.startX; //Compute move distance
            if (delta !== 0) this.dragging = true;
            this.startX = x;
            this.velocityX = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityX;
            this.x += delta;
        }

        if (this.settings.verticalScroll) {
            let delta = y - this.startY; //Compute move distance
            if (delta !== 0) this.dragging = true;
            this.startY = y;
            this.velocityY = 0.8 * (1000 * delta / (1 + elapsed)) + 0.2 * this.velocityY;
            this.y += delta;
        }

        this.limitMovement();
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
                    this.targetX = Math.round(this.x + this.amplitudeX);
                    this.autoScrollX = true;
                }

                if (this.velocityY > 10 || this.velocityY < -10) {
                    this.amplitudeY = 0.8 * this.velocityY;
                    this.targetY = Math.round(this.y + this.amplitudeY);
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
                for (let i = 0; i < this.children.length; i++) {
                    child = this.getChildAt(i);
                    if (child.getBounds().contains(this.game.input.x, this.game.input.y) && child.inputEnabled && child.events.onInputUp.getNumListeners() > 0) {
                        child.events.onInputUp.dispatch();
                    }
                }
            }
        }
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
            if (this.x > this._x)
                this.x = this._x;
            if (this.x < -(this.width - this._w - this._x)) {
                if (this.width > this._w) {
                    this.x = -(this.width - this._w - this._x);
                }
                else {
                    this.x = this._x;
                }
            }
        }

        if (this.settings.verticalScroll) {
            if (this.y > this._y)
                this.y = this._y;
            if (this.y < -(this.height - this._h - this._y)) {
                if (this.height > this._h) {
                    this.y = -(this.height - this._h - this._y);
                }
                else {
                    this.y = this._y;
                }
            }
        }

        this.maskGraphics.x = this._x - this.x;
        this.maskGraphics.y = this._y - this.y;
    }

    public get width(): number {
        return super.width - this.settings.offsetX;
    }

    public get height(): number {
        return super.height - this.settings.offsetY;
    }

    public scroll(value: number = 1): void {
        this.y = this._y - (this.height - this._h) * value;
        this.limitMovement();
    }
}