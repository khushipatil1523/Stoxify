const {model} = require("mongoose");

const {PositionSchema}=require('../schemas/PositionSchema');

const PositionsModel=new model("positions",PositionSchema);

module.exports={PositionsModel};