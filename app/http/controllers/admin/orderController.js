const order = require('../../../models/order')

function orderController(){
  return {
    index(req,res){
      order.find({status:{$ne: 'completed'}},null,{sort:{'createdAt':-1}}).
      populate('customerId','-password').exec((err,orders)=>{
        if(req.xhr){
          return res.json(orders)
        } else
         {
           // console.log(orders)
          return res.render('admin/orders')
         }
      })
    }
  }
}

module.exports= orderController
