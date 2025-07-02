const {model} = require("mongoose");

const {OrderSchema}=require('../schemas/OrderSchema');

const OrdersModel=new model("orders",OrderSchema);

module.exports={OrdersModel};