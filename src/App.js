import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/App.tsx
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import CategorySection from "./components/CategorySection";
import FeaturedProducts from "./components/FeaturedProducts";
import { Routes, Route } from "react-router-dom";
import ProductPage from "./pages/ProductPage";
import FootballPage from "./pages/FootballPage";
import CartPage from "./pages/CartPage";
import SuccessPage from "./pages/SuccessPage";
import FailurePage from "./pages/FailurePage";
import PendingPage from "./pages/PendingPage";
export default function App() {
    return (_jsx(Layout, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsxs(_Fragment, { children: [_jsx(Hero, {}), _jsx(CategorySection, {}), _jsx(FeaturedProducts, {})] }) }), _jsx(Route, { path: "/futbol", element: _jsx(FootballPage, {}) }), _jsx(Route, { path: "/producto/:id", element: _jsx(ProductPage, {}) }), _jsx(Route, { path: "/carrito", element: _jsx(CartPage, {}) }), _jsx(Route, { path: "/success", element: _jsx(SuccessPage, {}) }), _jsx(Route, { path: "/failure", element: _jsx(FailurePage, {}) }), _jsx(Route, { path: "/pending", element: _jsx(PendingPage, {}) })] }) }));
}
