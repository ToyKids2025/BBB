import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import RedirectPage from './RedirectPage';

/**
 * Router Principal
 * Define rotas da aplicação incluindo página de redirecionamento
 */
function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Rota de redirecionamento - /r/:linkId */}
        <Route path="/r/:linkId" element={<RedirectPage />} />

        {/* Rota principal - Dashboard Admin */}
        <Route path="/*" element={<App />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;