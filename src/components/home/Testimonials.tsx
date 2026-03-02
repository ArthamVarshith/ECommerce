import { motion } from "framer-motion";

const testimonials = [
  { name: "Sarah M.", text: "The quality is exceptional. Every piece I've purchased feels like it was made just for me.", location: "London" },
  { name: "James K.", text: "Finally found a brand that balances style and sustainability without compromise.", location: "New York" },
  { name: "Elena R.", text: "The linen blazer is hands down the best I've ever owned. Worth every penny.", location: "Paris" },
];

const Testimonials = () => {
  return (
    <section className="py-20 lg:py-28 bg-secondary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl lg:text-4xl text-center mb-16 text-foreground"
        >
          What Our Customers Say
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center"
            >
              <p className="font-display text-lg lg:text-xl italic text-foreground mb-6 leading-relaxed">
                "{t.text}"
              </p>
              <footer className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground">
                {t.name} — {t.location}
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
