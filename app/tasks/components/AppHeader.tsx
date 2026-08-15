type AppHeaderProps = {
  userName?: string;
  onLogout: () => void;
};

export function AppHeader({ userName, onLogout }: AppHeaderProps) {
  return (
    <header className="header">
      <div className="header-inner">
        <h1>Internal Portal</h1>
        <div>
          <span className="who">{userName}</span>{" "}
          <button className="light" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
