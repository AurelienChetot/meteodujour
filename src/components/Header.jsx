import LOGO from "../assets/images/logo.gif";

export default function Header() {
  return (
    <div className="header-container">
      <div className="logo-text-container">
        <img className="logo-style" src={LOGO} alt="logo-meteo-du-jour" />
        <p className="text-color">MétéoDuJour</p>
      </div>
    </div>
  );
}
