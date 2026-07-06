import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, Dumbbell, Bot, User } from "lucide-react";
import { useLanguageContext } from "@context/LanguageContext";

const navItems = [
  {
    path: "/dashboard",
    icon: Home,
    label: { fa: "خانه", en: "Home" },
  },
  {
    path: "/learn",
    icon: BookOpen,
    label: { fa: "یادگیری", en: "Learn" },
  },
  {
    path: "/practice",
    icon: Dumbbell,
    label: { fa: "تمرین", en: "Practice" },
  },
  {
    path: "/ai-tutor",
    icon: Bot,
    label: { fa: "هوش مصنوعی", en: "AI Tutor" },
  },
  {
    path: "/profile",
    icon: User,
    label: { fa: "پروفایل", en: "Profile" },
  },
];

function BottomNav() {
  const { language } = useLanguageContext();
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center w-full h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-0.5 w-8 h-1 bg-primary-500 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <Icon
                className={`w-5 h-5 mb-1 transition-colors ${
                  isActive
                    ? "text-primary-500"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />

              <span
                className={`text-2xs font-medium transition-colors ${
                  isActive
                    ? "text-primary-500"
                    : "text-neutral-400 dark:text-neutral-500"
                }`}
              >
                {item.label[language]}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
