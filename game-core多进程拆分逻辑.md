============渲染进程render
Class Render extends RPCPeer {

    // 尝试连接
    Public startConnect(gateway:ServerAddress){
       MainWorker.startConnect(gateway)
   }

  // 链接成功后通知render
  @Export([webworker_rpc.ParamType.num])
   Public onConnected( moveStyle:number){
       // todo 更新链接状态
   }

   // 断开链接
   Public closeConnect( ) {
      MainWorker.closeConnect( );
   }

   // 链接断开后通知render
   @Export( )
   Public onDisconnected( ) {
      // todo 更新链接状态
   }

  // 链接错误后通知render
   @Export( )
   Public onConnectError( ){
      // todo 更新链接状态
   }

  // 尝试重联
   @Export( ) 
   Public reconnect( ){
     MainWorker.reconnect( );
   }

   // 获取进入游戏的对应gameid，worldid，sceneid，角色位置
   @Export([webworker_rpc.ParamType.str, webworker_rpc.ParamType.str, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num, webworker_rpc.ParamType.num])
   Public onGotoAnotherGame( gameid:string, worldid:string, sceneid?:number, x?:number, y?:number, z?:number){
       // todo world.gotoanothergame(gamed,worldid,sceneid,x,y,z);
  }

    // 初始化主进程的world逻辑
    Public initWorld( ) {
        MainWorker.initWorld( );
    }
   
    // 通知render可以进入world
    Public enterVirtualWorld( ){
       // 通知render进入world
    }

  // 初始化world中逻辑管理
   Public initGame( ) {
     MainWorker.initGame( );
   }

 // 发送协议给主进程
  Public send(packet:PBpacket)
    MainWorker.send(packet);
   }

 // 请求关闭主进程worker，subworkers等 
  Public  terminate( ) {
    MainWorker.terminate( );
  }

 // game-core  通知主进程获取焦点
  Public onFocus( ){
    MainWorker.onFocus( );
  }

 // game-core 通知主进程失去焦点
  Public onBlur( ){
    MainWorker.onBlur( );
  }
  
  // 同步clock时间戳
  Public syncClock(times:number){
     MainWorker.syncClock( times );
  }
  
  // 通知render clock同步完成 
  @Export( )
  Public onClockReady( ){ 
     // 通知render clockReady
  }
  // 清除clock异步
  Public clearClock( ){
     MainWorker.clearClock( );
  }
}

===========主进程mainworker
Class MainPeer extends RPCPeer {
    private logicWorld( 主进程逻辑world类，用于管理各个逻辑管理器)
    private socket （socket 通信）

    // render通知主进程send pbpacket
    @Export([webworker_rpc.ParamType….])
    public send(buffer:Buffer ){
          socket.send(buffer);
    }

    // render通知主进程开始链接
    @Export([webworker_rpc.ParamType….])
    public startConnect(host:string, port:number, secure?:boolean ){
          Const addr:ServerAddress = {host , port , secure};
          socket.startConnect(adds);
    }

    // 初始化主进程，包括各个manager,并添加socket事件监听
    @Export( )
    public initWorld( ) {
        // 主进程初始化
    }
   
     // 初始化主进程的game实例（登陆游戏&切换游戏&重联会用到）
    @Export( )
    public initGame( ) {
       // 主进程初始化game实例
    }

    // 主进程通知render链接成功
    Public onConnected(moveStyle:number ){
         Render.onConnected( moveStyle );
         
         startHeartBeat( );
        
         LogicWorld.onConnected( );
   }

   // 主进程通知render链接失败
   public onDisConnect( error:string ){
        Render.onDisConnect( );

        endHeartBeat( );
        
        LogicWorld.onDisConnect( );
   }

   // 主进程通知render链接错误
   public onConnectError( error:string ){
        Render.onConnectError( );

        endHeartBeat( );
        
        LogicWorld.onConnectError( );
   }

   // 主进程收到socket信息后，内部进行事件派送
   Public onData(buffer:Buffer ) {

       LogicWorld.onData(buffer);
   }

   // 主进程通知render 玩家进入游戏，且在某个初始点
   public createAnotherGame(gamed:string, worldid:string, sceneid?:number, x?:number , y?:number, z?:number)
       Render.creaeteAnotherGame( gameid, worldId, sceneid , x, y, z);
  }
  
  // 主进程通知render 可以
  Public enterVirtualWorld( ){
      Render.enterVirtualWorld( );
  }
  
  // render通知主进程设置size
  @Export([webworker_rpc...])
  Public setSize( width,height){
     // render 通知主进程 设置游戏size
 }

 // 主进程开始心跳，发送心跳协议给后端
 Public heartBeat( ){
     socket.send(heartBeat);
 }

   //主进程通知各个peer做重联操作
   @Export( )
   Public reconnect( ){
     // reconnect
  }

  // 主进程同步clock
  public syncClock(times:number ){
     // syncClock
  }

  // 主进程清除clock
  public clearClock( ){
    // clearClock
  }
  
  // 主进程通知各个peer 停止
  Public terminate( ){
     // 主进程通知各个peer 停止
  }
}
