require('dotenv').config()
const express=require('express')
const app=express()
const ejs=require('ejs')
const path=require('path')
const expressLayout=require('express-ejs-layouts')
const mongoose=require('mongoose');
const session=require('express-session')
const flash=require('express-flash')
const passport=require('passport')
const MongoDbStore=require('connect-mongo')(session)
const Emitter = require('events')

//Database connection
const url= 'mongodb+srv://admin-Cakeland:test123@cluster0.nwapp.mongodb.net/Cakeland';
mongoose.connect(url,{useNewUrlParser: true}) ;
const connection=mongoose.connection;
connection.once('open',()=>{
  console.log('Database connected..');
});
// .catch ( (err) => {
//   console.log('connection failed..')
// });

//event emitter
const eventEmitter=new Emitter()
app.set('eventEmitter',eventEmitter)

//session store
let mongoStore= new MongoDbStore({
  mongooseConnection:connection,
  collection: 'sessions'
})


//session config
app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  store: mongoStore,
  saveUninitialized: false,
  cookie: {maxAge: 1000*60*60*24}
}))
app.use(flash())

//passport config
app.use(passport.initialize())
app.use(passport.session())
const passportInit= require('./app/config/passport')
passportInit(passport)

//Assets
app.use(express.static("public"))
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//global middleware
app.use((req,res,next)=>{
  res.locals.session = req.session
  res.locals.user=req.user
  next();
})


//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,"/resources/views"))
app.set('view engine', 'ejs')

require('./routes/web')(app)

const PORT=process.env.PORT||3000;
const server = app.listen(PORT,function(){
  console.log("server is running successfully");
})


//socket
const io=require('socket.io')(server)
io.on('connection',(socket)=>{
  //join
  // console.log(socket.id)
  socket.on('join',(orderId)=>{
    // console.log(orderId)
    socket.join(orderId)
  })
})

eventEmitter.on('orderUpdated',(data)=>{
  io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
  io.to('adminRoom').emit('orderPlaced',data)
})
