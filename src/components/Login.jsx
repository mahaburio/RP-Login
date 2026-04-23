import { useRef, useState } from "react";
import bgImage from "../assets/steackhouse-background.jpg";

const MANAGER_PASSWORD = "RPrime2026";
const MAX_PIN_LENGTH = 4;

// Replace with Supabase employees data
const MOCK_EMPLOYEES = [
  { id: 1, name: "John Doe", pin: "1234" },
  { id: 2, name: "Jane Smith", pin: "5678" },
];

const KEYPAD_ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", "delete"],
];

export default function Login({
  employees = MOCK_EMPLOYEES,
  onLogin,
  onManagerLogin,
}) {
  const [activeLocation, setActiveLocation] = useState("mahwah");
  const [pin, setPin] = useState([]);
  const [shake, setShake] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [managerPassword, setManagerPassword] = useState("");
  const [managerError, setManagerError] = useState(false);

  const deleteTimerRef = useRef(null);
  const longPressRef = useRef(false);

  const locations = [
    { id: "mahwah", label: "MAHWAH" },
    { id: "fair-lawn", label: "FAIR LAWN" },
  ];

  const handleDigit = (digit) => {
    if (pin.length >= MAX_PIN_LENGTH) return;
    const newPin = [...pin, digit];
    setPin(newPin);
    if (newPin.length === MAX_PIN_LENGTH) {
      setTimeout(() => submitPin(newPin), 150);
    }
  };

  const submitPin = (pinArr) => {
    const pinStr = pinArr.join("");
    const employee = employees.find((e) => String(e.pin) === pinStr);
    if (employee) {
      onLogin?.(employee);
    } else {
      setPinError(true);
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPinError(false);
        setPin([]);
      }, 700);
    }
  };

  const handleDeletePointerDown = () => {
    longPressRef.current = false;
    deleteTimerRef.current = setTimeout(() => {
      longPressRef.current = true;
      setPin([]);
    }, 600);
  };

  const handleDeletePointerUp = () => {
    clearTimeout(deleteTimerRef.current);
    if (!longPressRef.current) {
      setPin((prev) => prev.slice(0, -1));
    }
  };

  const handleManagerSubmit = () => {
    if (managerPassword === MANAGER_PASSWORD) {
      onManagerLogin?.({ id: "manager", name: "Manager", role: "manager" });
    } else {
      setManagerError(true);
      setTimeout(() => {
        setManagerError(false);
        setManagerPassword("");
      }, 700);
    }
  };

  return (
    <div className="mainWrapper">
      <div className="bg-blur" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="bg-overlay" />
      <div className="container">
        {/* Location Switch */}
        <div className="location-switch">
          {locations.map((loc, i) => (
            <div key={loc.id} className="location-item">
              {i > 0 && <span className="location-sep">|</span>}
              <button
                className={`location-btn${activeLocation === loc.id ? " active" : ""}`}
                onClick={() => setActiveLocation(loc.id)}
              >
                {activeLocation === loc.id && (
                  <span className="location-pin-icon">📍</span>
                )}
                {loc.label}
              </button>
            </div>
          ))}
        </div>

        {/* Logo */}
        <div className="logo">
          <img
            src="/logo.svg"
            alt="RP Prime"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Text Block */}
        <div className="text-container">
          <h2 className="title">Staff Schedule</h2>
          <p className="subtitle">Enter your PIN to continue</p>
        </div>

        {/* PIN Dots */}
        <div className={`pin-input${shake ? " shake" : ""}`}>
          {Array.from({ length: MAX_PIN_LENGTH }, (_, i) => (
            <div
              key={i}
              className={`pin-dot${
                i < pin.length ? " filled" : ""
              }${pinError ? " error" : ""}`}
            />
          ))}
        </div>

        {/* Keypad or Manager Form */}
        {!showManager ? (
          <div className="keypad-container">
            {KEYPAD_ROWS.map((row, ri) => (
              <div key={ri} className="keypad-row">
                {row.map((key, ci) => {
                  if (key === null) {
                    return <div key={ci} className="keypad-empty" />;
                  }
                  if (key === "delete") {
                    return (
                      <button
                        key={ci}
                        className="keypad-button delete-btn"
                        onPointerDown={handleDeletePointerDown}
                        onPointerUp={handleDeletePointerUp}
                        onPointerLeave={() =>
                          clearTimeout(deleteTimerRef.current)
                        }
                      >
                        ⌫
                      </button>
                    );
                  }
                  return (
                    <button
                      key={ci}
                      className="keypad-button"
                      onClick={() => handleDigit(key)}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="manager-form">
            <input
              type="password"
              className={`manager-input${managerError ? " error" : ""}`}
              placeholder="Manager password"
              value={managerPassword}
              onChange={(e) => setManagerPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManagerSubmit()}
              autoFocus
            />
            <button className="manager-enter-btn" onClick={handleManagerSubmit}>
              Enter
            </button>
          </div>
        )}

        {/* Manager Login / Cancel */}
        <div className="manager-section">
          {!showManager ? (
            <button
              className="manager-link"
              onClick={() => setShowManager(true)}
            >
              Manager Login{" "}
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z"></path>
                </svg>
              </span>
            </button>
          ) : (
            <button
              className="manager-cancel"
              onClick={() => {
                setShowManager(false);
                setManagerPassword("");
                setManagerError(false);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
