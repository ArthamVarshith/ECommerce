import { Link } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";

const Footer = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="font-display text-2xl font-semibold tracking-wider mb-6">{settings.siteName}</h3>
            <p className="text-sm leading-relaxed opacity-70">
              Thoughtfully designed clothing for the modern wardrobe. Crafted with care, built to last.
            </p>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-6 opacity-50">Shop</h4>
            <div className="flex flex-col gap-3">
              <Link to="/category/women" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Women</Link>
              <Link to="/category/men" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Men</Link>
              <Link to="/category/accessories" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Accessories</Link>
              <Link to="/category/outerwear" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Outerwear</Link>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-6 opacity-50">Help</h4>
            <div className="flex flex-col gap-3">
              <span className="text-sm opacity-70">Shipping & Returns</span>
              <span className="text-sm opacity-70">Size Guide</span>
              <span className="text-sm opacity-70">Contact Us</span>
              <span className="text-sm opacity-70">FAQ</span>
            </div>
          </div>
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase mb-6 opacity-50">Connect</h4>
            <div className="flex flex-col gap-3">
              <span className="text-sm opacity-70">Instagram</span>
              <span className="text-sm opacity-70">Pinterest</span>
              <span className="text-sm opacity-70">Newsletter</span>
            </div>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-primary-foreground/10 text-xs opacity-40 text-center">
          © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
