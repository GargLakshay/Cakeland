const Order=require('../../../models/order')
const moment=require('moment')
const stripe=require('stripe')(process.env.STRIPE_PRIVATE_KEY)

const f='fontFamily'
function orderController(){
  return{
    store(req,res){

      //validate request
      const {phone,address,stripeToken,paymentType}=req.body
      if(!phone||!address){
        return res.status(422).json({message: 'All fields are required'})
      }

      const order = new Order({
        customerId:req.user._id,
        items: req.session.cart.items,
        phone: phone,
        address: address
      })
      order.save().then(result =>{
        Order.populate(result,{path: 'customerId'},(err,placedOrder)=>{
          // req.flash('success','Order Placed Successfully')

          //stripe payment
          if(paymentType==='card'){
            stripe.charges.create({
              amount:req.session.cart.totalPrice * 100,
              source: stripeToken,
              currency: 'inr',
              description:`Cake order: ${placedOrder._id}`
            }).then(()=>{
              placedOrder.paymentStatus = true
              placedOrder.paymentType = paymentType
              placedOrder.save().then((ord)=>{
                //emit
                const eventEmitter= req.app.get('eventEmitter')
                eventEmitter.emit('orderPlaced',ord)
                  delete req.session.cart
                return res.json({message: 'Payment succesful, Order Placed Successfully'})
              }).catch((e)=>{
                console.log(e)
              })
            }).catch((err)=>{
              console.log(err)
                delete req.session.cart
              return res.json({message: 'OrderPlaced but Payment failed, You can pay at delivery time'})
            })
          }else{
              delete req.session.cart
            return res.json({message: 'Order Placed succesfully'})

          }
  })
      }).catch(err=>{
        return res.status(500).json({message: 'Something went wrong'})
      })
    },
    async index(req,res){
      const orders= await Order.find(
        { customerId:req.user._id },
        null,
        {sort:{'createdAt':-1}}
      )
      res.render('customers/orders',{orders:orders,moment:moment})
    },
    async show(req,res){
      const order = await Order.findById(req.params.id);
      // Authorise user
      if(req.user._id.toString() === order.customerId.toString() ){
         return res.render('customers/singleOrder',{order})
      }
      return res.redirect('/')
    }
  }
}

module.exports = orderController
