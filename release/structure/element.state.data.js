export var ElementStateType;
(function(ElementStateType2) {
  ElementStateType2["NONE"] = "none";
  ElementStateType2["UNFROZEN"] = "unfrozen";
  ElementStateType2["REPAIR"] = "repair";
})(ElementStateType || (ElementStateType = {}));
export var ElementState;
(function(ElementState2) {
  ElementState2[ElementState2["NONE"] = 0] = "NONE";
  ElementState2[ElementState2["INIT"] = 1] = "INIT";
  ElementState2[ElementState2["DATAINIT"] = 2] = "DATAINIT";
  ElementState2[ElementState2["DATAUPDATE"] = 3] = "DATAUPDATE";
  ElementState2[ElementState2["DATADEALING"] = 4] = "DATADEALING";
  ElementState2[ElementState2["DATACOMPLETE"] = 5] = "DATACOMPLETE";
  ElementState2[ElementState2["PREDESTROY"] = 5] = "PREDESTROY";
  ElementState2[ElementState2["DESTROYED"] = 6] = "DESTROYED";
})(ElementState || (ElementState = {}));
