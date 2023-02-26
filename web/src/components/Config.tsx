import Back from "../assets/back.svg";
import { Link } from "react-router-dom";
export default () => {
  return (
    <div>
      <header className="p-2">
        <Link to="/">
          <Back />
        </Link>
      </header>
      <main>
        <div>
          <button
            onClick={() => {
              const value = window.prompt();
              if (value) {
                document.cookie = `SECRET_TOKEN=${value}`;
              }
            }}
          >
            login
          </button>
        </div>
        <div>
          <button
            onClick={async () => {
              (await indexedDB.databases()).forEach(
                (db) => db.name && indexedDB.deleteDatabase(db.name)
              );
            }}
          >
            reset databases
          </button>
        </div>
        <div>
          <button
            onClick={async () => {
              (await caches.keys()).forEach((k) => caches.delete(k));
            }}
          >
            clear caches
          </button>
        </div>
      </main>
    </div>
  );
};
