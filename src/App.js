import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Acceder from './pages/Acceder';
import Admin from './pages/Admin';
import MemberDetail from './pages/MemberDetail';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/acceder" element={<Acceder />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/miembro/:userId" element={<MemberDetail />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
