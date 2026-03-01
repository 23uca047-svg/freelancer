import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Gigs from "./pages/Gigs";
import GigDetails from "./pages/GigDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Order from "./pages/Order";
import OrderTracking from "./pages/OrderTracking";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import SellerOrders from "./pages/SellerOrders";
import SellerDashboard from "./pages/SellerDashboard";
import MyAccount from "./pages/MyAccount";
function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/gigs/:id" element={<GigDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected route */}
        <Route
          path="/order"
          element={
            <ProtectedRoute>
              <Order />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-tracking"
          element={
            <ProtectedRoute>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat/:orderId"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/conversations"
          element={
            <ProtectedRoute>
              <Conversations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-orders"
          element={
            <ProtectedRoute>
              <SellerOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my"
          element={
            <ProtectedRoute>
              <MyAccount />
            </ProtectedRoute>
          }
        />
        <Route
  path="/seller"
  element={
    <ProtectedRoute>
      <SellerDashboard />
    </ProtectedRoute>
  }
/>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;