import './SectionThuTuc.css'

const hoSoItems = [
  'Giấy khám sức khỏe theo quy định (sẽ được trung tâm hướng dẫn chi tiết khi đăng ký, không cần chuẩn bị trước)',
  '12 ảnh 3×4 nền xanh dương đậm, không đeo kính, tóc gọn không che tai và chân mày (được hỗ trợ chụp miễn phí tại trung tâm)',
  'Photo tất cả các bằng lái xe hiện có (nếu có – trung tâm hỗ trợ photo khi làm hồ sơ)',
  '2 bản photo CMND/CCCD (không cần công chứng, sẽ được hỗ trợ chuẩn bị tại trung tâm)',
]

const SectionThuTuc = () => (
  <section className="section-tt">
    <div className="container">
      <h2 className="section-title" style={{ color: '#333' }}>
        Thủ tục đăng ký học bằng lái xe tại Trung Tâm Lái Xe Sao Việt
      </h2>

      <div className="tt-grid">
        {/* Hồ sơ */}
        <div className="tt-box">
          <h4>Hồ sơ đăng ký học lái xe tại Sao Việt gồm:</h4>
          <ul>
            {hoSoItems.map((item, i) => (
              <li key={i}>
                <span className="tt-check">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Ảnh thẻ chuẩn */}
        <div className="tt-anh">
          <img
            src="/anhmau3x4.jpg"
            alt="Ảnh mẫu 3x4 chuẩn"
            className="tt-anh-mau"
          />
        </div>
      </div>
    </div>
  </section>
)

export default SectionThuTuc
