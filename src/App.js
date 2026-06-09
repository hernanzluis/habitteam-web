import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Acceder from './pages/Acceder';
import Admin from './pages/Admin';
import MemberDetail from './pages/MemberDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acceder" element={<Acceder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/miembro/:userId" element={<MemberDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
