import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Questionario from './Questionario';
import JornadaDetalhesPage from '../Sistema-frontend/JornadaDetalhesPage';

vi.mock('../../components', () => ({
  BarraAcessibilidade: () => null,
  SystemNavbar: () => null,
  FooterSistemaMobile: () => null,
  DropdownSistema: () => null,
  BotaoSistema: ({ children, onClick, desabilitado }) => (
    <button type="button" onClick={onClick} disabled={desabilitado}>
      {children}
    </button>
  ),
  OpcaoCard: ({ titulo, onClick }) => (
    <button type="button" onClick={onClick}>{titulo}</button>
  ),
  Logo: () => null,
}));

vi.mock('../../context/userContextStore', () => ({
  useUser: () => ({ atualizarJornada: vi.fn() }),
}));

describe('Questionario', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('navega para a jornada respiratória recomendada e não mostra spinner no resultado', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (String(url).endsWith('/api/questionario/perguntas')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{
            id: 'pergunta-1',
            titulo: 'Qual tema prefere?',
            subtitulo: '',
            opcoes: [{ id: 'respiratoria', titulo: 'Cuidados respiratórios' }],
          }]),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          jornada_recomendada: 'respiratoria',
          jornadas_empatadas: [],
          persistido: true,
        }),
      });
    }));

    render(
      <MemoryRouter initialEntries={['/questionario']}>
        <Routes>
          <Route path="/questionario" element={<Questionario />} />
          <Route path="/jornada/:id" element={<JornadaDetalhesPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Começar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cuidados respiratórios' }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver resultado' }));

    expect(await screen.findByText('Jornada Respiratória')).toBeTruthy();
    expect(document.querySelector('.is-questionnaire-result .spin')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Acessar minha jornada' }));

    expect(await screen.findByRole('heading', {
      level: 1,
      name: 'Jornada Respiratória',
    })).toBeTruthy();
  });
});
