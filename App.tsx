
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Agenda from './screens/Agenda';
import Turmas from './screens/Turmas';
import RegistroAula from './screens/RegistroAula';
import NovaTurma from './screens/NovaTurma';
import NavBar from './components/NavBar';

import Historico from './screens/Historico';

const AppContent: React.FC = () => {
  const location = useLocation();
  const hideNavOnRoutes = ['/registro', '/nova-turma'];
  const shouldHideNav = hideNavOnRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="min-h-screen bg-surface-light relative">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/turmas" element={<Turmas />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/registro/:turmaId" element={<RegistroAula />} />
        <Route path="/nova-turma" element={<NovaTurma />} />
        <Route path="/editar-turma/:id" element={<NovaTurma />} />
      </Routes>
      {!shouldHideNav && <NavBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
