import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { BotaoSistema } from '../Botao/BotaoSistema';

export function CardSistema({
  isAcao = false,
  isProgresso = false,
  isMedia = false,
  isHero = false,
  centralizado = false,
  icone: Icon,
  titulo,
  subtitulo,
  descricao,
  categoria,
  progresso = 0,
  imagem,
  to,
  href,
  onClick,
  textoBotao,
  varianteBotao = 'orange',
  iconeBotao: IconeBotao = Play,
  className = '',
  children
}) {
  if (isAcao) {
    const conteudo = (
      <>
        {Icon && (
          <div className="is-icon-chip mb-2">
            <Icon size={24} aria-hidden="true" />
          </div>
        )}
        <div className="is-action-title">
          <span className="fw-bold text-dark fs-6">{titulo}</span>
        </div>
      </>
    );

    const classesAcao = `is-card is-action-card h-100 w-100 border-0 shadow-sm text-decoration-none ${className}`;

    if (to) {
      return <Link to={to} className={classesAcao}>{conteudo}</Link>;
    }

    if (href) {
      return <a href={href} className={classesAcao}>{conteudo}</a>;
    }

    return (
      <div onClick={onClick} className={`${classesAcao} cursor-pointer`}>
        {conteudo}
      </div>
    );
  }

  if (isProgresso) {
    const porcentagem = Math.min(100, Math.max(0, progresso));
    const conteudoProgresso = (
      <article className={`is-card h-100 d-flex flex-column justify-content-between ${className}`}>
        <div>
          {categoria && <span className="is-eyebrow mb-2">{categoria}</span>}
          <h4 className="fw-bold text-dark fs-5 mb-3">{titulo}</h4>
        </div>
        <div>
          <div className="d-flex justify-content-between text-muted fs-6 mb-1">
            <span>Progresso</span>
            <span>{porcentagem}%</span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label={`Progresso da jornada: ${titulo}`}
            aria-valuenow={porcentagem}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div className="progress-bar" style={{ width: `${porcentagem}%` }}></div>
          </div>
        </div>
      </article>
    );

    if (to) {
      return <Link to={to} className="text-decoration-none d-block h-100">{conteudoProgresso}</Link>;
    }

    return conteudoProgresso;
  }

  if (isMedia) {
    if (isHero) {
      const conteudoHero = (
        <article className={`is-hero-card p-4 p-md-5 shadow-sm ${className}`}>
          {imagem && <img src={imagem} alt={titulo} className="is-card-bg-img" />}
          <div className="is-hero-content col-12 col-lg-8">
            {subtitulo && <p className="text-white fs-3 mb-0 fw-light">{subtitulo}</p>}
            <h2 className="fw-bold text-white display-4 mb-2">{titulo}</h2>
            {descricao && <p className="text-white fs-6 mb-4">{descricao}</p>}
            {textoBotao && (
              <BotaoSistema variante={varianteBotao} onClick={onClick} to={to} href={href} className="fs-5 px-4 py-2">
                {textoBotao} {IconeBotao && <IconeBotao size={20} fill="currentColor" />}
              </BotaoSistema>
            )}
          </div>
        </article>
      );

      if (to && !textoBotao) {
        return <Link to={to} className="text-decoration-none d-block">{conteudoHero}</Link>;
      }

      return conteudoHero;
    }

    const conteudoMedia = (
      <article className={`is-jornada-card ${centralizado ? 'text-center p-4 p-md-5' : ''} ${className}`}>
        {imagem && <img src={imagem} alt={titulo} className="is-card-bg-img" />}
        <div className={`is-jornada-content ${centralizado ? 'w-100 d-flex flex-column align-items-center justify-content-center' : ''}`}>
          <h3 className={`fw-bold text-white mb-3 ${centralizado ? 'fs-2 text-center' : 'fs-3'}`}>
            {titulo}
          </h3>
          {descricao && <p className="text-white fs-6 mb-4">{descricao}</p>}
          {textoBotao && (
            <BotaoSistema
              variante={varianteBotao}
              larguraTotal={!centralizado}
              onClick={onClick}
              to={to}
              href={href}
              className={`fs-6 py-2 ${centralizado ? 'px-4' : ''}`}
            >
              {textoBotao} {IconeBotao && <IconeBotao size={18} fill="currentColor" />}
            </BotaoSistema>
          )}
        </div>
      </article>
    );

    if (to && !textoBotao) {
      return <Link to={to} className="text-decoration-none d-block h-100">{conteudoMedia}</Link>;
    }

    return conteudoMedia;
  }

  return (
    <article className={`is-card ${className}`}>
      {children}
    </article>
  );
}

export default CardSistema;
