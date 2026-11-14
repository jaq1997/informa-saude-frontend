import heroCareImg from '../../assets/images/hero-care.webp';
import heroCareMobileImg from '../../assets/images/hero-care-vertical.jpg';
import hero2Img from '../../assets/images/hero-2.webp';
import hero2MobileImg from '../../assets/images/hero-2-vertical.jpg';
import { CarrosselSistema } from '../../components';

const SLIDES = [
  { id: 1, img: heroCareImg, mobileImg: heroCareMobileImg, alt: 'Cuidar da saúde pode ser simples.' },
  { id: 2, img: hero2Img, mobileImg: hero2MobileImg, alt: 'Informa Saúde - Viva melhor todos os dias.' }
];

export function Hero() {
  return (
    <section className="w-100 p-0 position-relative overflow-hidden is-hero-section" id="home">
      <CarrosselSistema id="heroCarousel" slides={SLIDES} intervalo={5000} />
    </section>
  );
}

export default Hero;
