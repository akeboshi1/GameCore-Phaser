import { LogicPos, Position45 } from "structure";
export function transitionGrid(x, y, alignGrid, roomSize) {
  const source = new LogicPos(x, y);
  const pos = Position45.transformTo45(source, roomSize);
  if (alignGrid === false) {
    return checkBound(roomSize, pos, source);
  }
  return checkBound(roomSize, pos, void 0);
}
function checkBound(roomSize, pos, source) {
  const bound = new LogicPos(pos.x, pos.y);
  if (pos.x < 0) {
    bound.x = 0;
  } else if (pos.x > roomSize.cols) {
    bound.x = roomSize.cols;
  }
  if (pos.y < 0) {
    bound.y = 0;
  } else if (pos.y > roomSize.rows) {
    bound.y = roomSize.rows;
  }
  if (bound.equal(pos) && source) {
    return source;
  }
  return Position45.transformTo90(bound, roomSize);
}
