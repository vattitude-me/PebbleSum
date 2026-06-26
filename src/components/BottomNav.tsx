"use client";

interface BottomNavProps {
  active: string;
  onNavigate: (page: string) => void;
  ageGroup: "young" | "middle" | "older";
}

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "/assets/icons/icon-home.png" },
  { id: "journey", label: "Journey", icon: "/assets/icons/icon-level.png" },
  { id: "practice", label: "Practice", icon: "/assets/icons/icon-play.png" },
  { id: "rewards", label: "Rewards", icon: "/assets/icons/icon-star.png" },
  { id: "profile", label: "Profile", icon: "/assets/icons/icon-avatar.png" },
];

export default function BottomNav({ active, onNavigate, ageGroup }: BottomNavProps) {
  const isYoung = ageGroup === "young";

  return (
    <nav className={`bottom-nav ${isYoung ? "bottom-nav--young" : ""}`}>
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        const isPractice = item.id === "practice";

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`bottom-nav__item ${isActive ? "bottom-nav__item--active" : ""} ${isPractice ? "bottom-nav__item--practice" : ""}`}
          >
            {isPractice ? (
              <div className="bottom-nav__practice-btn">
                <img src={item.icon} alt={item.label} className="bottom-nav__icon" />
              </div>
            ) : (
              <img src={item.icon} alt={item.label} className={`bottom-nav__icon ${isActive ? "bottom-nav__icon--active" : ""}`} />
            )}
            <span className={`bottom-nav__label ${isActive ? "bottom-nav__label--active" : ""}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
