import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import './KhoaHocChiTiet.css'

// Thông tin chi tiết tĩnh theo từng loại bằng
const BANG_INFO = {
  a1: {
    loai_bang: 'A1',
    ten: 'Bằng Lái Xe Hạng A1',
    mo_ta_ngan: 'Dành cho xe mô tô 2 bánh có dung tích xi lanh dưới 125cm³',
    anh: '/bang-lai-a1.jpg',
    mau: 'linear-gradient(135deg,#f7971e,#ffd200)',
    doi_tuong: 'Người từ 16 tuổi trở lên (A1 không yêu cầu bằng cũ)',
    loai_xe: 'Xe mô tô 2 bánh dưới 125cc (Honda Wave, Yamaha Sirius...)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Không cần bằng lái cũ',
    chi_tiet: [
      'Điều khiển xe mô tô 2 bánh có dung tích xi lanh ≤ 125cm³',
      'Điều khiển xe mô tô điện có công suất ≤ 11kW',
      'Phù hợp cho học sinh, sinh viên và người đi làm hàng ngày',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: 'Luật giao thông, biển báo, kỹ thuật lái xe' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Thực hành trên sân tập và đường trường' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết và thực hành tại trung tâm' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại cơ quan nhà nước' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái xe chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '60.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '70.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  a: {
    loai_bang: 'A',
    ten: 'Bằng Lái Xe Hạng A (Trên 125cc)',
    mo_ta_ngan: 'Dành cho xe mô tô phân khối lớn trên 125cm³',
    anh: '/bang-lai-a-tren-125cc.jpg',
    mau: 'linear-gradient(135deg,#f7971e,#ff6b35)',
    doi_tuong: 'Người từ 18 tuổi trở lên, đã có bằng A1 tối thiểu 1 năm',
    loai_xe: 'Xe mô tô phân khối lớn trên 125cc (Honda CB, Yamaha R15...)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Đã có bằng A1 tối thiểu 1 năm',
    chi_tiet: [
      'Điều khiển xe mô tô 2 bánh có dung tích xi lanh > 125cm³',
      'Điều khiển xe mô tô điện có công suất > 11kW',
      'Bao gồm tất cả quyền của hạng A1',
      'Phù hợp cho người đam mê xe phân khối lớn',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, bằng A1, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: 'Nâng cao kỹ thuật lái xe phân khối lớn' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Thực hành trên xe phân khối lớn' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết và thực hành' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại cơ quan nhà nước' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái xe hạng A' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '60.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '70.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  b1: {
    loai_bang: 'B1',
    ten: 'Bằng Lái Xe Hạng B1 (Số Tự Động)',
    mo_ta_ngan: 'Lái xe ô tô số tự động dưới 9 chỗ ngồi',
    anh: '/bang-lai-b1-1.jpg',
    mau: 'linear-gradient(135deg,#0066cc,#0099ff)',
    doi_tuong: 'Người từ 18 tuổi trở lên, không cần bằng cũ',
    loai_xe: 'Ô tô con số tự động dưới 9 chỗ (Toyota Vios AT, Honda City AT...)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Không cần bằng lái cũ',
    chi_tiet: [
      'Điều khiển ô tô số tự động dưới 9 chỗ ngồi',
      'Không được lái xe số sàn (cần nâng lên B2)',
      'Phù hợp cho người mới học lái xe ô tô lần đầu',
      'Thời gian học ngắn hơn B2 do không học số sàn',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '18 buổi — Luật giao thông, biển báo, kỹ thuật lái' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 660km trên xe số tự động' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết và sa hình tại trung tâm' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái B1 chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  b2: {
    loai_bang: 'B2',
    ten: 'Bằng Lái Xe Hạng B2 (Số Sàn)',
    mo_ta_ngan: 'Lái xe ô tô số sàn dưới 9 chỗ ngồi — bằng phổ biến nhất',
    anh: '/bang-lai-b1-2.png',
    mau: 'linear-gradient(135deg,#00b09b,#96c93d)',
    doi_tuong: 'Người từ 18 tuổi trở lên, không cần bằng cũ',
    loai_xe: 'Ô tô con số sàn và số tự động dưới 9 chỗ (Toyota Vios, Altis...)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Không cần bằng lái cũ',
    chi_tiet: [
      'Điều khiển ô tô số sàn và số tự động dưới 9 chỗ ngồi',
      'Bao gồm tất cả quyền của hạng B1',
      'Bằng phổ biến và được sử dụng rộng rãi nhất',
      'Có thể nâng lên hạng C, D sau 3 năm',
      'Xe thực hành: Toyota Vios, Altis đời cao',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '20 buổi — Luật giao thông, biển báo, kỹ thuật lái' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 810km trên xe số sàn' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết, sa hình và đường trường' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái B2 chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  c1: {
    loai_bang: 'C1',
    ten: 'Bằng Lái Xe Hạng C1 (Xe Tải Nhẹ)',
    mo_ta_ngan: 'Lái xe tải có trọng tải từ 3.5 đến 7.5 tấn',
    anh: '/bang-lai-c1-tai-nhe.jpg',
    mau: 'linear-gradient(135deg,#1565c0,#283593)',
    doi_tuong: 'Người từ 21 tuổi, đã có bằng B2 tối thiểu 3 năm',
    loai_xe: 'Xe tải nhẹ 3.5 - 7.5 tấn, xe chuyên dùng cùng trọng tải',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Đã có bằng B2 tối thiểu 3 năm',
    chi_tiet: [
      'Điều khiển ô tô tải trọng tải 3.500kg đến 7.500kg',
      'Điều khiển xe chuyên dùng cùng trọng tải',
      'Bao gồm tất cả quyền của hạng B',
      'Phù hợp cho tài xế xe tải nhẹ, giao hàng',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, bằng B2, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '25 buổi — Kỹ thuật lái xe tải, an toàn hàng hóa' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 1.000km trên xe tải nhẹ' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết, sa hình và đường trường' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái C1 chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  c: {
    loai_bang: 'C',
    ten: 'Bằng Lái Xe Hạng C (Xe Tải Nặng)',
    mo_ta_ngan: 'Lái xe tải có trọng tải trên 7.5 tấn',
    anh: '/bang-lai-c1-tai-nang.png',
    mau: 'linear-gradient(135deg,#1a237e,#283593)',
    doi_tuong: 'Người từ 21 tuổi, đã có bằng B2 tối thiểu 3 năm',
    loai_xe: 'Xe tải nặng trên 7.5 tấn, xe đầu kéo (khi nâng lên CE)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Đã có bằng B2 tối thiểu 3 năm',
    chi_tiet: [
      'Điều khiển ô tô tải trọng tải trên 7.500kg',
      'Điều khiển xe chuyên dùng cùng trọng tải',
      'Bao gồm tất cả quyền của hạng B và C1',
      'Có thể nâng lên CE (xe đầu kéo) sau 3 năm',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, bằng B2, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '30 buổi — Kỹ thuật lái xe tải nặng' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 1.200km trên xe tải nặng' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết, sa hình và đường trường' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái C chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  d: {
    loai_bang: 'D',
    ten: 'Nâng Hạng Bằng Lái Xe Hạng D',
    mo_ta_ngan: 'Lái xe khách từ 9 đến 30 chỗ ngồi — nâng hạng từ B',
    anh: '/bang-lai-d.jpg',
    mau: 'linear-gradient(135deg,#6a1b9a,#9c27b0)',
    doi_tuong: 'Người từ 21 tuổi, đã có bằng B tối thiểu 3 năm',
    loai_xe: 'Xe khách từ 9 đến 30 chỗ ngồi (xe buýt nhỏ, xe limousine...)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Đã có bằng B (B1 hoặc B2) tối thiểu 3 năm',
    chi_tiet: [
      'Điều khiển xe khách từ 9 đến 30 chỗ ngồi',
      'Điều khiển xe chuyên dùng cùng loại',
      'Bao gồm tất cả quyền của hạng B',
      'Phù hợp cho tài xế xe du lịch, xe limousine, xe buýt nhỏ',
      'Có thể nâng lên hạng E sau 3 năm',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, bằng B, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '20 buổi — Kỹ thuật lái xe khách, an toàn hành khách' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 800km trên xe khách 9-30 chỗ' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết, sa hình và đường trường' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái D chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  e: {
    loai_bang: 'E',
    ten: 'Nâng Hạng Bằng Lái Xe Hạng E',
    mo_ta_ngan: 'Lái xe khách trên 30 chỗ ngồi — nâng hạng từ C hoặc D',
    anh: '/bang-lai-e.jpg',
    mau: 'linear-gradient(135deg,#880e4f,#c2185b)',
    doi_tuong: 'Người từ 24 tuổi, đã có bằng C hoặc D tối thiểu 3 năm',
    loai_xe: 'Xe khách trên 30 chỗ ngồi (xe buýt lớn, xe giường nằm...)',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Đã có bằng C hoặc D tối thiểu 3 năm',
    chi_tiet: [
      'Điều khiển xe khách trên 30 chỗ ngồi',
      'Điều khiển xe buýt, xe giường nằm liên tỉnh',
      'Bao gồm tất cả quyền của hạng C và D',
      'Phù hợp cho tài xế xe buýt, xe khách liên tỉnh',
      'Hạng bằng cao nhất trong nhóm xe khách',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, bằng C hoặc D, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '20 buổi — Kỹ thuật lái xe khách lớn, quản lý hành khách' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 800km trên xe khách trên 30 chỗ' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết, sa hình và đường trường' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái E chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
  ce: {
    loai_bang: 'CE',
    ten: 'Nâng Hạng Bằng Lái Xe Hạng CE (Xe Đầu Kéo)',
    mo_ta_ngan: 'Lái xe đầu kéo, xe container — nâng hạng từ C',
    anh: '/bang-lai-ce.jpg',
    mau: 'linear-gradient(135deg,#b71c1c,#e53935)',
    doi_tuong: 'Người từ 21 tuổi, đã có bằng C tối thiểu 3 năm',
    loai_xe: 'Xe đầu kéo, xe container, xe moóc kéo theo',
    thoi_han: 'Không thời hạn',
    yeu_cau_truoc: 'Đã có bằng C tối thiểu 3 năm',
    chi_tiet: [
      'Điều khiển xe đầu kéo kéo theo rơ moóc hoặc sơ mi rơ moóc',
      'Điều khiển xe container, xe tải siêu trường siêu trọng',
      'Bao gồm tất cả quyền của hạng C',
      'Phù hợp cho tài xế vận tải hàng hóa liên tỉnh, quốc tế',
      'Hạng bằng cao nhất trong nhóm xe tải',
    ],
    quy_trinh: [
      { buoc: 1, tieu_de: 'Nộp hồ sơ', mo_ta: 'CCCD, bằng C, ảnh 3x4, giấy khám sức khỏe' },
      { buoc: 2, tieu_de: 'Học lý thuyết', mo_ta: '25 buổi — Kỹ thuật lái xe đầu kéo, kỹ thuật kéo moóc' },
      { buoc: 3, tieu_de: 'Học thực hành', mo_ta: 'Tối thiểu 1.000km trên xe đầu kéo' },
      { buoc: 4, tieu_de: 'Thi tốt nghiệp', mo_ta: 'Thi lý thuyết, sa hình và đường trường' },
      { buoc: 5, tieu_de: 'Thi sát hạch', mo_ta: 'Thi sát hạch tại Sở GTVT' },
      { buoc: 6, tieu_de: 'Nhận bằng', mo_ta: 'Nhận bằng lái CE chính thức' },
    ],
    le_phi: [
      { ten: 'Sát hạch lý thuyết', phi: '100.000đ' },
      { ten: 'Sát hạch mô phỏng', phi: '100.000đ' },
      { ten: 'Sát hạch thực hành trong hình', phi: '350.000đ' },
      { ten: 'Sát hạch đường trường', phi: '80.000đ' },
      { ten: 'Lệ phí cấp bằng PET', phi: '115.000đ' },
    ],
  },
}

const KhoaHocChiTiet = () => {
  const { slug } = useParams()
  const [khoaApi, setKhoaApi]       = useState(null)
  const [allKhoaHoc, setAllKhoaHoc] = useState([])
  const [loading, setLoading]       = useState(true)

  const info = BANG_INFO[slug]

  useEffect(() => {
    if (!info) { setLoading(false); return }
    axios.get('http://localhost:8000/api/khoa-hoc')
      .then(res => {
        if (res.data.success) {
          setAllKhoaHoc(res.data.data)
          const found = res.data.data.find(k => k.loai_bang === info.loai_bang)
          if (found) setKhoaApi(found)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (!info) {
    return (
      <div className="khct-notfound">
        <h2>Không tìm thấy khóa học</h2>
        <Link to="/khoa-hoc">← Xem tất cả khóa học</Link>
      </div>
    )
  }

  // Ưu tiên data từ API, fallback về hardcode
  const ten        = khoaApi?.ten_khoa       || info.ten
  const moTaNgan   = khoaApi?.mo_ta          || info.mo_ta_ngan
  const hocPhi     = khoaApi?.hoc_phi        || null
  const buoiLT     = khoaApi?.so_buoi_ly_thuyet_toi_thieu || null
  const kmTT       = khoaApi?.so_km_toi_thieu || null
  const doiTuong   = khoaApi?.doi_tuong      || info.doi_tuong
  const loaiXe     = khoaApi?.loai_xe_mo_ta  || info.loai_xe
  const thoiHan    = khoaApi?.thoi_han_bang  || info.thoi_han
  const yeuCau     = khoaApi?.yeu_cau_truoc  || info.yeu_cau_truoc

  // Quyền lái xe: từ API (mỗi dòng 1 quyền) hoặc hardcode
  const quyenLaiXe = khoaApi?.quyen_lai_xe
    ? khoaApi.quyen_lai_xe.split('\n').filter(Boolean)
    : info.chi_tiet

  // Quy trình: từ API (mỗi dòng 1 bước) hoặc hardcode
  const quyTrinh = khoaApi?.quy_trinh_dao_tao
    ? khoaApi.quy_trinh_dao_tao.split('\n').filter(Boolean).map((line, i) => {
        const [tieu_de, ...rest] = line.split(':')
        return { buoc: i + 1, tieu_de: tieu_de.trim(), mo_ta: rest.join(':').trim() || '' }
      })
    : info.quy_trinh

  // Lệ phí: từ API (JSON string) hoặc hardcode
  let lePhi = info.le_phi
  if (khoaApi?.le_phi_sat_hach) {
    try {
      const parsed = JSON.parse(khoaApi.le_phi_sat_hach)
      if (Array.isArray(parsed)) lePhi = parsed.map(p => ({ ten: p.noi_dung || p.ten, phi: p.muc_phi || p.phi }))
    } catch {}
  }

  return (
    <div className="khct-page">
      {/* Hero */}
      <div className="khct-hero" style={{ background: info.mau }}>
        <div className="container khct-hero-inner">
          <div className="khct-hero-text">
            <span className="khct-badge">Hạng {info.loai_bang}</span>
            <h1>{ten}</h1>
            <p>{moTaNgan}</p>
            {hocPhi && (
              <div className="khct-hero-price">
                <span className="khct-price-label">Học phí trọn gói</span>
                <span className="khct-price-value">{Number(hocPhi).toLocaleString('vi-VN')}đ</span>
              </div>
            )}
            <div className="khct-hero-btns">
              <Link to={`/dang-ky?hang=${info.loai_bang}`} className="khct-btn-primary">📝 Đăng Ký Học Ngay</Link>
              <a href="tel:0934057333" className="khct-btn-outline">📞 0934 057 333</a>
            </div>
          </div>
          <div className="khct-hero-img">
            <img src={info.anh} alt={ten} />
          </div>
        </div>
      </div>

      <div className="container khct-body">
        {/* Thông tin nhanh */}
        <div className="khct-quick-info">
          {[
            { icon:'👤', label:'Đối tượng',             value: doiTuong },
            { icon:'🚗', label:'Loại xe',                value: loaiXe },
            { icon:'📅', label:'Thời hạn bằng',         value: thoiHan },
            { icon:'📋', label:'Yêu cầu trước',         value: yeuCau },
            ...(buoiLT ? [{ icon:'📖', label:'Lý thuyết tối thiểu',    value: `${buoiLT} buổi` }] : []),
            ...(kmTT   ? [{ icon:'🛣️', label:'Km thực hành tối thiểu', value: `${kmTT} km` }] : []),
          ].map((item, i) => (
            <div key={i} className="khct-qi-item">
              <span className="khct-qi-icon">{item.icon}</span>
              <div>
                <p className="khct-qi-label">{item.label}</p>
                <p className="khct-qi-value">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="khct-two-col">
          {/* Cột trái */}
          <div>
            {/* Quyền lái xe */}
            <div className="khct-section">
              <h2>✅ Quyền lái xe được cấp</h2>
              <ul className="khct-list">
                {quyenLaiXe.map((item, i) => (
                  <li key={i}>
                    <span className="khct-check">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Lệ phí nhà nước */}
            <div className="khct-section">
              <h2>💰 Lệ phí sát hạch nhà nước (từ 01/01/2026)</h2>
              <p className="khct-note">Các khoản phí này đã được bao gồm trong học phí trọn gói tại Sao Việt</p>
              <table className="khct-fee-table">
                <thead>
                  <tr><th>Nội dung</th><th>Mức phí</th></tr>
                </thead>
                <tbody>
                  {lePhi.map((f, i) => (
                    <tr key={i}>
                      <td>{f.ten}</td>
                      <td><strong>{f.phi}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cột phải */}
          <div>
            {/* Quy trình */}
            <div className="khct-section">
              <h2>📋 Quy trình đào tạo</h2>
              <div className="khct-steps">
                {quyTrinh.map((step, i) => (
                  <div key={i} className="khct-step">
                    <div className="khct-step-num" style={{ background: info.mau }}>{step.buoc}</div>
                    <div className="khct-step-info">
                      <p className="khct-step-title">{step.tieu_de}</p>
                      <p className="khct-step-desc">{step.mo_ta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="khct-cta">
              <h3>Bắt đầu học ngay hôm nay!</h3>
              <p>Liên hệ tư vấn miễn phí — Khai giảng liên tục hàng tháng</p>
              <Link to={`/dang-ky?hang=${info.loai_bang}`} className="khct-btn-primary" style={{ display:'block', textAlign:'center', marginBottom:12 }}>
                📝 Đăng Ký Học Ngay
              </Link>
              <a href="tel:0934057333" className="khct-btn-outline" style={{ display:'block', textAlign:'center' }}>
                📞 Gọi ngay: 0934 057 333
              </a>
            </div>
          </div>
        </div>

        {/* Xem thêm khóa học */}
        <div className="khct-more">
          <h3>Xem thêm các khóa học khác</h3>
          <div className="khct-more-links">
            {Object.entries(BANG_INFO).filter(([k]) => k !== slug).map(([k, v]) => {
              // Ưu tiên tên từ API, fallback về tên hardcode
              const apiItem = allKhoaHoc.find(kh => kh.loai_bang === v.loai_bang)
              const tenHienThi = apiItem?.ten_khoa || v.ten
              return (
                <Link key={k} to={`/khoa-hoc/${k}`} className="khct-more-item">
                  <img src={v.anh} alt={tenHienThi} />
                  <span>{tenHienThi}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default KhoaHocChiTiet
