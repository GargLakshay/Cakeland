const Menu = require('../../models/menu')
function homeController(){
   return {
     async index(req,res){
       const cakes = await Menu.find();
        res.render('home',{cakes:cakes})
     }
   }
}

module.exports =homeController
