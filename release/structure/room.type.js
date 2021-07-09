var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
export class RoomType {
}
__publicField(RoomType, "EPISODE", "episode");
__publicField(RoomType, "ROOM", "room");
__publicField(RoomType, "DUNGEON", "dungeon");
