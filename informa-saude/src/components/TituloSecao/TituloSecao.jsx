export function TituloSecao({ children, className = '' }) {
  return (
    <h2 className={`is-section-title-orange fs-4 mb-3 ${className}`}>
      {children}
    </h2>
  );
}

export default TituloSecao;
