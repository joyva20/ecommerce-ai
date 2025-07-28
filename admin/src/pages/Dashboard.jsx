import { useEffect, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import axios from 'axios';
import { backendURL } from '../App';
import { toast } from 'react-toastify';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const Dashboard = ({ token }) => {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    productsByCategory: {},
    productsByType: {},
    recentOrders: [],
    salesTrend: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);
  const [isRealTime, setIsRealTime] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextRefreshIn, setNextRefreshIn] = useState(30);

  // Fetch dashboard data using existing endpoints
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch data from existing endpoints in parallel
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        axios.get(`${backendURL}/api/product/list`),
        axios.post(`${backendURL}/api/order/list`, {}, { headers: { token } }),
        axios.get(`${backendURL}/api/user/list`)
      ]);

      // Debug: Log API responses
      console.log('📡 API Responses:', {
        products: productsRes.data.success ? `${productsRes.data.products?.length || 0} products` : 'failed',
        orders: ordersRes.data.success ? `${ordersRes.data.orders?.length || 0} orders` : 'failed',
        users: usersRes.data.success ? `${usersRes.data.users?.length || 0} users` : 'failed'
      });

      // Process products data
      let products = [];
      if (productsRes.data.success) {
        products = productsRes.data.products;
      }

      // Process orders data  
      let orders = [];
      if (ordersRes.data.success) {
        orders = ordersRes.data.orders;
      }

      // Process users data
      let users = [];
      if (usersRes.data.success) {
        users = usersRes.data.users;
      }

      // Calculate dashboard metrics
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalUsers = users.length;

      // Debug: Check first few orders structure
      console.log('🔍 First 3 orders raw data:', orders.slice(0, 3));
      
      // Calculate total revenue from paid orders only
      const paidOrders = orders.filter(order => order.payment === true);
      console.log('💳 Payment Status Check:', {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        paymentStatuses: orders.map(order => ({ id: order._id, payment: order.payment, amount: order.amount }))
      });
      
      // Calculate revenue with multiple fallback methods
      let totalRevenue = 0;
      
      if (paidOrders.length > 0) {
        totalRevenue = paidOrders.reduce((sum, order) => {
          // Method 1: Use order.amount if available
          if (order.amount && !isNaN(order.amount)) {
            const amount = parseFloat(order.amount);
            console.log(`💰 Order ${order._id}: Using order.amount=${amount}`);
            return sum + amount;
          }
          
          // Method 2: Calculate from items if amount is missing
          if (order.items && Array.isArray(order.items)) {
            const itemsTotal = order.items.reduce((itemSum, item) => {
              const quantity = item.quanitity || item.quantity || 1; // Handle typo
              const price = item.price || 0;
              const itemTotal = quantity * price;
              console.log(`   📱 Item: qty=${quantity}, price=${price}, total=${itemTotal}`);
              return itemSum + itemTotal;
            }, 0);
            console.log(`💰 Order ${order._id}: Calculated from items=${itemsTotal}`);
            return sum + itemsTotal;
          }
          
          console.log(`⚠️ Order ${order._id}: No amount or items data`);
          return sum;
        }, 0);
      } else {
        console.log('⚠️ No paid orders found - calculating anyway from all orders for testing');
        // For testing, calculate from all orders if no paid orders found
        totalRevenue = orders.reduce((sum, order) => {
          if (order.amount && !isNaN(order.amount)) {
            return sum + parseFloat(order.amount);
          }
          return sum;
        }, 0);
      }

      console.log('💰 Final Revenue calculation:', {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        totalRevenue,
        sampleOrder: orders[0] // Show structure of first order
      });

      // Group products by category
      const productsByCategory = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Group products by subCategory (type)
      const productsByType = products.reduce((acc, product) => {
        const type = product.subCategory || 'Untyped';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});

      // Get recent orders (last 10)
      const recentOrders = orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      // Calculate top products based on order items
      const productSales = {};
      
      console.log('🔍 Debug: Processing orders for top products...', orders.length);
      
      orders.forEach((order, orderIndex) => {
        console.log(`📦 Order ${orderIndex}:`, {
          id: order._id,
          userID: order.userID, // Corrected field name
          items: order.items,
          itemsType: typeof order.items,
          itemsLength: order.items ? order.items.length : 'no items',
          payment: order.payment,
          amount: order.amount
        });
        
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item, itemIndex) => {
            console.log(`   📱 Item ${itemIndex}:`, item);
            
            // Handle the actual structure from PlaceOrder.jsx
            // Items contain full product object with typo in quantity field
            const productId = item._id;
            const quantity = item.quanitity || item.quantity || 1; // Handle typo + correct spelling
            const price = item.price || 0;
            
            console.log(`   🔍 Parsed: productId=${productId}, quantity=${quantity}, price=${price}`);
            
            if (productId) {
              if (!productSales[productId]) {
                productSales[productId] = {
                  totalOrdered: 0,
                  totalRevenue: 0,
                  productInfo: {
                    name: item.name || 'Unknown Product',
                    image: item.image?.[0] || '/placeholder.jpg'
                  }
                };
              }
              
              const parsedQuantity = parseInt(quantity) || 0;
              const parsedPrice = parseFloat(price) || 0;
              
              productSales[productId].totalOrdered += parsedQuantity;
              productSales[productId].totalRevenue += parsedQuantity * parsedPrice;
              
              console.log(`   ✅ Updated productSales[${productId}]:`, productSales[productId]);
            }
          });
        } else {
          console.log(`   ⚠️  Order ${orderIndex} has no valid items array`);
        }
      });

      console.log('📊 Final productSales:', productSales);

      // Map product sales with product info and get top 5
      const topProducts = Object.entries(productSales)
        .map(([productId, sales]) => {
          // Use stored productInfo from order items, fallback to products array
          const productFromOrder = sales.productInfo;
          const productFromDB = products.find(p => p._id === productId);
          
          console.log(`🔍 Mapping product ${productId}:`, {
            sales,
            productFromOrder,
            productFromDB: productFromDB ? { name: productFromDB.name, image: productFromDB.image?.[0] } : 'not found'
          });
          
          return {
            ...sales,
            _id: productId,
            name: productFromOrder?.name || productFromDB?.name || 'Unknown Product',
            image: productFromOrder?.image || productFromDB?.image?.[0] || '/placeholder.jpg'
          };
        })
        .filter(product => product.totalOrdered > 0) // Only include products with sales
        .sort((a, b) => b.totalOrdered - a.totalOrdered)
        .slice(0, 5);

      console.log('🏆 Final topProducts:', topProducts);

      // If no top products from orders, show some random products as fallback
      let finalTopProducts = topProducts;
      if (topProducts.length === 0 && products.length > 0) {
        console.log('📦 No sales data found, using product fallback...');
        finalTopProducts = products
          .slice(0, 5)
          .map((product) => ({
            _id: product._id,
            name: product.name,
            image: product.image?.[0] || '/placeholder.jpg',
            totalOrdered: 0, // No sales data available
            totalRevenue: 0,
            isFallback: true // Mark as fallback data
          }));
        console.log('🔄 Fallback topProducts:', finalTopProducts);
      }

      // Update dashboard state
      setDashboardData({
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        productsByCategory,
        productsByType,
        recentOrders,
        salesTrend: [], // Can be calculated if needed
        topProducts: finalTopProducts
      });

      setLastUpdate(new Date());
      
      if (isRealTime) {
        toast.success('Dashboard updated!', { 
          position: 'bottom-right',
          autoClose: 2000,
          hideProgressBar: true 
        });
      }

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token, isRealTime]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time auto refresh every 30 seconds
  useEffect(() => {
    let interval;
    let countdownInterval;
    
    if (isRealTime) {
      // Reset countdown
      setNextRefreshIn(30);
      
      // Main refresh interval
      interval = setInterval(() => {
        fetchDashboardData();
        setNextRefreshIn(30); // Reset countdown
      }, 30000); // 30 seconds
      
      // Countdown timer interval
      countdownInterval = setInterval(() => {
        setNextRefreshIn(prev => {
          if (prev <= 1) {
            return 30; // Reset when reaches 0
          }
          return prev - 1;
        });
      }, 1000); // Every second
    }
    
    return () => {
      if (interval) clearInterval(interval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [isRealTime, fetchDashboardData]);

  // Manual refresh function
  const handleManualRefresh = () => {
    toast.info('Refreshing dashboard...', { 
      position: 'bottom-right',
      autoClose: 1000 
    });
    fetchDashboardData();
  };

  // Toggle real-time mode
  const toggleRealTime = () => {
    setIsRealTime(!isRealTime);
    if (!isRealTime) {
      toast.success('Real-time mode enabled!', { 
        position: 'bottom-right',
        autoClose: 2000 
      });
    } else {
      toast.info('Real-time mode disabled', { 
        position: 'bottom-right',
        autoClose: 2000 
      });
    }
  };

  // Chart configurations
  const categoryChartData = {
    labels: Object.keys(dashboardData.productsByCategory),
    datasets: [
      {
        label: 'Products by Category',
        data: Object.values(dashboardData.productsByCategory),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(dashboardData.productsByType),
    datasets: [
      {
        label: 'Products by Type',
        data: Object.values(dashboardData.productsByType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Real-time Controls */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard overview</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            {isRealTime && (
              <span className="ml-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                Live
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Next refresh in {nextRefreshIn}s
                </span>
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Real-time Toggle */}
          <button
            onClick={toggleRealTime}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isRealTime 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {isRealTime ? 'Real-time ON' : 'Real-time OFF'}
          </button>
          
          {/* Manual Refresh Button */}
          <button
            onClick={handleManualRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalProducts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalOrders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.totalUsers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">Rp {dashboardData.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Products by Category Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Products by Category</h3>
          {Object.keys(dashboardData.productsByCategory).length > 0 ? (
            <Bar 
              data={categoryChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: {
                    ...chartOptions.plugins.title,
                    text: 'Product Distribution by Category',
                  },
                },
              }} 
            />
          ) : (
            <div className="text-center text-gray-500 py-8">No category data available</div>
          )}
        </div>

        {/* Products by Type Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Products by Type</h3>
          {Object.keys(dashboardData.productsByType).length > 0 ? (
            <Pie 
              data={typeChartData} 
              options={{
                ...pieOptions,
                plugins: {
                  ...pieOptions.plugins,
                  title: {
                    ...pieOptions.plugins.title,
                    text: 'Product Distribution by Type',
                  },
                },
              }} 
            />
          ) : (
            <div className="text-center text-gray-500 py-8">No type data available</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Products</h3>
          {dashboardData.topProducts.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.isFallback ? (
                        <span className="text-orange-600">No sales data yet</span>
                      ) : (
                        <>
                          {product.totalOrdered} sold • Rp {product.totalRevenue?.toLocaleString()}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                      product.isFallback 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      #{index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">No sales data available</div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders</h3>
        {dashboardData.recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardData.recentOrders.slice(0, 10).map((order, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id?.slice(-6)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {order.address?.firstName} {order.address?.lastName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 font-medium">
                      Rp {order.amount?.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Order Placed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Packing' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Out for delivery' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">No recent orders</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
