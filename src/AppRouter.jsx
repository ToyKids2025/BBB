import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import RedirectPage from './RedirectPage';
import PublicHomePage from './PublicHomePage';
import About from './pages/About';

/**
 * Router Principal
 * Define rotas da aplicação incluindo página pública e admin
 */
function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Rota de redirecionamento - /r/:linkId */}
        <Route path="/r/:linkId" element={<RedirectPage />} />

        {/* Rota PÚBLICA - Homepage (NOVA!) */}
        <Route path="/" element={<PublicHomePage />} />

        {/* Rota SOBRE NÓS - Informações institucionais */}
        <Route path="/sobre" element={<About />} />
        <Route path="/about" element={<About />} />

        {/* Rota ADMIN - Dashboard privado */}
        <Route path="/admin/*" element={<App />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;