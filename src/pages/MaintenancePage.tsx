import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-lg"
            >
                {/* Icon */}
                <motion.div
                    animate={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary mb-8"
                >
                    <Wrench className="w-8 h-8 text-muted-foreground" />
                </motion.div>

                {/* Heading */}
                <h1 className="font-display text-4xl lg:text-5xl text-foreground mb-4">
                    We'll Be Right Back
                </h1>

                {/* Description */}
                <p className="font-body text-sm lg:text-base text-muted-foreground leading-relaxed mb-8 max-w-md mx-auto">
                    We're performing scheduled maintenance to improve your shopping
                    experience. Please check back shortly.
                </p>

                {/* Decorative divider */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-px bg-border" />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                    <div className="w-12 h-px bg-border" />
                </div>

                {/* Subtle footer */}
                <p className="font-body text-xs text-muted-foreground/50 tracking-wider uppercase">
                    Thank you for your patience
                </p>
            </motion.div>
        </div>
    );
};

export default MaintenancePage;
