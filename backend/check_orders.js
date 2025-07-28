const mongoose = require('mongoose');
require('./config/mongodb');

const orderModel = require('./models/orderModel');

async function checkOrders() {
  try {
    const orders = await orderModel.find({}).limit(3);
    console.log('📊 Sample orders structure:');
    orders.forEach((order, i) => {
      console.log(`Order ${i + 1}:`, {
        _id: order._id,
        userId: order.userId,
        items: order.items,
        amount: order.amount,
        address: order.address ? 'present' : 'missing',
        status: order.status,
        paymentMethod: order.paymentMethod,
        payment: order.payment,
        date: order.date
      });
      
      console.log(`Order ${i + 1} Items Detail:`);
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, idx) => {
          console.log(`  Item ${idx}:`, item);
        });
      }
      console.log('---');
    });
    
    console.log('📈 Total orders:', orders.length);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrders();
