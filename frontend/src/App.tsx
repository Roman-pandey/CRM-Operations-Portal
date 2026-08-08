import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './layouts/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import { Login } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CustomerList from './pages/customers/CustomerList';
import CustomerForm from './pages/customers/CustomerForm';
import CustomerDetail from './pages/customers/CustomerDetail';
import ProductList from './pages/products/ProductList';
import ProductForm from './pages/products/ProductForm';
import StockAdjustment from './pages/products/StockAdjustment';
import StockMovements from './pages/products/StockMovements';
import ChallanList from './pages/challans/ChallanList';
import ChallanForm from './pages/challans/ChallanForm';
import ChallanDetail from './pages/challans/ChallanDetail';
import UserList from './pages/users/UserList';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
            },
          }}
        />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Authentication Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Authenticated App Routes inside DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Dashboard & Profile */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Customers - ADMIN, SALES, ACCOUNTS */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
              <Route path="/customers/new" element={<CustomerForm />} />
              <Route path="/customers/:id/edit" element={<CustomerForm />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/customers/:id" element={<CustomerDetail />} />
            </Route>

            {/* Products - ADMIN, WAREHOUSE, ACCOUNTS */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE']} />}>
              <Route path="/products/new" element={<ProductForm />} />
              <Route path="/products/:id/edit" element={<ProductForm />} />
              <Route path="/products/:id/stock" element={<StockAdjustment />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'ACCOUNTS', 'SALES']} />}>
              <Route path="/products" element={<ProductList />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'ACCOUNTS']} />}>
              <Route path="/stock-movements" element={<StockMovements />} />
            </Route>

            {/* Challans - ADMIN, SALES, ACCOUNTS */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES']} />}>
              <Route path="/challans/new" element={<ChallanForm />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']} />}>
              <Route path="/challans" element={<ChallanList />} />
              <Route path="/challans/:id" element={<ChallanDetail />} />
            </Route>

            {/* Users - ADMIN ONLY */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/users" element={<UserList />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
