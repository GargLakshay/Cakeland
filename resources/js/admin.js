import axios from 'axios'
import moment from 'moment'
import Noty from 'noty'

function initAdmin(socket){
  const orderTableBody=document.querySelector('#orderTableBody')
  let orders=[]
  let markup
  axios.get('/admin/orders',{
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  }).then(res=>{
    orders=res.data
    markup=generateMarkup(orders)
    orderTableBody.innerHTML=markup
    console.log(orderTableBody.innerHtml)
  }).catch(err=>{
    console.log(err)
  })

  function renderItems(items){
    let parsedItems=Object.values(items)
    return parsedItems.map((menuItem)=>{
      return `
        <p>${ menuItem.item.name} - ${menuItem.qty} pcs </p>
      `
    }).join('')
  }

  function generateMarkup(orders){
    return orders.map(order => {
      // console.log(orders)
      return `
      <tr>
         <td class="border px-2 py-2 text-green-900">
            <p> ${order._id} </p>
            <div> ${ renderItems(order.items) } </div>
         </td>
         <td class="border px-2 py-2"> ${order.customerId.name} </td>
         <td class="border px-2 py-2"> ${order.address} </td>

         <td class="border px-2 py-2">
            <div class="inline-block relative w-64">
              <form action="/admin/order/status" method="post">
                <input type="hidden" name="orderId" value="${order._id}">
                  <select name="status" onchange="this.form.submit()" class="block-apperance-none w-full
                   bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shdaow
                    leading-tight focus:outline-none focus:shadow-outline">

                    <option value="order_placed" ${order.status ==='order_placed'?'selected':''}>
                    Placed </option>
                    <option value="confirmed" ${order.status ==='confirmed'?'selected':''}>
                    Confirmed </option>
                    <option value="prepared" ${order.status ==='prepared'?'selected':''}>
                    Selected </option>
                    <option value="delivered" ${order.status ==='delivered'?'selected':''}>
                    Delivered </option>
                    <option value="completed" ${order.status ==='completed'?'selected':''}>
                    Completed </option>
                 </select>
              </form>

              <div>
              </div>
            </div>
         </td>
         <td class="border px-4 py-2">
            ${moment(order.createdAt).format('hh:mm A') }
         </td>
      </tr>
      `
    }).join('')
  }
// let socket=io()
  socket.on('orderPlaced',(order)=>{
    new Noty({
      type: 'success',
      timeout: 1000,
      progressBar: false,
      // layout: 'bottomLeft',
      text: "New order Placed!!"
    }).show();
    orders.unshift(order)
    orderTableBody.innerHTML =''
    orderTableBody.innerHTML =generateMarkup(orders)
  })

}
export default initAdmin
// module.exports = initAdmin
