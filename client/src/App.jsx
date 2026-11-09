import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MemberPage from "./pages/MemberPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

export default function App() {
  return (
    <>
      <header className="nav">
        <NavLink to="/" className="brand">เนเน่นายแน่มาก</NavLink>
        <nav>
          <NavLink to="/" end>หน้าแรก</NavLink>
          <a href="/#members">สมาชิก</a>
          <a href="/#contact">ติดต่อ</a>
          <NavLink to="/chat" className="nav-cta">คุยกับ AI</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/members/:id" element={<MemberPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="*" element={<p className="container">ไม่พบหน้านี้</p>} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} เนเน่นายแน่มาก</footer>
    </>
  );
}
