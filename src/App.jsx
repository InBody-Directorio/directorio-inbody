import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import RegistroPage from './pages/RegistroPage.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}
