TODO List
===
> 2020-10
## rpc模块拆分
- [ ]render 部分拆分  周围
  - [ ] Phaser场景管理-sceneManager
  - [ ] Phaser镜头管理-cameraManager
  - [ ] 多帧显示对象管理-frameDisplayManager
  - [ ] 龙骨显示对象管理-dragonBonesDisplayManager
  - [ ] 显示对象管理-elementDisplayManager
  - [ ] 地块显示对象管理-terrainDisplayManager
  - [ ] 墙体显示对象管理-wallDisplayManager
  - [ ] ui显示对象管理-uiManager
  - [ ] 显示对象层级管理-layerManager
  - [ ] Phaser声音管理-soundManager
  - [ ] Phaser交互管理-inputManager
  - [ ] 特效显示对象管理-effectManager
  - [ ] 特效显示对象管理-falleffectManager
  - [ ] 编辑模式下显示对象管理-editor
  - [ ] 气泡显示对象管理-bubbleManager
  - [ ] 加载管理-loadingManager
  - [ ] 动画管理-animationManager
- [ ]game 部分拆分 张腾 管晓敏
  - [x] 游戏登陆数据管理-account
  - [x] 游戏时间管理（游戏服务器同步）-clock
  - [x] 游戏时间管理（游戏后台同步）-httpclock
  - [x] 游戏net管理-connect
  - [ ] 房间管理-roomManager
    - [ ] 房间对象-room
      - [ ] 编辑房间-editorRoom
      - [ ] 装饰房间-decorateRoom
    - [ ] 角色管理-playerManager
      - [ ] 角色逻辑对象-player
    - [ ] 元素管理-elementManager
      - [ ] 元素逻辑对象-element
        - [ ] 逻辑对象数据
          - [ ] 多帧显示对象数据-frameModel
            - [ ] 显示对象动画数据 - animation
          - [ ] 龙骨显示对象数据-dragonBonesModle
            - [ ] 显示对象动画数据 - animation
          - [ ] 显示对象proto数据-isprite
    - [ ] 地块管理-terrainManager 张腾
      - [ ] 地块对象 - terrain
    - [ ] 墙块管理-wallManager 张腾
      - [ ] 墙块对象 - wall
    - [ ] 群体事件管理-groupManager 管晓敏
      - [ ] 跟随族群 - followGroup
    - [ ] 群体事件管理-frameManager 管晓敏
    - [ ] 特效管理-effectManager 管晓敏
      - [ ] 特效对象 - effect
    - [ ] 区块管理-blockManager 张腾
      - [ ] 区块对象 - block
    - [ ] 天空盒管理-skyBoxManager 张腾
      - [ ] 天空盒逻辑对象 - logicbackgroundDisplay
> older
## 调研
- [x] Webworker + Webpack ：[github repository](https://github.com/askdaddy/ts-webworker-webpack) `@seven`
- [x] Webpack 动态加载代码块。
- [x] 版本控制。根据版本列表加载主程序 `@gxm`
- [x] 深度排序 `@404`
- [ ] SmoothedKeyControl 镜头平滑研究

## 工程
- [x] Phaser3 + isometric项目运行 `@404`
- [x] 编入龙骨 `@404`

## 编码
- [x] SocketConnection via webworker: ./net `@seven`
- [x] launcher `@gxm`
- [x] 游戏主程序 : ./game `@404`
- [x] 游戏运行态（Phaser.Scene）: ./scenes `@404` 21号
- [ ] 资源动态加载 `@404`
- [x] 游戏结构 `@seven` (长期的)
- [x] * WIP * 层级管理 `@gxm @404`周一19号
  - UI层：渲染UI对象
  - 前景层：预留
  - 舞台层
    - atmosphere 大气层：预留，目前无渲染对象
    - surface 地表层：渲染物件和玩家
    - ground 地皮：渲染Tarrain
  - 背景层若干[2~3层]：最后一层为天空盒
  - **跟随镜头移动的层在PlayScene中，其它在UIScene**
- [x] 将Terrain添加到ground层 `@404 @gxm` 24号
  - 使用`45°`格子坐标
  - [ ] 深度排序 
- [x] 物件添加到surface层 `@404 @gxm` 23号上午
  - 使用`90°`直角坐标
  - [ ] 深度排序 
- [ ] 添加z轴实现深度 `@404` 9月3日
- [ ] surface层对象`x,y,z`变化, 修改depth `@404` 9月3日
- [x] 鼠标事件管理 `@gxm`周三21号
- [x] keyboard管理 `@gxm`周二20号
  - `wasd、方向键`控制角色移动
  - `按下、松开`的键告诉服务器 
- [x] 人物移动逻辑 `@gxm`
  - 先改状态，不移动，等服务端发送信息再移动,客户端先停止，等服务端调整
  - 移动修改对应动画和方向  暂时只做了通过服务器移动，客户端移动需要和角色状态管理同步进行 9月6日
  - [ ] 深度排序 
- [x]  物件动画 `@404` 28号
- [x] 镜头管理 `@404` 31号
- [x] 场景缩放 `@404`
- [x] dragonbones换装 `@gxm` 周二27号
- [x] 物件、Character像素级选择 `@gxm` 30号
- [x] 动画状态管理 `@gxm` 角色状态管理 9月6日
- [ ] resize `@404` 需和美术沟通 时间待定
- [x] Character特效 `@gxm`周一 9月2号
- [ ] loadingPlugin `@gxm`
- [x] 人物、物件同步 `@404` 周四 9月12日

### 10.1前UI
- [ ] /* WIP */ 聊天框 `@404`
    - [ ] 聊天框
    - [x] 语音聊天
    - [x] 聊天气泡
- [ ] 背包、物件背包 `@gxm`
- [ ] 碰撞交互提示 `待定`
- [ ] 玩家信息面板 `@404`
- [ ] 内购商城 `gxm`

### UI `@404 @gxm`
  -[x] 封装rex 9月11日-9月19日
  - 打开、更新面板（SHOW_UI、UPDATE_UI、CLOSE_UI）
  - 道具相关 `@gxm` 9月19日-9月21日 
    - 背包
    - 快捷栏
    - 背包、快捷栏更新
    - 道具使用
  - 聊天 `@gxm`9月23日-9月25日
    - 聊天框
      - 语音聊天
    - 聊天气泡
      - 自定义样式、delay
      - 截取人物头像
  - 互动面板 `@gxm` 9月27日
  - 公告面板 `@gxm` 9月28日
  - 排行榜和物件排行榜 `@gxm` 9月28日-9月30日
  - 内购商城 `@gxm`
  - 确认框（Message Box）`@gxm`
  - Tooltips`@gxm`
  - 角色头顶信息`@gxm`
  - 角色Menu
  - 角色详情
  - VIP特效
  - 证物面板
  - 物件（storage）背包
  - 投票面板
  - 投票结果
  - ~~RoleInfo~~

### 移动端适配
- [x] 虚拟摇杆，虚拟按键
- [ ] UI适配
- [ ] 微信小游戏
