import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { JornadaDetalhes } from './JornadaDetalhes';

vi.mock('../../components', () => ({
  SystemNavbar: () => null,
  FooterSistemaMobile: () => null,
  BotaoSistema: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>{children}</button>
  ),
  DropdownSistema: () => null,
}));

describe('JornadaDetalhes', () => {
  it('exibe episódios sem aba de notícias e devolve foco ao fechar o vídeo', () => {
    render(
      <MemoryRouter initialEntries={['/jornada/cardiaca']}>
        <Routes>
          <Route path="/jornada/:id" element={<JornadaDetalhes />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Um cuidado de cada vez' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /notícias relacionadas/i })).toBeNull();

    const botaoReproduzir = screen.getByRole('button', {
      name: /^Reproduzir Batimentos cardíacos irregulares/,
    });
    fireEvent.click(botaoReproduzir);

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fechar vídeo' })).toBe(document.activeElement);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(botaoReproduzir).toBe(document.activeElement);
  });
});
