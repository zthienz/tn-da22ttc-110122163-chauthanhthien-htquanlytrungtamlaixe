import { Link } from 'react-router-dom'
import './Footer.css'

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">

      {/* Cột 1 — Logo + địa chỉ */}
      <div className="footer-brand">
        <div className="footer-logo">
          <img src="/logo-trungtamsaoviet.png" alt="Sao Việt" className="footer-logo-img" />
        </div>
        <p className="footer-address-main">
          <strong>Trụ sở chính:</strong> 495C ĐƯỜNG CMT8, PHƯỜNG HOÀ HƯNG(P.13,Q.10 cũ), TP.HCM
        </p>
        <ul className="footer-branches">
          <li>• Vp Gò Vấp: 452 Phan Văn Trị phường Hạnh Thông, Gò Vấp, TP. Hồ Chí Minh</li>
          <li>• VP Bình Tân: 106 Đường số 34, Phường Bình Trị Đông B, Quận Bình Tân, TP. HCM</li>
          <li>• Cơ sở 2: Đường Suối Lội, Xã Tân Thông Hội, Huyện Củ Chi, TP. HCM</li>
          <li>• Cơ sở 3: 144 Bùi Công Trừng, Xã Nhị Bình, Huyện Hóc Môn, TP. HCM</li>
          <li>• Cơ sở 4: 10 Bà Thiên, Ấp Ngã Tư, Xã Nhuận Đức, Huyện Củ Chi, TP. HCM</li>
        </ul>
        <div className="footer-contacts">
          <p>📞 0934 057 333</p>
          <p>✉️ daotolaixesaoviet@gmail.com</p>
        </div>
        <div className="footer-socials">
          <a href="#" className="social-btn fb">f</a>
          <a href="#" className="social-btn tiktok">♪</a>
        </div>
      </div>

      {/* Cột 2 — Các khoá học */}
      <div className="footer-col">
        <h4>Các khoá học</h4>
        <ul>
          <li><Link to="/khoa-hoc/b">Học lái xe ô tô hạng B</Link></li>
          <li><Link to="/khoa-hoc/c1">Học lái xe ô tô tải hạng C1</Link></li>
          <li><Link to="/khoa-hoc/a">Học bằng lái xe hạng A1, A2</Link></li>
          <li><Link to="/thue-xe">Thuê xe tập lái tại TPHCM</Link></li>
          <li><Link to="/dang-ky">Đăng ký tư vấn</Link></li>
        </ul>
      </div>

      {/* Cột 3 — Thông tin khác */}
      <div className="footer-col">
        <h4>Thông tin khác</h4>
        <ul>
          <li><Link to="/on-thi">Ôn thi</Link></li>
          <li><Link to="/lich-thi">Lịch thi</Link></li>
          <li><Link to="/lien-he">Liên hệ</Link></li>
        </ul>
      </div>

      {/* Cột 4 — Bản đồ */}
      <div className="footer-col">
        <h4>Bản đồ</h4>
        <div className="footer-map">
          <iframe
            title="Bản đồ Sao Việt"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.6!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzEyLjAiTiAxMDbCsDM2JzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1"
            width="100%"
            height="160"
            style={{ border: 0, borderRadius: '8px' }}
            allowFullScreen=""
            loading="lazy"
          />
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <p>© 2025 Trung Tâm Dạy Lái Xe Sao Việt. All rights reserved.</p>
    </div>
  </footer>
)

export default Footer
