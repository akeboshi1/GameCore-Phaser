Tooqing图轻播放器 Phaser3 版本
===
@(爱扑)[图轻]

[任务列表](./TODO.md)

## 技术特性
- Web-Base ： 项目基于页游形态，跨端使用壳来实现。研发时完全基于web技术不依赖服务端JS技术（NodeJS）
- 兼容大端/小端
	- 在PC和Mobile端可以自适应（适应多种分辨率模式，按不同分辨率缩放。游戏和UI分开缩放）
	- 不同端使用不同UI布局
- 使用 [Phaser3](https://github.com/topics/phaser)
- 使用isometric轴测插件
	- [Phaser3版本](https://github.com/sebashwa/phaser3-plugin-isometric) 
	- [isometric-demo](https://github.com/mmermerkaya/phaser-isometric-demo)
	- 伪3D，加入Z轴。 Z轴整数、固定单位He，以一个基本高（视觉偏差）作为单位。这个基本高由美术来定。地皮层定为游戏海拔：Z=0（He）
- UI 库 [`TODO: 选型, 用开源`]
- 使用Webworker 实现网络连接（Websocket VIA Webworker），在没有webworker运行时情况下用异步执行。
- 使用龙骨


# 架构

## 入口/启动
- 一个启动器/Launcher（main），特性：
	- 外部启动游戏就是启动Launcher并给必要的参数
	- 初始化入参
	- 做跨端兼容
	- 在确实不兼容的runtime 中尝试启动微端

- 游戏全局主体句柄/ world（service），特性：
	- TA是游戏的**逻辑主体**
	- 在所有模块中都可以获得 world 句柄，获得world相当于拿到Game
	- `成员` 管理Phaser.Game的生命周期，**里面处理显示层，显示主题**
	- `成员` 管理网络连接/SocketConnection
	- `成员` 各种管理器，**逻辑控制**。是否要添加至Phaser的时钟待定，因为可以用消息驱动。

## 游戏部分

### GameScene （Phaser.Scene 即CE 里的 State）
**游戏态**
#### 显示层
图层中只控制对象的显示对象，不牵涉任何逻辑
- UI层：渲染UI对象
- 前景层：预留
- 舞台层
	- atmosphere 大气层：预留，目前无渲染对象
	- surface 地表层：渲染物件和玩家
	- ground 地皮：渲染Tarrain
- 背景层若干[2~3层]：最后一层为天空盒

#### 管理器
控制游戏里的逻辑实体，manager负责和服务器沟通，改变这些实体当前的状态。实体包括逻辑部分和显示对象，显示对象可以添加/移除到对应图层。  
- UI-manager `游戏层面`
- Tarrain-manager`场景层面`
- Element-manager`场景层面`
	- NonePlayer-Element：物件/NPC 
	- Player（actor）：玩家/其他玩家
- Room-manager`游戏层面`：管理场景，这里用Room替代Scene 免去和Phaser.Scene混淆

#### 实体：NonePlayer-Element & Player 
物件/NPC/玩家/其他玩家，都从Element衍生，Element具有的特性：
- Display
	- DragonBone
	- Sprite-Sheet or Single-Image
	- 有单体的显示图层，用来支援特效的加入： 前/中/后层
- 可任意方位移动
- package：道具包裹
    - items：道具
 
#### 实体：Room
场景，为了和Phaser.Scene区分用Room称呼。 Room具有的特性
- Camera： 镜头控制（Phaser.Cameras.Scene2D. Camera）
- 处理场景中的消息
- `成员` 地块管理器
- `成员` 物件管理器


# H5使用方法
Game Core 以umd方式打包，暴露的全局module 名为 ‘TooqingCore’。
TooqingCore下有Launcher类提供游戏启动方法和外部依赖的注册。

## Launcher.start(config)
启动游戏 默认游戏会将canvas填充到 document.div<#game> 标签里。
接受一个配置对象：
```
config = {
  auth_token?: string; // 用户登陆数据不给则出现游戏内登陆界面
  token_expire?: string | null; // 同上
  token_fingerprint?: string; // 同上
  game_id: string; // 必要
  virtual_world_id?: string; // 默认 0 
  width: number | string; // 游戏宽
  height: number | string; // 游戏高
  ui_scale?: number; // 游戏缩放比例默认 1
  gateway: {
    host: string;
    port: number;
    secure?: boolean;
  }
}
```

## Launcher.registerReload(callback_Function)
游戏内请求刷新页面的方法。
游戏需要强制重载页面时调用 callback_Function()

## Launcher.onResize(Width, Height);
游戏缩放/改变尺寸时需要调用的方法

## 前端指令集归纳：
打开、关闭调试信息:
```
##log [v] [q] 
```
打开、关闭物理碰撞区域显示:
```
##box [v] [q]
```
打开、关闭编辑网格显示：
```
##grids [v] [q]
```
打开、关闭寻路点（可行走为绿点、不可行走为红点）显示:
```
##astar [v] [q]
```
_`[v]`可省略_
