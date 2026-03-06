import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import LoadingState from "./components/common/LoadingState";

const Home = lazy(() => import("./pages/Home"));
const Gigs = lazy(() => import("./pages/Gigs"));
const GigDetails = lazy(() => import("./pages/GigDetails"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Order = lazy(() => import("./pages/Order"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const Reviews = lazy(() => import("./pages/Reviews"));
const Chat = lazy(() => import("./pages/Chat"));
const Conversations = lazy(() => import("./pages/Conversations"));
const SellerOrders = lazy(() => import("./pages/SellerOrders"));
const SellerDashboard = lazy(() => import("./pages/SellerDashboard"));
const BuyerDashboard = lazy(() => import("./pages/BuyerDashboard"));
const CreateGig = lazy(() => import("./pages/CreateGig"));
const MyGigs = lazy(() => import("./pages/MyGigs"));
const Earnings = lazy(() => import("./pages/Earnings"));
const MyAccount = lazy(() => import("./pages/MyAccount"));

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Suspense fallback={<LoadingState title="Loading page" text="Preparing marketplace experience..." />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/gig/:id" element={<GigDetails />} />
            <Route path="/gigs/:id" element={<GigDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Register />} />

            {/* Buyer protected routes */}
            <Route
              path="/order"
              element={
                <RoleRoute allowedRoles={["buyer"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <Order />
                </RoleRoute>
              }
            />
            <Route
              path="/buyer-dashboard"
              element={
                <RoleRoute allowedRoles={["buyer"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <BuyerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <RoleRoute allowedRoles={["buyer"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <OrderTracking />
                </RoleRoute>
              }
            />
            <Route
              path="/orders/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reviews"
              element={
                <RoleRoute allowedRoles={["buyer"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <Reviews />
                </RoleRoute>
              }
            />

            {/* Seller protected routes */}
            <Route
              path="/seller-dashboard"
              element={
                <RoleRoute allowedRoles={["seller"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <SellerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/create-gig"
              element={
                <RoleRoute allowedRoles={["seller"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <CreateGig />
                </RoleRoute>
              }
            />
            <Route
              path="/my-gigs"
              element={
                <RoleRoute allowedRoles={["seller"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <MyGigs />
                </RoleRoute>
              }
            />
            <Route
              path="/manage-orders"
              element={
                <RoleRoute allowedRoles={["seller"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <SellerOrders />
                </RoleRoute>
              }
            />
            <Route
              path="/earnings"
              element={
                <RoleRoute allowedRoles={["seller"]} buyerRedirect="/" sellerRedirect="/seller-dashboard">
                  <Earnings />
                </RoleRoute>
              }
            />

            {/* Shared authenticated routes */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Conversations />
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
              path="/profile"
              element={
                <ProtectedRoute>
                  <MyAccount />
                </ProtectedRoute>
              }
            />

            {/* Backward compatibility aliases */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="/buyer" element={<Navigate to="/buyer-dashboard" replace />} />
            <Route path="/seller" element={<Navigate to="/seller-dashboard" replace />} />
            <Route path="/order-tracking" element={<Navigate to="/my-orders" replace />} />
            <Route
              path="/order/:orderId"
              element={
                <ProtectedRoute>
                  <OrderDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/seller-orders" element={<Navigate to="/manage-orders" replace />} />
            <Route path="/conversations" element={<Navigate to="/messages" replace />} />
            <Route path="/my" element={<Navigate to="/profile" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;