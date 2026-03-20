import { ReactNode, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useSettings } from "@/contexts/SettingsContext";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AnnouncementBanner = () => {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !settings.announcements || settings.announcements.length === 0) {
    return null;
  }

  const announcementText = settings.announcements.join("  ✦  ");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden"
      >
        {/* Gradient background */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
          {/* Subtle shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          />

          <div className="container mx-auto px-4 py-2.5 flex items-center justify-center gap-3 relative z-10">
            {/* Icon */}
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
            >
              <Sparkles size={14} className="text-amber-400 flex-shrink-0" />
            </motion.div>

            {/* Text with marquee for long announcements */}
            <div className="overflow-hidden flex-1 max-w-xl">
              <motion.p
                className="font-body text-xs tracking-[0.15em] uppercase text-gray-100 whitespace-nowrap text-center"
                animate={
                  settings.announcements.length > 1
                    ? { x: ["0%", "-50%"] }
                    : {}
                }
                transition={
                  settings.announcements.length > 1
                    ? { duration: 12, repeat: Infinity, ease: "linear" }
                    : {}
                }
              >
                {settings.announcements.length > 1
                  ? `${announcementText}  ✦  ${announcementText}`
                  : announcementText}
              </motion.p>
            </div>

            {/* Icon (right side) */}
            <Sparkles size={14} className="text-amber-400 flex-shrink-0 hidden sm:block" />

            {/* Dismiss button */}
            <button
              onClick={() => setDismissed(true)}
              className="flex-shrink-0 ml-2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200"
              aria-label="Dismiss announcement"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <AnnouncementBanner />
    <Header />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default Layout;
