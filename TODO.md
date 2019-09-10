TODO List
===

## 调研
- [x] Webworker + Webpack ：[github repository](https://github.com/askdaddy/ts-webworker-webpack) `@seven`
- [x] Webpack 动态加载代码块。
- [x] 版本控制。根据版本列表加载主程序 `@gxm`
- [x] 深度排序 `@404`

## 工程
- [x] Phaser3 + isometric项目运行 `@404`
- [x] 编入龙骨 `@404`

## 编码
- [x] SocketConnection via webworker: ./net `@seven`
- [x] launcher `@gxm`
- [x] 游戏主程序 : ./game `@404`
- [x] 游戏运行态（Phaser.Scene）: ./scenes `@404` 21号
- [ ] 资源动态加载 `@404`
- [ ] 游戏结构 `@seven`
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
- [ ] /* WIP */ 人物、物件同步 `@404` 周四 9月12日

### UI `@404 @gxm`
  - 封装rex 9月11日-9月19日
  - 打开、更新面板（SHOW_UI、UPDATE_UI、CLOSE_UI）
  - 道具相关 `@gxm` 9月23日-9月26日 
    - 背包
    - 快捷栏
    - 背包、快捷栏更新
    - 道具使用
  - 聊天 `@gxm`9月20日-9月21日
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
- [ ] 虚拟摇杆，虚拟按键
- [ ] UI适配
- [ ] 微信小游戏
