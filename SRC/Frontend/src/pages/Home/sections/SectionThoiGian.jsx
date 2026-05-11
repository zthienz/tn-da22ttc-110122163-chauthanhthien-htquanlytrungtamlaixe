import './SectionThoiGian.css'

const SectionThoiGian = () => (
  <section className="section-tg">
    <div className="container tg-grid">
      {/* Lý thuyết */}
      <div className="tg-box tg-box--blue">
        <h4>Thời gian học lý thuyết <span>(linh hoạt Online hoặc trực tiếp tại trung tâm):</span></h4>
        <ul>
          <li><span className="tg-icon">☀️</span> Ca sáng: 09:00 – 11:00</li>
          <li><span className="tg-icon">☀️</span> Ca chiều: 14:00 – 16:00</li>
          <li><span className="tg-icon">🌙</span> Ca tối: 18:00 – 20:00</li>
        </ul>
      </div>

      {/* Thực hành */}
      <div className="tg-box tg-box--green">
        <h4>Thời gian học thực hành <span>(1 kèm 1 với giáo viên):</span></h4>
        <ul>
          <li><span className="tg-icon">☀️</span> Ca sáng: 07:00 – 09:00 | 09:00 – 11:00</li>
          <li><span className="tg-icon">☀️</span> Ca chiều: 13:00 – 15:00 | 15:00 – 17:00</li>
          <li><span className="tg-icon">🌙</span> Ca tối: Linh hoạt sắp xếp trực tiếp với giáo viên</li>
        </ul>
      </div>
    </div>
  </section>
)

export default SectionThoiGian
