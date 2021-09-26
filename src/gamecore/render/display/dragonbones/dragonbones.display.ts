import { BaseDragonbonesDisplay, ReferenceArea } from "baseRender";
import { Render } from "../../render";
import { IPos, Logger, IProjection, DisplayField, ElementStateType, IDragonbonesModel, LayerName, RunningAnimation, TitleMask } from "structure";
import { IDisplayObject } from "../display.object";
import { LoadQueue } from "../../loadqueue";
import { ElementTopDisplay } from "../element.top.display";
import { FramesDisplay } from "../frames/frames.display";

export class DragonbonesDisplay extends BaseDragonbonesDisplay implements IDisplayObject {
    protected mTitleMask: number;
    protected mNodeType: number = undefined;
    protected mReferenceArea: ReferenceArea;
    protected mTopDisplay: ElementTopDisplay;
    protected mSortX: number = 0;
    protected mSortY: number = 0;

    protected mLoadQueue: LoadQueue;
    protected mName: string = undefined;
    protected mStartFireTween: Phaser.Tweens.Tween;
    protected mEffectSprite: Phaser.GameObjects.Sprite;
    protected attrs: Map<string, string | number | boolean>;
    constructor(scene: Phaser.Scene, protected render: Render, id?: number, protected uuid?: number, type?: number) {
        super(scene, { resPath: render.url.RES_PATH, osdPath: render.url.OSD_PATH }, id);
        this.mNodeType = type;

        this.mLoadQueue = new LoadQueue(scene);
        this.mLoadQueue.on("QueueProgress", this.fileComplete, this);
        this.mLoadQueue.on("QueueError", this.fileError, this);
        this.mHasInteractive = true;
    }

    public load(display: IDragonbonesModel, field?: DisplayField, useRenderTex = true): Promise<any> {
        field = !field ? DisplayField.STAGE : field;
        if (field !== DisplayField.STAGE) {
            return Promise.reject("field is not STAGE");
        }

        return super.load(display, field, useRenderTex);
    }

    get hasInteractive(): boolean {
        return this.mHasInteractive;
    }

    set hasInteractive(val) {
        this.mHasInteractive = val;
    }

    public startLoad(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.mLoadQueue || this.mCreated) {
                resolve(null);
                return;
            }
            this.mLoadQueue.once("QueueComplete", () => {
                resolve(null);
            }, this);
            this.mLoadQueue.startLoad();
        });
    }

    public destroy() {
        if (this.mLoadQueue) {
            this.mLoadQueue.off("QueueProgress", this.fileComplete, this);
            this.mLoadQueue.off("QueueError", this.fileError, this);
            this.mLoadQueue.destroy();
        }
        if (this.mStartFireTween) {
            this.mStartFireTween.stop();
            this.mStartFireTween = undefined;
        }
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
        if (this.mTopDisplay) {
            this.mTopDisplay.destroy();
        }
        if (this.attrs) {
            this.attrs.clear();
            this.attrs = undefined;
        }
        super.destroy();
    }

    public get nodeType() {
        return this.mNodeType;
    }

    public set titleMask(val: number) {
        this.mTitleMask = val;
    }

    public get titleMask(): number {
        return this.mTitleMask;
    }

    public async showRefernceArea(area: number[][], origin: IPos) {
        if (!area || area.length <= 0 || !origin) return;
        if (!this.mReferenceArea) {
            this.mReferenceArea = new ReferenceArea(this.scene);
        }
        const roomSize = await this.render.mainPeer.getCurrentRoomSize();
        this.mReferenceArea.draw(area, origin, roomSize.tileWidth / this.render.scaleRatio, roomSize.tileHeight / this.render.scaleRatio);
        this.addAt(this.mReferenceArea, 0);
    }

    public hideRefernceArea() {
        if (this.mReferenceArea) {
            this.mReferenceArea.destroy();
            this.mReferenceArea = undefined;
        }
    }

    public showGrids() {
    }

    public hideGrids() {
    }

    public updateTopDisplay() {
        if (this.mTopDisplay) this.mTopDisplay.update();
    }

    public setVisible(value: boolean): this {
        if (this.mTopDisplay) {
            if (value) this.mTopDisplay.showNickname(this.mName);
            else this.mTopDisplay.hideNickname();
        }
        return super.setVisible(value);
    }
    public setTopDisplayVisible(value: boolean) {
        if (this.mTopDisplay) {
           this.mTopDisplay.setTopDisplay(value);
        }
    }
    public showNickname(name?: string) {
        if (name === undefined) {
            name = this.mName;
        }
        this.mName = name;
        if (!this.checkShowNickname()) return;
        if (!this.mTopDisplay) {
            this.mTopDisplay = this.render.add.elementTopDisplay(this.scene, this);
        }
        this.mTopDisplay.showNickname(name);
    }

    public showTopDisplay(data?: ElementStateType) {
        if (!data) {
            if (this.mTopDisplay)
                this.mTopDisplay.destroy();
            this.mTopDisplay = undefined;
            return;
        }
        if (!this.mTopDisplay) this.mTopDisplay = this.render.add.elementTopDisplay(this.scene, this);
        this.mTopDisplay.loadState(data);
    }

    public removeTopDisplay() {
        if (!this.mTopDisplay) return;
        this.mTopDisplay.removeUIState();
    }

    public showBubble(text: string, setting: any) {// op_client.IChat_Setting
        if (!this.mTopDisplay) {
            this.mTopDisplay = this.render.add.elementTopDisplay(this.scene, this);
        }
        this.mTopDisplay.showBubble(text, setting);
    }

    public clearBubble() {
        if (!this.mTopDisplay) return;
        this.mTopDisplay.clearBubble();
    }

    public displayCreated() {
        super.displayCreated();
        if (this.mTopDisplay) {
            this.mTopDisplay.updateOffset();
        }
        // const pipeline = (<Phaser.Renderer.WebGL.WebGLRenderer>this.scene.renderer).pipelines.get("circle");
        // if (!pipeline) (<Phaser.Renderer.WebGL.WebGLRenderer>this.scene.renderer).pipelines.add("circle", new CirclePieple(this.scene.game));
        // if (!this.mEffectSprite) {
        // this.mEffectSprite = this.scene.make.sprite(undefined, false);
        // this.mEffectSprite.x = 0;
        // this.mEffectSprite.y = 0;
        // const gfx = this.scene.make.graphics(undefined, false);
        // gfx.fillStyle(0x00ff00);
        // gfx.fillRect(0, 0, 300, 300);
        // gfx.visible = false;
        // const texture = gfx.generateTexture("gfx", 300, 300);
        // this.mEffectSprite.setTexture("gfx");
        // this.mEffectSprite.setPipeline("circle");
        // this.addAt(this.mEffectSprite, 0);
        // }
        this.render.mainPeer.elementDisplayReady(this.id);
        this.render.renderEmitter("dragonBones_initialized");
    }

    public get projectionSize(): IProjection {
        if (!this.mProjectionSize) {
            this.mProjectionSize = { offset: { x: 0, y: 0 }, width: 0, height: 0 };
        }
        return this.mProjectionSize;
    }

    public play(val: RunningAnimation) {
        super.play(val);
        this.fetchProjection();
    }

    public startFireMove(pos: any) {
        this.mStartFireTween = this.scene.tweens.add({
            targets: this,
            duration: 5000,
            ease: "Linear",
            props: {
                x: pos.x,
                y: pos.y
            },
            onComplete: () => {
                if (this.mStartFireTween) this.mStartFireTween.stop();
                if (this.mStartFireTween) this.mStartFireTween = undefined;
            },
            onCompleteParams: [this]
        });
    }

    public updateAttrs(attrs: Map<string, string | number | boolean>) {
        this.attrs = attrs;
    }

    public getAttr(key: string) {
        if (!this.attrs) return;
        return this.attrs.get(key);
    }

    public doMove(moveData: any) {
    }

    public update() {
        super.update();
        this.updateTopDisplay();
    }

    public addEffect(display: IDisplayObject) {
        if (!display) {
            return Logger.getInstance().error("Failed to add effect, display does not exist");
        }
        const backend = display.getSprite(DisplayField.BACKEND);
        if (backend) {
            this.addAt(backend, DisplayField.BACKEND);
        }
        const frontend = display.getSprite(DisplayField.FRONTEND);
        if (frontend) {
            this.addAt(frontend, DisplayField.FRONTEND);
        }
    }

    public removeEffect(display: IDisplayObject) {
        if (!display) {
            return Logger.getInstance().error("Failed to remove effect, display does not exist");
        }
        const backend = display.getSprite(DisplayField.BACKEND);
        if (backend) {
            this.remove(backend, true);
        }
        const frontend = display.getSprite(DisplayField.FRONTEND);
        if (frontend) {
            this.remove(frontend, true);
        }
    }

    public mount(display: FramesDisplay | DragonbonesDisplay, index?: number) {
        if (!this.mMountContainer) {
            this.mMountContainer = this.scene.make.container(undefined, false);
        }
        display.x = this.topPoint.x;
        display.y = this.topPoint.y;
        if (!this.mMountContainer.parentContainer) {
            // const container = <Phaser.GameObjects.Container>this.mSprites.get(DisplayField.STAGE);
            // if (container) container.addAt(this.mMountContainer, index);
            this.add(this.mMountContainer);
        }
        this.mMountContainer.addAt(display, index);
        this.mMountList.set(index, display);
        display.setRootMount(this);
    }

    public unmount(display: FramesDisplay | DragonbonesDisplay) {
        if (!this.mMountContainer) {
            return;
        }
        display.setRootMount(undefined);
        display.visible = true;
        let index = -1;
        this.mMountList.forEach((val, key) => {
            if (val === display) {
                index = key;
            }
        });
        if (index >= 0) {
            this.mMountList.delete(index);
        }
        this.mMountContainer.remove(display, false);
        this.render.displayManager.addToLayer(LayerName.SURFACE, display);
    }

    public get sortX() {
        return this.mSortX;
    }

    public get sortY() {
        return this.mSortY;
    }

    protected async fetchProjection() {
        if (!this.id) return;
        this.mProjectionSize = await this.render.mainPeer.fetchProjectionSize(this.id);
    }

    protected fileComplete(progress: number, key: string, type: string) {
        if (key !== this.resourceName || type !== "image") {
            return;
        }
        this.createArmatureDisplay();
    }

    protected fileError(key: string) {
        if (key !== this.resourceName) return;
        // TODO: 根据请求错误类型，retry或catch
        this.displayCreated();
    }

    protected onArmatureLoopComplete(event: dragonBones.EventObject) {
        super.onArmatureLoopComplete(event);
        if (!this.mArmatureDisplay || !this.mAnimation) {
            return;
        }
        const queue = this.mAnimation.playingQueue;
        const times = queue.playTimes === undefined ? -1 : queue.playTimes;
        if (queue.playedTimes >= times && times > 0) {
            this.render.mainPeer.completeDragonBonesAnimationQueue(this.id);
        }
    }

    protected checkShowNickname(): boolean {
        return (this.mTitleMask & TitleMask.TQ_NickName) > 0;
    }

    get nickname() {
        return this.mName;
    }
}
// const CircleShader = `
// precision highp float;

// uniform vec2 resolution;
// uniform float time;
// uniform sampler2D backbuffer;

// const float PI = acos(-1.);
// const float TAU = PI * 2.;

// #define saturate(x) clamp(x,0.,1.)
// #define _tail2x(p,n) (mod(p,2.)-1.)

// float Hash( vec2 p, in float s ){
//     return fract(sin(dot(vec3(p.xy,10.0 * abs(sin(s))),vec3(27.1,61.7, 12.4)))*273758.5453123);
// }

// float noise(in vec2 p, in float s){
//   vec2 i = floor(p);
//   vec2 f = fract(p);
//   return mix(
//     mix(Hash(i + vec2(0.,0.), s), Hash(i + vec2(1.,0.), s),f.x),
//     mix(Hash(i + vec2(0.,1.), s), Hash(i + vec2(1.,1.), s),f.x),f.y) * s;
// }

// float fbm(vec2 p){
//   float v = 0.0;
//   v += noise(p*34., .1);
//   v += noise(p*20., .04);
//   return v;
// }

// vec2 mPolar(vec2 p){
//   float a = atan(p.y, p.x);
//   float r = length(p);
//   return vec2(a, r);
// }

// vec2 tailY2x(vec2 p,float n){p*=n;return vec2(p.x,_tail2x(p.y,n));}
// mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

// highp float rand(vec2 p){
//   highp float a = 12.9898;
//   highp float b = 78.233;
//   highp float c = 43758.5453;
//   highp float dt= dot(p ,vec2(a,b));
//   highp float sn= mod(dt,3.14);
//   return fract(sin(sn) * c);
// }

// // signed distance
// float sd(float d,float r){return r-d;}
// float sd(float d){return 1.-d;}
// // glow + fill
// float gf(float d,float r){return r/d;}
// float gf(float d){return 1./d;}

// float fill_na(float d){return step(0.,d);}
// float fill(float d){return smoothstep(0.,0.01,d);}
// float stroke(float d,float w){return 1.-smoothstep(w,w+0.01,abs(d));}
// float strokeInner(float d,float w){return stroke(d-w,w);}
// float strokeOuter(float d,float w){return stroke(d+w,w);}

// float lSquare(vec2 p){p = abs(p);return max(p.x,p.y);}

// float lPoly(vec2 p,float n){
//   float a = atan(p.x,p.y)+PI;
//   float r = TAU/n;
//   return cos(floor(.5+a/r)*r-a)*length(p)/cos(r*.5);
// }

// float strokeStar(vec2 p,float n,float w){
//   float l =strokeInner(sd(lPoly(p,n*.5)),w);
//   l+=strokeInner(sd(lPoly(mod(n,2.)!=0.?vec2(-p.x,p.y):p*rot(TAU/n),n*.5)),w);
//   return l;
// }

// vec2 mPoly(vec2 p,float n,float s){
//   float r = TAU / n;
//   float a = floor(atan(p.y,p.x)/r)*r+r*.5;
//   return (vec2(cos(a),sin(a))*s-p)*rot(-a-PI*.5);
// }

// float wsaw(float x){return fract(x*.5+.5)*2.-1.;}
// float wtri(float x){return abs(2.*fract(x*.5-.25)-1.)*2.-1.;}
// float utri(float x){return abs(2.*fract(x*.5-.5)-1.);}
// float wtrz(float x,float w){return clamp(wtri(x*2.)*w,-1.,1.);} // 台形波 trapezoidal wave

// // ease
// float o2(float t){t=1.-t;return 1.-t*t;}
// float oN(float t,float n){return 1.-pow(1.-t,n);}

// float dot2(vec2 p){return dot(p,p);}

// vec2 mSimplePerspective(vec2 p){p.y+=.2;p.y*=3.;return p;}

// float ring(vec2 p,float t){
//   float alpha =    fract(-t);
//   float l = 0.;
//   vec2 p3=mPoly(p*rot(PI*.5),10.,1.);
//   l+=saturate(gf(abs(p3.x),.03)*fill(sd(length(p),1.1+fract(t)))*(1.-fill(sd(length(p),.9+fract(t))))*alpha);

//   l+=saturate(.02/abs(sd(length(p),1.1+fract(t)))*alpha);
//   vec2 p4=mPolar(p*(.57-oN(t,1.3)*.28)).yx;
//   p4.x-=.65;
//   l+= saturate(abs(1./((p4.x + fbm( p4 + vec2(sin(t*.2),t*0.1))) * 50.0))*sd(dot2(tailY2x(p4+vec2(.1,0.),12.)),.9)*alpha);
//   return l;
// }

// float summoningCircle(vec2 p){
//   float l=0.;
//   l+=fill(sd(lSquare(p*rot(PI/3.*1.5)*vec2(100.,1.)),1.));
//   l+=fill(sd(lSquare(p*rot(PI/3.*2.5)*vec2(100.,1.)),1.));
//   l+=fill(sd(lSquare(p*rot(PI/3.*3.5)*vec2(100.,1.)),1.));
//   l=saturate(l);
//   l-=fill(sd(lPoly(p,3.)));
//   l=saturate(l);
//   float r = atan(p.y,p.x)*.1;
//   l+=strokeOuter(sd(length(p),.98),.008+wtrz(r/TAU*3.,12.)*.005);
//   l+=strokeInner(sd(length(p),.95),.005);
//   l+=strokeInner(sd(lPoly(p,3.)),.01);
//   l+=strokeInner(sd(lPoly(p,3.),.88),.02);
//   l+=strokeInner(sd(lPoly(p,6.),.53),.01);
//   vec2 q=mPoly(p*rot(PI*.5),3.,.5);
//   l+=fill(sd(lPoly(q,3.),.3));
//   vec2 q2=mPoly(p*rot(PI/3.+PI*.5),3.,.7);
//   l+=fill(sd(lPoly(q2,3.),.1));
//   l+=strokeInner(sd(lPoly(p*rot(PI),3.),.5),.02);
//   l+=fill(sd(length(p),.05));
//   vec2 q3=mPoly(p*rot(PI*.5),3.,1.);
//   l=saturate(l);
//   l-=fill(sd(length(q3),.2));
//   l=saturate(l);
//   l+=strokeInner(sd(length(q3),.18),.005);
//   l+=strokeInner(sd(length(q3),.15),.005);
//   l+=strokeStar(q3*rot(PI)*7.,6.,.1);
//   return l;
// }

// float render(vec2 p){
//   p=mSimplePerspective(p);
//   p*=rot(time);
//   p*=2.;
//   float tt = time*.75;
//   float l2 = ring(p,o2(fract(tt)));
//   l2+=ring(p*rot(PI/3.),o2(fract(tt+.5)));
//   float l=0.;
//   l = summoningCircle(p*=rot(floor(time*1.5*4.*3.)/3.));
//   return l+l2;
// }

// void main(void) {
//   vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / max(resolution.x, resolution.y);
//   float l=0.;
//   l = (render(p)+render(p+vec2(0.,1./min(resolution.x, resolution.y))))*.5;
//   gl_FragColor = vec4(l*vec3( 0.75, 0.5, .05 )*2., 1.0);
// }
// `;

class CirclePieple extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
    constructor(game) {
        super({
            //     game, fragShader: `#ifdef GL_ES
            // precision mediump float;
            // #endif
            // uniform vec2 resolution;
            // uniform vec2 mouse;
            // uniform float time;
            // float aliveLerp(float x, float y, float weight){
            //     float speed = 0.636;
            //     float changer = abs(cos(time * speed));
            //     return sin(x * (1.0 - weight * 1.5) + y * weight / 5.) / changer;
            // }
            // float lerp (float x, float y, float weight){
            //     return x * (1.0 - weight) + y * weight;
            // }
            // void main(){
            //     vec3 colorA = vec3(0.351,0.196,0.425);
            //     vec3 colorB = vec3(0.530,0.010,0.270);
            //     vec2 st = abs(gl_FragCoord.xy / resolution.xy);
            //     vec2 Coord = vec2(gl_FragCoord.x, gl_FragCoord.y);
            //     float coordChanger = cos(sin(time * 0.3)) * .14;
            //     if (distance(st, vec2(0.5)) < 0.2 - coordChanger && distance(st, vec2(0.5)) > 0.17 - coordChanger){
            //         gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
            //     }
            //     else if (distance(st, vec2(0.5)) < 0.23 - coordChanger && distance(st, vec2(0.5)) > 0.2 - coordChanger){
            //         gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
            //     }
            //     else if (distance(st, vec2(0.5)) < 0.26 - coordChanger && distance(st, vec2(0.5)) > 0.23 - coordChanger){
            //         gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
            //     }
            //     else if (distance(st, vec2(0.5)) < 0.29 - coordChanger && distance(st, vec2(0.5)) > 0.26 - coordChanger){
            //         gl_FragColor = vec4(1.000,0.959,0.074,1.000);
            //     }
            //     else if (distance(st, vec2(0.5)) < 0.32 - coordChanger && distance(st, vec2(0.5)) > 0.29 - coordChanger){
            //         gl_FragColor = vec4(1.000,0.350,0.048,1.000);
            //     }
            //     else if (distance(st, vec2(0.5)) < 0.35 - coordChanger && distance(st, vec2(0.5)) > 0.32 - coordChanger){
            //         gl_FragColor = vec4(1.000,0.010,0.019,1.000);
            //     }
            //     else {
            //         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            //     }
            // }`});

            game, fragShader: `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;
        uniform sampler2D backbuffer;
        const float PI = acos(-1.);
        const float TAU = PI * 2.;
        #define saturate(x) clamp(x,0.,1.)
        #define _tail2x(p,n) (mod(p,2.)-1.)
        float Hash( vec2 p, in float s ){
            return fract(sin(dot(vec3(p.xy,10.0 * abs(sin(s))),vec3(27.1,61.7, 12.4)))*273758.5453123);
        }
        float noise(in vec2 p, in float s){
          vec2 i = floor(p);
          vec2 f = fract(p);
          return mix(
            mix(Hash(i + vec2(0.,0.), s), Hash(i + vec2(1.,0.), s),f.x),
            mix(Hash(i + vec2(0.,1.), s), Hash(i + vec2(1.,1.), s),f.x),f.y) * s;
        }
        float fbm(vec2 p){
          float v = 0.0;
          v += noise(p*34., .1);
          v += noise(p*20., .04);
          return v;
        }
        vec2 mPolar(vec2 p){
          float a = atan(p.y, p.x);
          float r = length(p);
          return vec2(a, r);
        }
        vec2 tailY2x(vec2 p,float n){p*=n;return vec2(p.x,_tail2x(p.y,n));}
        mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

        highp float rand(vec2 p){
          highp float a = 12.9898;
          highp float b = 78.233;
          highp float c = 43758.5453;
          highp float dt= dot(p ,vec2(a,b));
          highp float sn= mod(dt,3.14);
          return fract(sin(sn) * c);
        }

        // signed distance
        float sd(float d,float r){return r-d;}
        float sd(float d){return 1.-d;}
        // glow + fill
        float gf(float d,float r){return r/d;}
        float gf(float d){return 1./d;}
        float fill_na(float d){return step(0.,d);}
        float fill(float d){return smoothstep(0.,0.01,d);}
        float stroke(float d,float w){return 1.-smoothstep(w,w+0.01,abs(d));}
        float strokeInner(float d,float w){return stroke(d-w,w);}
        float strokeOuter(float d,float w){return stroke(d+w,w);}
        float lSquare(vec2 p){p = abs(p);return max(p.x,p.y);}

        float lPoly(vec2 p,float n){
          float a = atan(p.x,p.y)+PI;
          float r = TAU/n;
          return cos(floor(.5+a/r)*r-a)*length(p)/cos(r*.5);
        }

        float strokeStar(vec2 p,float n,float w){
          float l =strokeInner(sd(lPoly(p,n*.5)),w);
          l+=strokeInner(sd(lPoly(mod(n,2.)!=0.?vec2(-p.x,p.y):p*rot(TAU/n),n*.5)),w);
          return l;
        }

        vec2 mPoly(vec2 p,float n,float s){
          float r = TAU / n;
          float a = floor(atan(p.y,p.x)/r)*r+r*.5;
          return (vec2(cos(a),sin(a))*s-p)*rot(-a-PI*.5);
        }

        float wsaw(float x){return fract(x*.5+.5)*2.-1.;}
        float wtri(float x){return abs(2.*fract(x*.5-.25)-1.)*2.-1.;}
        float utri(float x){return abs(2.*fract(x*.5-.5)-1.);}
        float wtrz(float x,float w){return clamp(wtri(x*2.)*w,-1.,1.);} // 台形波 trapezoidal wave

        // ease
        float o2(float t){t=1.-t;return 1.-t*t;}
        float oN(float t,float n){return 1.-pow(1.-t,n);}
        float dot2(vec2 p){return dot(p,p);}
        vec2 mSimplePerspective(vec2 p){p.y+=.2;p.y*=3.;return p;}
        float ring(vec2 p,float t){
          float alpha =    fract(-t);
          float l = 0.;
          vec2 p3=mPoly(p*rot(PI*.5),10.,1.);
          l+=saturate(gf(abs(p3.x),.03)*fill(sd(length(p),1.1+fract(t)))*(1.-fill(sd(length(p),.9+fract(t))))*alpha);

          l+=saturate(.02/abs(sd(length(p),1.1+fract(t)))*alpha);
          vec2 p4=mPolar(p*(.57-oN(t,1.3)*.28)).yx;
          p4.x-=.65;
          l+= saturate(abs(1./((p4.x + fbm( p4 + vec2(sin(t*.2),t*0.1))) * 50.0))*sd(dot2(tailY2x(p4+vec2(.1,0.),12.)),.9)*alpha);
          return l;
        }

        float summoningCircle(vec2 p){
          float l=0.;
          l+=fill(sd(lSquare(p*rot(PI/3.*1.5)*vec2(100.,1.)),1.));
          l+=fill(sd(lSquare(p*rot(PI/3.*2.5)*vec2(100.,1.)),1.));
          l+=fill(sd(lSquare(p*rot(PI/3.*3.5)*vec2(100.,1.)),1.));
          l=saturate(l);
          l-=fill(sd(lPoly(p,3.)));
          l=saturate(l);
          float r = atan(p.y,p.x);
          l+=strokeOuter(sd(length(p),.98),.008+wtrz(r/TAU*3.,12.)*.005);
          l+=strokeInner(sd(length(p),.95),.005);
          l+=strokeInner(sd(lPoly(p,3.)),.01);
          l+=strokeInner(sd(lPoly(p,3.),.88),.02);
          l+=strokeInner(sd(lPoly(p,6.),.53),.01);
          vec2 q=mPoly(p*rot(PI*.5),3.,.5);
          l+=fill(sd(lPoly(q,3.),.3));
          vec2 q2=mPoly(p*rot(PI/3.+PI*.5),3.,.7);
          l+=fill(sd(lPoly(q2,3.),.1));
          l+=strokeInner(sd(lPoly(p*rot(PI),3.),.5),.02);
          l+=fill(sd(length(p),.05));
          vec2 q3=mPoly(p*rot(PI*.5),3.,1.);
          l=saturate(l);
          l-=fill(sd(length(q3),.2));
          l=saturate(l);
          l+=strokeInner(sd(length(q3),.18),.005);
          l+=strokeInner(sd(length(q3),.15),.005);
          l+=strokeStar(q3*rot(PI)*7.,6.,.1);
          return l;
        }

        float render(vec2 p){
          p=mSimplePerspective(p);
          p*=rot(time);
          p*=2.;
          float tt = time*.75;
          float l2 = ring(p,o2(fract(tt)));
          l2+=ring(p*rot(PI/3.),o2(fract(tt+.5)));
          float l=0.;
          l = summoningCircle(p*=rot(floor(time*1.5*4.*3.)/3.));
          return l+l2;
        }

        void main(void) {
          vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / max(resolution.x, resolution.y);
          float l=0.;
          l = (render(p)+render(p+vec2(0.,1./min(resolution.x, resolution.y))))*.5;
          gl_FragColor = vec4(l*vec3( 0.75, 0.5, .05 )*2., 1.0);
        }
        `});
    }
}
