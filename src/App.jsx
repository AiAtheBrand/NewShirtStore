import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AnnouncementBar from './components/AnnouncementBar';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import Products from './pages/Products';

function App() {
  return (
    <BrowserRouter>
      <AnnouncementBar />
      <Navbar />
      <ScrollToTop />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
