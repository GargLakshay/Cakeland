import axios from 'axios'
import Noty from 'noty'
import initAdmin from './admin'
import moment from 'moment'
import {initStripe} from './stripe'

let addToCart = document.querySelectorAll('.add-to-cart')

let cartCounter = document.querySelector('#cartCounter')

function updateCart(cake) {
  axios.post('/update-cart', cake).then(res => {
    cartCounter.innerText = res.data.totalQty;
    new Noty({
      type: 'success',
      timeout: 1000,
      progressBar: false,
      // layout: 'bottomLeft',
      text: "Item added to Cart"
    }).show();
  }).catch(err =>{
    new Noty({
      type: 'error',
      timeout: 1000,
      progressBar: false,
      // layout: 'bottomLeft',
      text: "Something went wrong"
    }).show();
  })
}

addToCart.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    let cake = JSON.parse(btn.dataset.cake);
    updateCart(cake)
  })
})

//remove alert message after X seconds
const alertMsg = document.querySelector('#success-alert')
if(alertMsg){
  setTimeout(()=>{
    alertMsg.remove();
  },2000)
}



//change order status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput=document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value: null;
order = JSON.parse(order)
let  time= document.createElement('small')


function updateStatus(order){

  statuses.forEach((status)=>{
    status.classList.remove('step-completed')
    status.classList.remove('current')
  })

  let stepCompleted = true;
  statuses.forEach((status)=>{
    let dataProp=status.dataset.status
    if(stepCompleted){
      status.classList.add('step-completed')
    }
    if(dataProp === order.status){
      stepCompleted = false;
      time.innerText=moment(order.updatedAt).format('hh:mm A')
      status.appendChild(time)
      if(status.nextElementSibling)
      status.nextElementSibling.classList.add('current')
    }
  })

}

updateStatus(order);
initStripe()

//socket
let socket = io()

// join
if(order){
socket.emit('join', `order_${order._id}`)
}

let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')){
  initAdmin(socket)
  socket.emit('join','adminRoom')
}

socket.on('orderUpdated',(data)=>{
  const updatedOrder={...order}
  updatedOrder.updatedAt = moment().format()
  updatedOrder.status= data.status
  updateStatus(updatedOrder)
  new Noty({
    type: 'success',
    timeout: 1000,
    progressBar: false,
    // layout: 'bottomLeft',
    text: "Order Updated!!"
  }).show();
})

var loginForm = document.getElementById("loginForm");

document.getElementById("loginBtn").addEventListener("click", function () {
  loginForm.submit();
});
