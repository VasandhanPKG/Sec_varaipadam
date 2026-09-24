import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RoomsProvider } from './context/RoomsContext';
import { HomePage } from './pages/HomePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <AuthProvider>
      <RoomsProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </RoomsProvider>
    </AuthProvider>
  );
}

export default App;
