export class PlayCamera extends Phaser.Cameras.Scene2D.Camera {
    private _follow: any;
    private matrix: any;
    private rotation: any;
    private pixelRatio: number;
    private moveRatio: number;
    constructor(x: number, y: number, width: number, height: number, pixelRatio: number, moveRatio?: number) {
        super(x, y, width, height);
        this.pixelRatio = pixelRatio;
        this.moveRatio = moveRatio || 1;
    }

    setPixelRatio(val: number) {
        this.pixelRatio = val;
    }

    startFollow(target: any, roundPixels: boolean, lerpX: number, lerpY: number, offsetX: number, offsetY: number) {
        if (roundPixels === undefined) { roundPixels = false; }
        if (lerpX === undefined) { lerpX = 1; }
        if (lerpY === undefined) { lerpY = lerpX; }
        if (offsetX === undefined) { offsetX = 0; }
        if (offsetY === undefined) { offsetY = offsetX; }

        this._follow = target;

        this.roundPixels = roundPixels;

        // lerpX = Clamp(lerpX, 0, 1);
        // lerpY = Clamp(lerpY, 0, 1);

        this.lerp.set(lerpX, lerpY);

        this.followOffset.set(offsetX, offsetY);

        const originX = this.width / 2;
        const originY = this.height / 2;

        const pos = this._follow.getPosition();
        const fx = pos.x * this.pixelRatio * this.moveRatio - offsetX;
        const fy = pos.y * this.pixelRatio * this.moveRatio - offsetY;

        this.midPoint.set(fx, fy);

        this.scrollX = fx - originX;
        this.scrollY = fy - originY;

        if (this.useBounds) {
            this.scrollX = this.clampX(this.scrollX);
            this.scrollY = this.clampY(this.scrollY);
        }

        return this;
    }

    preRender(resolution: number) {
        const width = this.width;
        const height = this.height;

        const halfWidth = width * 0.5;
        const halfHeight = height * 0.5;

        const zoom = this.zoom * resolution;
        const matrix = this.matrix;

        let originX = width * this.originX;
        let originY = height * this.originY;

        const follow = this._follow;
        const deadzone = this.deadzone;

        let sx = this.scrollX;
        let sy = this.scrollY;

        if (deadzone) {
            // CenterOn(deadzone, this.midPoint.x, this.midPoint.y);
        }

        if (follow && !this.panEffect.isRunning) {
            const pos = follow.getPosition();
            const fx = (pos.x * this.pixelRatio * this.moveRatio - this.followOffset.x);
            const fy = (pos.y * this.pixelRatio * this.moveRatio - this.followOffset.y);

            if (deadzone) {
                if (fx < deadzone.x) {
                    sx = this.linear(sx, sx - (deadzone.x - fx), this.lerp.x);
                } else if (fx > deadzone.right) {
                    sx = this.linear(sx, sx + (fx - deadzone.right), this.lerp.x);
                }

                if (fy < deadzone.y) {
                    sy = this.linear(sy, sy - (deadzone.y - fy), this.lerp.y);
                } else if (fy > deadzone.bottom) {
                    sy = this.linear(sy, sy + (fy - deadzone.bottom), this.lerp.y);
                }
            } else {
                sx = this.linear(sx, fx - originX, this.lerp.x);
                sy = this.linear(sy, fy - originY, this.lerp.y);
            }
        }

        if (this.useBounds) {
            sx = this.clampX(sx);
            sy = this.clampY(sy);
        }

        if (this.roundPixels) {
            originX = Math.round(originX);
            originY = Math.round(originY);
        }

        //  Values are in pixels and not impacted by zooming the Camera
        this.scrollX = sx;
        this.scrollY = sy;

        const midX = sx + halfWidth;
        const midY = sy + halfHeight;

        //  The center of the camera, in world space, so taking zoom into account
        //  Basically the pixel value of what it's looking at in the middle of the cam
        this.midPoint.set(midX, midY);

        const displayWidth = width / zoom;
        const displayHeight = height / zoom;

        this.worldView.setTo(
            midX - (displayWidth / 2),
            midY - (displayHeight / 2),
            displayWidth,
            displayHeight
        );

        matrix.applyITRS(this.x + originX, this.y + originY, this.rotation, zoom, zoom);
        matrix.translate(-originX, -originY);

        this.shakeEffect.preRender();
    }

    private linear(p0, p1, t) {
        return (p1 - p0) * t + p0;
    }
}
