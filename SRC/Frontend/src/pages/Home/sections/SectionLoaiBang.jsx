import './SectionLoaiBang.css'

const luatCu = [
  { icon: '🏍️', hang: 'Hạng A1', mo_ta: 'Được điều khiển xe mô tô 2 bánh có dung tích xi lanh < 175 cm³' },
  { icon: '🏍️', hang: 'Hạng A',  mo_ta: 'Được điều khiển xe mô tô 2 bánh có dung tích xi lanh từ 175 cm³ trở lên, bao gồm hạng A1' },
  { icon: '🚗', hang: 'Hạng B1', mo_ta: 'Được điều khiển xe ô tô số tự động 4 – 9 chỗ và tải số tự động dưới 3.5 tấn, không được hành nghề lái xe' },
  { icon: '🚗', hang: 'Hạng B2', mo_ta: 'Được điều khiển xe ô tô số sàn và số tự động 4 – 9 chỗ và tải dưới 3.5 tấn, được hành nghề lái xe' },
  { icon: '🚛', hang: 'Hạng C',  mo_ta: 'Được điều khiển xe ô tô số sàn và số tự động 4 – 9 chỗ và tải cả trên dưới 3.5 tấn, được hành nghề lái xe' },
]

const luatMoi = [
  { icon: '🏍️', hang: 'Hạng A1',         mo_ta: 'Được điều khiển xe mô tô 2 bánh có dung tích xi lanh ≤ 125 cm³, động cơ điện có công suất ≤ 11KW' },
  { icon: '🏍️', hang: 'Hạng A2',         mo_ta: 'Được điều khiển xe mô tô 2 bánh có dung tích xi lanh > 125 cm³, động cơ điện có công suất > 11KW, bao gồm hạng A1' },
  { icon: '🚗', hang: 'Hạng B số Tự Động', mo_ta: 'Được điều khiển các loại xe mô tô 03 bánh và các xe quy định của hạng A1' },
  { icon: '🚗', hang: 'Hạng B Số Sàn',    mo_ta: 'Bao gồm hạng B số sàn (hạng B2 cũ), và hạng B số tự động (hạng B1 cũ). Được điều khiển ô tô tải và ô tô chuyên dùng có khối lượng toàn bộ ≤ 3.500kg' },
  { icon: '🚛', hang: 'Hạng C1',          mo_ta: 'Được điều khiển ô tô tải và ô tô chuyên dùng có khối lượng toàn bộ 3.500kg → 7.500kg, và các loại xe quy định của hạng B' },
  { icon: '🚛', hang: 'Hạng C',           mo_ta: 'Được điều khiển ô tô tải và ô tô chuyên dùng có khối lượng toàn bộ > 7.500kg, và các loại xe quy định của hạng B và C1 (lưu ý: hiện hạng C chỉ được nâng hạng từ B hoặc C1 chứ không thể học thẳng từ đầu)' },
]

const dieuKien = [
  'Là công dân Việt Nam hoặc người nước ngoài đang làm việc và sinh sống tại Việt Nam',
  'Từ 18 tuổi đối với hạng A1, A, B1, B, C1',
  'Đủ điều kiện sức khỏe theo quy định',
  'Không yêu cầu về bằng cấp hay trình độ văn hóa.',
]

const BangItem = ({ icon, hang, mo_ta }) => (
  <div className="bang-item">
    <span className="bang-icon">{icon}</span>
    <div>
      <strong>{hang}</strong>
      <p>{mo_ta}</p>
    </div>
  </div>
)

const SectionLoaiBang = () => (
  <section className="section-lb">
    <div className="container">
      <h2 className="section-title">Thông tin về các bằng lái xe hạng A, B, C1, C</h2>

      <div className="lb-compare-grid">
        {/* Luật cũ */}
        <div className="lb-box lb-box--blue">
          <div className="lb-box-header lb-header--blue">
            <span>📋</span> Luật cũ trước 2025
          </div>
          <div className="lb-box-body">
            {luatCu.map((item, i) => <BangItem key={i} {...item} />)}
          </div>
        </div>

        {/* Luật mới */}
        <div className="lb-box lb-box--green">
          <div className="lb-box-header lb-header--green">
            <span>📋</span> Luật mới áp dụng từ 01/01/2025
          </div>
          <div className="lb-box-body">
            {luatMoi.map((item, i) => <BangItem key={i} {...item} />)}
          </div>
        </div>
      </div>

      {/* Bottom: điều kiện (không có ảnh sân tập) */}
      <div className="lb-dieu-kien">
        <h4>Điều kiện học lái xe ô tô</h4>
        <ul>
          {dieuKien.map((dk, i) => (
            <li key={i}>
              <span className="dk-dot">•</span> {dk}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
)

export default SectionLoaiBang
