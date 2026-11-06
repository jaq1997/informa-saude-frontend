import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('redireciona para a pagina inicial sem token', () => {
    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <Routes>
          <Route path="/" element={<span>inicio publico</span>} />
          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <span>area protegida</span>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('inicio publico')).toBeTruthy();
  });

  it('renderiza o conteudo protegido com token', () => {
    localStorage.setItem('token', 'token-valido');

    render(
      <MemoryRouter initialEntries={['/inicio']}>
        <Routes>
          <Route path="/" element={<span>inicio publico</span>} />
          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <span>area protegida</span>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('area protegida')).toBeTruthy();
  });
});
