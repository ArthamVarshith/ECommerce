import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, Heart, User, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { totalItems } = useCart();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { to: "/category/women", label: "Women" },
    { to: "/category/men", label: "Men" },
    { to: "/category/accessories", label: "Accessories" },
    { to: "/category/outerwear", label: "Outerwear" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-foreground"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Nav links - desktop */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-body tracking-wide text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo */}
            <Link to="/" className="font-display text-2xl lg:text-3xl font-semibold tracking-wider text-foreground">
              ATELIER
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <Link
                to="/wishlist"
                className="hidden sm:block p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Heart size={20} />
              </Link>
              <Link to="/cart" className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-foreground text-background text-[10px] font-medium w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <User size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-border overflow-hidden"
            >
              <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-display tracking-wide text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/98 backdrop-blur-sm flex items-start justify-center pt-32"
          >
            <div className="w-full max-w-xl px-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-transparent border-b-2 border-foreground pb-4 text-2xl lg:text-3xl font-display text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button type="submit" className="absolute right-0 bottom-4">
                  <Search size={24} className="text-foreground" />
                </button>
              </form>
              <button
                onClick={() => setSearchOpen(false)}
                className="mt-8 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
