import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CarrosselSistema({
  id = 'heroCarousel',
  slides = [],
  intervalo = 5000,
  className = '',
  alturaImagem = 'is-hero-image'
}) {
  if (!slides || slides.length === 0) return null;

  return (
    <div
      id={id}
      className={`carousel slide ${className}`}
      data-bs-ride="carousel"
      data-bs-interval={intervalo}
    >
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id || index}
            type="button"
            data-bs-target={`#${id}`}
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
            aria-current={index === 0 ? 'true' : undefined}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div key={slide.id || index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
            <picture>
              {slide.mobileImg && (
                <source media="(max-width: 767.98px)" srcSet={slide.mobileImg} />
              )}
              <img
                src={slide.img}
                alt={slide.alt}
                className={`${alturaImagem} w-100 d-block`}
              />
            </picture>
          </div>
        ))}
      </div>

      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="prev"
        aria-label="Slide anterior"
      >
        <ChevronLeft size={36} className="text-white" aria-hidden="true" />
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target={`#${id}`}
        data-bs-slide="next"
        aria-label="Próximo slide"
      >
        <ChevronRight size={36} className="text-white" aria-hidden="true" />
      </button>
    </div>
  );
}

export default CarrosselSistema;
