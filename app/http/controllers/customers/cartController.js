function cartController(){
   return {
     index(req,res){
        res.render('customers/cart')
     },
     update(req,res){
       // let cart = {
       //   items:{
       //     cakeid1:{ item:cake_object,qty:0};
       //     cakeid2:{ item:cake_object,qty:0};
       //   },
       //   totalqnt:0,
       //   totalPrice:0
       // }

//for the first creating cart and adding basic object structure
       if(!req.session.cart){
         req.session.cart = {
           items :{ },
           totalQty:0,
           totalPrice:0
         }
       }
       let cart=req.session.cart
       //check if item does not exist in cart
       if(!cart.items[req.body._id]){
         cart.items[req.body._id]={
           item:req.body,
           qty:0
         }
       }
         cart.items[req.body._id].qty=cart.items[req.body._id].qty+1;
         cart.totalQty=cart.totalQty+1;
         cart.totalPrice=cart.totalPrice+req.body.price

       return res.json({totalQty:cart.totalQty})
     }

   }
}

module.exports =cartController
