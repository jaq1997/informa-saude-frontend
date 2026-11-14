import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });

      return;
    }

    const id = decodeURIComponent(hash.slice(1));
    let tentativas = 0;
    let timeoutId;

    function rolarParaSecao() {
      const elemento = document.getElementById(id);

      if (elemento) {
        elemento.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        return;
      }

      if (tentativas < 10) {
        tentativas += 1;
        timeoutId = window.setTimeout(rolarParaSecao, 100);
      }
    }

    rolarParaSecao();

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;
