import { useState } from "react";
import { slide as Menu } from "react-burger-menu";
import LOGO from "../assets/images/logo.gif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="header-container">
      <div className="logo-text-container">
        <div className="menu-title-container">
          <img className="logo-style" src={LOGO} alt="logo-meteo-du-jour" />
          <p className="text-color">MétéoDuJour</p>
        </div>
        <div className="burger-icon" onClick={handleMenuToggle}>
          <FontAwesomeIcon icon={faBars} size="2x" color="white" />
        </div>
        <Menu
          right
          isOpen={menuOpen}
          customBurgerIcon={false}
          customCrossIcon={false}
        >
          <div className="close-icon" onClick={handleMenuToggle}>
            <FontAwesomeIcon icon={faTimes} size="2x" color="red" />
          </div>

          {/* Liens du menu */}
          <a className="menu-item" href="/">
            Accueil
          </a>
          <a className="menu-item" href="/meteo">
            Météo Actuelle
          </a>
          <a className="menu-item" href="/previsions">
            Prévisions
          </a>
          <a className="menu-item" href="/contact">
            Contact
          </a>
        </Menu>
      </div>
    </div>
  );
}
