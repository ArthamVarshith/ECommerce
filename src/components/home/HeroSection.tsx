import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-[85vh] lg:h-[90vh] overflow-hidden">
      <img
        src={heroBanner}
        alt="Atelier Spring Collection – elegant neutral-toned fashion"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/20" />
      <div className="relative h-full flex items-end pb-16 lg:pb-24">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-lg"
          >
            <h1 className="font-display text-4xl lg:text-6xl font-light text-primary-foreground mb-4 leading-tight">
              Spring <br />Collection
            </h1>
            <p className="font-body text-sm lg:text-base text-primary-foreground/80 mb-8 max-w-sm">
              Effortless pieces designed for the season ahead. Crafted from natural fibers with lasting quality.
            </p>
            <Link
              to="/category/women"
              className="inline-block bg-background text-foreground font-body text-xs tracking-[0.2em] uppercase px-8 py-4 hover:bg-secondary transition-colors"
            >
              Explore Now
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
