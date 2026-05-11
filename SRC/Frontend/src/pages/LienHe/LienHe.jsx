import './LienHe.css'

const LienHe = () => (
  <div className="lienhe-page">
    <div className="lienhe-hero">
      <div className="container">
        <h1>Liên Hệ</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
      </div>
    </div>

    <div className="container lienhe-content">
      <div className="lienhe-grid">
        {/* Thông tin */}
        <div className="lienhe-info">
          <h3>Thông tin liên hệ</h3>
          <div className="info-item">
            <span className="info-icon">📍</span>
            <div>
              <strong>Trụ sở chính</strong>
              <p>495C Đường CMT8, Phường Hoà Hưng (P.13, Q.10 cũ), TP.HCM</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">📞</span>
            <div>
              <strong>Hotline tư vấn</strong>
              <p><a href="tel:0934057333">0934 057 333</a></p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">✉️</span>
            <div>
              <strong>Email</strong>
              <p>daotolaixesaoviet@gmail.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="info-icon">🕐</span>
            <div>
              <strong>Giờ làm việc</strong>
              <p>Thứ 2 – Thứ 7: 07:00 – 20:00</p>
              <p>Chủ nhật: 08:00 – 17:00</p>
            </div>
          </div>

          {/* Bản đồ */}
          <div className="lienhe-map">
            <iframe
              title="Bản đồ"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4!2d106.6!3d10.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzEyLjAiTiAxMDbCsDM2JzAwLjAiRQ!5e0!3m2!1svi!2svn!4v1"
              width="100%" height="220"
              style={{ border: 0, borderRadius: '10px' }}
              allowFullScreen="" loading="lazy"
            />
          </div>
        </div>

        {/* Form liên hệ */}
        <div className="lienhe-form-box">
          <h3>Gửi tin nhắn cho chúng tôi</h3>
          <form className="lienhe-form">
            <div className="form-group">
              <label>Họ và tên</label>
              <input type="text" placeholder="Nguyễn Văn A" />
            </div>
            <div className="form-row-2">
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="tel" placeholder="0912 345 678" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="email@example.com" />
              </div>
            </div>
            <div className="form-group">
              <label>Nội dung</label>
              <textarea rows={5} placeholder="Nội dung cần tư vấn..." />
            </div>
            <button type="submit" className="btn-lienhe">Gửi Tin Nhắn</button>
          </form>
        </div>
      </div>
    </div>
  </div>
)

export default LienHe
