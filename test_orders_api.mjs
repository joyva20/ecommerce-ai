// Test orders API using axios
import axios from 'axios';

async function testOrdersAPI() {
  try {
    console.log('🧪 Testing Orders API...');
    
    const response = await axios.get('http://localhost:4000/api/order/list');
    const data = response.data;
    
    console.log('📊 API Response:', {
      success: data.success,
      ordersCount: data.orders ? data.orders.length : 0
    });
    
    if (data.orders && data.orders.length > 0) {
      console.log('\n📦 First Order Structure:');
      const firstOrder = data.orders[0];
      console.log({
        _id: firstOrder._id,
        userID: firstOrder.userID,
        amount: firstOrder.amount,
        payment: firstOrder.payment,
        status: firstOrder.status,
        items: firstOrder.items ? `${firstOrder.items.length} items` : 'no items'
      });
      
      if (firstOrder.items && firstOrder.items.length > 0) {
        console.log('\n📱 First Item in Order:');
        console.log(firstOrder.items[0]);
      }
      
      // Check paid orders
      const paidOrders = data.orders.filter(order => order.payment === true);
      console.log(`\n💳 Paid Orders: ${paidOrders.length}/${data.orders.length}`);
      
      if (paidOrders.length > 0) {
        const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.amount || 0), 0);
        console.log(`💰 Total Revenue: ${totalRevenue}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrdersAPI();
