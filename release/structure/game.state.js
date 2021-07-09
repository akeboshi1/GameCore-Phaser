export var GameState;
(function(GameState2) {
  GameState2["NoState"] = "NoState";
  GameState2["Init"] = "Init";
  GameState2["Login"] = "Login";
  GameState2["Connecting"] = "Connecting";
  GameState2["EnterWorld"] = "EnterWorld";
  GameState2["GameRunning"] = "GameRunning";
  GameState2["ChangeGame"] = "ChangeGame";
  GameState2["OffLine"] = "OffLine";
})(GameState || (GameState = {}));
export var ConnectState;
(function(ConnectState2) {
  ConnectState2[ConnectState2["StartConnect"] = 0] = "StartConnect";
  ConnectState2[ConnectState2["Connect"] = 1] = "Connect";
  ConnectState2[ConnectState2["ReConnect"] = 2] = "ReConnect";
  ConnectState2[ConnectState2["CloseConnect"] = 3] = "CloseConnect";
  ConnectState2[ConnectState2["DisConnect"] = 4] = "DisConnect";
})(ConnectState || (ConnectState = {}));
export var SceneState;
(function(SceneState2) {
  SceneState2[SceneState2["ScenePreLoad"] = 0] = "ScenePreLoad";
  SceneState2[SceneState2["SceneCreate"] = 1] = "SceneCreate";
  SceneState2[SceneState2["SceneChange"] = 2] = "SceneChange";
})(SceneState || (SceneState = {}));
export var PlayerState;
(function(PlayerState2) {
  PlayerState2["IDLE"] = "idle";
  PlayerState2["WALK"] = "walk";
  PlayerState2["RUN"] = "run";
  PlayerState2["ATTACK"] = "attack";
  PlayerState2["JUMP"] = "jump";
  PlayerState2["INJURED"] = "injured";
  PlayerState2["FAILED"] = "failed";
  PlayerState2["DANCE01"] = "dance01";
  PlayerState2["DANCE02"] = "dance02";
  PlayerState2["FISHING"] = "fishing";
  PlayerState2["GREET01"] = "greet01";
  PlayerState2["SIT"] = "sit";
  PlayerState2["LIE"] = "lit";
  PlayerState2["EMOTION01"] = "emotion01";
})(PlayerState || (PlayerState = {}));
export var PhysicalPeerState;
(function(PhysicalPeerState2) {
  PhysicalPeerState2[PhysicalPeerState2["CREATEWORLD"] = 0] = "CREATEWORLD";
  PhysicalPeerState2[PhysicalPeerState2["DESTROYWORLD"] = 1] = "DESTROYWORLD";
})(PhysicalPeerState || (PhysicalPeerState = {}));
