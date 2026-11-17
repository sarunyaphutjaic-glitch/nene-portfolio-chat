import { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import MemberPage from "./pages/MemberPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import Backdrop from "./components/Backdrop.jsx";
import ThemePicker from "./components/ThemePicker.jsx";
import IntroSplash from "./components/IntroSplash.jsx";
import { useTheme } from "./theme.js";

const INTRO_KEY = "nene-intro-seen";
function introSeen() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [showIntro, setShowIntro] = useState(() => !introSeen());

  function closeIntro() {
    try {
      sessionStorage.setItem(INTRO_KEY, "1"); // แสดงหน้าเปิดครั้งเดียวต่อการเปิดเบราว์เซอร์
    } catch {
      /* ignore */
    }
    setShowIntro(false);
  }

  return (
    <>
      {showIntro && <IntroSplash onDone={closeIntro} theme={theme} />}
      <Backdrop theme={theme} />
      <header className="nav">
        <NavLink to="/" className="brand">เนเน่นายแน่มาก</NavLink>
        <div className="nav-right">
          <nav>
            <NavLink to="/" end>ข้อมูลโปรเจกต์</NavLink>
            <a href="/#members">สมาชิก</a>
            <NavLink to="/history">ประวัติการสนทนา</NavLink>
            <NavLink to="/chat" className="nav-cta">คุยกับ Nous</NavLink>
          </nav>
          <ThemePicker theme={theme} onChange={setTheme} />
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<HomePage theme={theme} />} />
          <Route path="/members/:id" element={<MemberPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="*" element={<p className="container status">ไม่พบหน้านี้</p>} />
        </Routes>
      </main>
      <footer className="footer">
        © {new Date().getFullYear()} เนเน่นายแน่มาก · Project Portfolio - AI and Data Engineering
        <button className="replay-intro" onClick={() => setShowIntro(true)}>ดูหน้าเปิดอีกครั้ง</button>
      </footer>
    </>
  );
}
