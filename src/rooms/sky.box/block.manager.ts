import { DynamicImage } from "../../ui/components/dynamic.image";
import { WorldService } from "../../game/world.service";
import { Logger } from "../../utils/log";
import { Url } from "../../utils/resUtil";
import { SkyBoxScene } from "../../scenes/sky.box";
import { IScenery, Fit } from "./scenery";
import { IRoomService, Room } from "../room";
import { ICameraService } from "../cameras/cameras.manager";
import { State } from "../state/state.group";

export interface IBlockManager {
  readonly world: WorldService;
  startPlay(scene: Phaser.Scene);
  check(time?: number, delta?: number);
}
export class BlockManager implements IBlockManager {
  private mContainer: Phaser.GameObjects.Container;
  private mRows: number = 1;
  private mCols: number = 1;
  private mGridWidth: number;
  private mGridHeight: number;
  private mGrids: Block[];
  private mUris: string[][];
  private mMainCamera: Phaser.Cameras.Scene2D.Camera;
  private mScaleRatio: number;
  private mSceneName: string = "";
  private mWorld: WorldService;
  private scene: Phaser.Scene;
  private mScenery: IScenery;
  private mRoom: IRoomService;
  private mCameras: ICameraService;
  private mStateMap: Map<string, State>;
  constructor(scenery: IScenery, room: IRoomService) {
    this.mGrids = [];
    this.mScenery = scenery;
    this.mUris = scenery.uris;
    this.mRoom = room;
    this.mWorld = room.world;
    this.mCameras = room.cameraService;
    this.mMainCamera = this.mCameras.camera;
    this.mScaleRatio = this.mWorld.scaleRatio;
    this.setSize(scenery.width, scenery.height);

    const playScene = room.scene;
    if (!playScene) {
      Logger.getInstance().fatal(`${BlockManager.name} scene does not exist`);
      return;
    }
    this.mSceneName = SkyBoxScene.name + `_${scenery.id}`;
    const scene = this.mWorld.game.scene.add(this.mSceneName, SkyBoxScene, false);
    playScene.scene.launch(this.mSceneName, this);
    this.updateDepth();
  }

  startPlay(scene: Phaser.Scene) {
    this.scene = scene;
    this.initBlock();
    if (this.mStateMap) {
      this.mStateMap.forEach((state) => this.handlerState(state));
    }
  }

  check(time?: number, delta?: number) {
    const worldView = this.mMainCamera.worldView;
    const viewPort = new Phaser.Geom.Rectangle(worldView.x - worldView.width / 2, worldView.y - worldView.height / 2, worldView.width * 2, worldView.height * 2);
    for (const block of this.mGrids) {
      block.checkCamera(Phaser.Geom.Intersects.RectangleToRectangle(viewPort, block.rectangle));
    }
  }

  update(scenery: IScenery) {
    this.mScenery = scenery;
    this.mUris = scenery.uris;
    this.setSize(scenery.width, scenery.height);
    this.initBlock();
    this.updateDepth();
  }

  setSize(imageW: number, imageH: number, gridW?: number, gridH?: number) {
    if (gridW === undefined) gridW = imageW;
    if (gridH === undefined) gridH = imageH;
    this.mRows = Math.ceil(imageW / gridW);
    this.mCols = Math.ceil(imageH / gridH);
    this.mGridWidth = gridW;
    this.mGridHeight = gridH;
  }

  updatePosition() {
    const camera = this.scene.cameras.main;
    const { offset } = this.mScenery;
    const loc = this.fixPosition(offset);
    camera.setPosition(loc.x, loc.y);
  }

  destroy() {
    if (this.mWorld && this.mWorld.game) {
      this.mWorld.game.scene.remove(this.mSceneName);
    }
    this.mGrids.length = 0;
  }

  setState(state: State) {
    this.handlerState(state);
  }

  public playSkyBoxAnimation(packet: any) {
    const { id, targets, duration, reset, resetDuration } = packet;
    if (id === undefined || targets === undefined || duration === undefined) {
      return;
    }
    if (!this.scene) {
      return;
    }
    if (id !== this.mScenery.id) {
      return;
    }

    const camera = this.scene.cameras.main;
    this.move(camera, this.fixPosition(targets), duration, this.fixPosition(reset), resetDuration);
  }

  protected handlerState(state: State) {
    const packet = state.packet;
    for (const prop of packet) {
      if (this.mScenery.id === prop.id) {
        this.playSkyBoxAnimation(prop);
      }
    }
  }

  protected updateDepth() {
    if (!this.mRoom) {
      return;
    }
    const playScene = this.mRoom.scene;
    if (!this.mScenery || !playScene) {
      return;
    }
    const scene = this.mWorld.game.scene.getScene(this.mSceneName);
    if (!scene) {
      return;
    }
    if (this.mScenery.depth < 0) {
      scene.scene.sendToBack(this.mSceneName);
    } else {
      scene.scene.moveAbove(playScene.sys.settings.key, this.mSceneName);
    }
  }

  protected initBlock() {
    this.clear();
    this.mContainer = this.scene.add.container(0, 0);
    this.mContainer.setScale(this.mWorld.scaleRatio);
    const len = this.mUris.length;
    // TODO
    if (this.mScenery.fit === Fit.Repeat) {
      const room = <Room> this.mRoom;
      const { width, height } = room.getMaxScene();
      const rows = Math.floor(width /  this.mScenery.width);
      const cols = Math.floor(height / this.mScenery.height);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const block = new Block(this.scene, this.mUris[0][0]);
          block.setRectangle(i * this.mRows * this.mGridWidth, j * this.mRows * this.mGridHeight, this.mGridWidth, this.mGridHeight, this.mScaleRatio);
          this.mGrids.push(block);
        }
      }
    } else {
      for (let i = 0; i < len; i++) {
        const l = this.mUris[i].length;
        for (let j = 0; j < l; j++) {
          const block = new Block(this.scene, this.mUris[i][j]);
          block.setRectangle(i * this.mRows * this.mGridWidth, j * this.mRows * this.mGridHeight, this.mGridWidth, this.mGridHeight, this.mScaleRatio);
          this.mGrids.push(block);
        }
      }
    }
    this.mContainer.add(this.mGrids);
    this.initCamera();
  }

  protected move(targets, props, duration?: number, resetProps?: any, resetDuration?: number) {
    const tween = this.scene.tweens.add({
      targets,
      props,
      duration,
      loop: -1,
    });
    if (resetProps) {
      tween.once("loop", () => {
        if (resetProps) {
          targets.x = resetProps.x;
          targets.y = resetProps.y;
        }
        // else {
        //   const { x, y } = this.mScenery.offset;
        //   offset = this.fixPosition({ x, y });
        //   targets.x = offset.x;
        //   targets.y = offset.y;
        // }
        tween.stop();
        this.move(targets, props, resetDuration);
        // tween.duration = resetDuration;
      });
    }
  }

  protected initCamera() {
    const camera = this.scene.cameras.main;

    if (this.mCameras) {
      const main = this.mCameras.camera;
      const bound = main.getBounds();
      camera.setBounds(bound.x, bound.y, bound.width, bound.height);

      this.updatePosition();
      camera.setScroll(main.scrollX , main.scrollY);
      this.mCameras.addCamera(camera);
    }
  }

  protected clear() {
    for (const grid of this.mGrids) {
      grid.destroy();
    }
    this.mGrids.length = 0;
    if (this.mContainer) {
      this.mContainer.destroy(true);
    }
  }

  get world(): WorldService {
    return this.mWorld;
  }

  get scenery(): IScenery {
    return this.mScenery;
  }

  protected fixPosition(props: any) {
    if (!props) return;
    const offset = this.offset;
    if (props.x !== undefined) {
      props.x = (offset.x + props.x) * this.mWorld.scaleRatio;
    }
    if (props.y !== undefined) {
      props.y = (offset.y + props.y) * this.mWorld.scaleRatio;
    }
    return props;
  }

  protected get offset(): { x: number, y: number} {
    const os = {x: 0, y: 0};
    let x = 0;
    let y = 0;
    if (this.mScenery) {
      if (this.mScenery.fit === Fit.Center) {
        const size = this.mRoom.roomSize;
        const { width, height } = this.mScenery;
        x = size.sceneWidth - width >> 1;
        y = size.sceneHeight - height >> 1;
      }
    }
    return { x, y };
  }
}

class Block extends DynamicImage {
  private mLoaded: boolean = false;
  private mInCamera: boolean = false;
  private mKey: string;
  private mRectangle: Phaser.Geom.Rectangle;
  constructor(scene: Phaser.Scene, key: string) {
    super(scene, 0, 0);
    this.mKey = key;
    this.setOrigin(0);
    // this.mRectangle = new Phaser.Geom.Rectangle(this.x, this.y, 1, 1);
  }

  checkCamera(val: boolean) {
    if (this.mInCamera !== val) {
      this.mInCamera = val;
      if (this.mLoaded) {
        // TODO
        // this.setActive(val);
      } else {
        this.load(Url.getOsdRes(this.mKey));
      }
    }
  }

  setRectangle(x: number, y: number, width: number, height: number, scale: number = 1) {
    this.x = x;
    this.y = y;
    this.mRectangle = new Phaser.Geom.Rectangle(x * scale, y * scale, width * scale, height * scale);
  }

  get rectangle(): Phaser.Geom.Rectangle {
    return this.mRectangle;
  }

  protected onLoadComplete(file) {
    super.onLoadComplete(file);
    if (this.texture) {
      this.mLoaded = true;
      this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
      this.mRectangle.setSize(this.width, this.height);
    }
  }
}
