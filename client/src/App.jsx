import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MemberPage from "./pages/MemberPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";

export default function App() {
  return (
    <>
      <header className="nav">
        <NavLink to="/" className="brand">เนเน่นายแน่มาก</NavLink>
        <nav>
          <NavLink to="/" end>ข้อมูลโปรเจกต์</NavLink>
          <a href="/#members">สมาชิก</a>
          <NavLink to="/history">ประวัติการสนทนา</NavLink>
          <NavLink to="/chat" className="nav-cta">คุยกับ Nous</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/members/:id" element={<MemberPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<p className="container status">ไม่พบหน้านี้</p>} />
        </Routes>
      </main>
      <footer className="footer">© {new Date().getFullYear()} เนเน่นายแน่มาก · Project Portfolio - AI and Data Engineering</footer>
    </>
  );
}
