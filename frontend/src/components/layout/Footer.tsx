import "@/components/layout/styles/Footer.scss";
import {
  SiFacebook,
  SiTiktok,
  SiInstagram,
} from "@icons-pack/react-simple-icons";

function Footer() {
  return (
    <div className="footer">
      <div className="footer__title">Sobre Coralie</div>
      <div className="footer__text">
        En Coralie creemos en resaltar tu belleza única. Descubre productos de
        calidad que te hacen sentir especial, sin comprometer tu bolsillo.
      </div>
      <div className="footer__socials">
        <SiFacebook />
        <SiTiktok />
        <SiInstagram />
      </div>
    </div>
  );
}

export default Footer;
