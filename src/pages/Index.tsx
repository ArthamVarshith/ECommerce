import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NewArrivals from "@/components/home/NewArrivals";
import Testimonials from "@/components/home/Testimonials";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <CategoryShowcase />
      <FeaturedProducts />
      <NewArrivals />
      <Testimonials />
    </Layout>
  );
};

export default Index;
