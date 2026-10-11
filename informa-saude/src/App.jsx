import { useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import HeaderLP from "./pages/LP/HeaderLP";
import Hero from "./pages/LP/Hero";
import Beneficios from "./pages/LP/Beneficios";
import ComoFunciona from "./pages/LP/ComoFunciona";
import FaqSection from "./pages/LP/FaqSection";
import Footer from "./pages/LP/Footer";
import ModalLogin from "./pages/Auth/ModalLogin";
import ModalCriarConta from "./pages/Auth/ModalCriarConta";
import HomeSistema from "./pages/Sistema-frontend/Home";
import MeuPerfil from "./pages/Sistema-frontend/MeuPerfil";
import EditarPerfil from "./pages/Sistema-frontend/EditarPerfil";
import Configuracoes from "./pages/Sistema-frontend/Configuracoes";
import Questionario from "./pages/Questionario/Questionario";
import NaoEncontrada from "./pages/NaoEncontrada/NaoEncontrada";
import JornadaDetalhesPage from "./pages/Sistema-frontend/JornadaDetalhesPage";

import { ScrollToTop } from './components';
import { UserProvider } from './context/UserContext';

function LandingPage() {
  const [modalConfig, setModalConfig] = useState({ aberto: false, abaInicial: 'login' });

  return (
    <div className="app-container">
      <HeaderLP 
        onAbrirLogin={() => setModalConfig({ aberto: true, abaInicial: 'login' })} 
        onAbrirCadastro={() => setModalConfig({ aberto: true, abaInicial: 'cadastro' })} 
      />
      <main className="main-content">
        <Hero />
        <Beneficios onAbrirCadastro={() => setModalConfig({ aberto: true, abaInicial: 'cadastro' })} />
        <ComoFunciona />
        <FaqSection />
      </main>
      <Footer />

      {modalConfig.aberto && modalConfig.abaInicial === 'login' && (
        <ModalLogin
          onClose={() => setModalConfig({ ...modalConfig, aberto: false })}
          onAbrirCadastro={() => setModalConfig({ aberto: true, abaInicial: 'cadastro' })}
        />
      )}
      {modalConfig.aberto && modalConfig.abaInicial === 'cadastro' && (
        <ModalCriarConta
          onClose={() => setModalConfig({ ...modalConfig, aberto: false })}
          onAbrirLogin={() => setModalConfig({ aberto: true, abaInicial: 'login' })}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/inicio" element={<HomeSistema />} />
          <Route path="/perfil" element={<Navigate to="/meu-perfil" replace />} />
          <Route path="/meu-perfil" element={<MeuPerfil />} />
          <Route path="/editar-perfil" element={<EditarPerfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/questionario" element={<Questionario />} />
          <Route path="/jornada/:id" element={<JornadaDetalhesPage />} />
          <Route path="/jornadas" element={<Navigate to="/jornada/cardiaca" replace />} />
          <Route path="/404" element={<NaoEncontrada />} />
          <Route path="/404.html" element={<NaoEncontrada />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;