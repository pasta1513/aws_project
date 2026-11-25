import { Route, Routes } from 'react-router-dom';
import { GuestOnly, RequireAuth } from './auth/guards';
import { AppLayout } from './components/layout/AppLayout';
import AccountPage from './pages/account/AccountPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import DayDetailPage from './pages/day/DayDetailPage';
import LoginPage from './pages/LoginPage';
import NewMealPage from './pages/new/NewMealPage';
import NotFoundPage from './pages/NotFoundPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="day/:date" element={<DayDetailPage />} />
          <Route path="new" element={<NewMealPage />} />
          <Route path="account" element={<AccountPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
