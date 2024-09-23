import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

function Home() {
  return (
    <div className="home-container">
      <div className="input-container">
        <input
          type="text"
          placeholder="Entrez le nom d’une ville pour obtenir la météo"
          className="input-style"
        />
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
      </div>
    </div>
  );
}

export default Home;
