import { useState, useRef, useEffect } from 'react'
import { GoogleGenAI } from '@google/genai'
import { useAdmin } from '../../context/AdminContext'
import axios from 'axios'
import './AIAssistant.css'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const ai      = new GoogleGenAI({ apiKey: API_KEY })

// ════════════════════════════════════════════════════════════════
// Gọi tất cả API cần thiết để lấy dữ liệu hệ thống
// ════════════════════════════════════════════════════════════════
const fetchAllContext = async (backendUrl, token) => {
  const h = { Authorization: `Bearer ${token}` }
  const safe = async (fn) => { try { const r = await fn(); return r.data?.success ? r.data : null } catch { return null } }

  const [dash, extra, baoLoi, xeList, lopList, gvList, hocPhi,
         lichThi, hoSo, khoaHoc, capBang, lienHe, baiThi] = await Promise.all([
    safe(() => axios.get(`${backendUrl}/api/admin/dashboard`,           { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/dashboard-extra`,     { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/bao-loi-xe`,          { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/xe`,                  { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/lop-hoc`,             { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/giang-vien`,          { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/hoc-phi`,             { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/lich-thi`,            { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/ho-so`,               { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/khoa-hoc-dao-tao`,    { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/cap-bang/tot-nghiep`, { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/lien-he`,             { headers: h })),
    safe(() => axios.get(`${backendUrl}/api/admin/bai-thi`,             { headers: h })),
  ])

  return {
    stats     : dash?.stats               || {},
    extra     : extra                      || {},
    baoLoi    : baoLoi?.data              || [],
    xeList    : xeList?.data              || [],
    lopList   : lopList?.data             || [],
    gvList    : gvList?.giang_vien        || gvList?.data || [],
    hocPhiList: hocPhi?.data              || [],
    lichThiList: lichThi?.data            || [],
    hoSoList  : hoSo?.data                || [],
    khoaHocList: khoaHoc?.data            || [],
    capBangList: capBang?.data            || [],
    lienHeList : lienHe?.data             || [],
    baiThiList : baiThi?.data             || [],
  }
}

// ════════════════════════════════════════════════════════════════
// Build system prompt - tối ưu token, chỉ giữ số liệu cần thiết
// ════════════════════════════════════════════════════════════════
const buildSystemPrompt = (adminInfo, ctx) => {
  const s  = ctx?.stats        || {}
  const bl = ctx?.baoLoi       || []
  const xe = ctx?.xeList       || []
  const lp = ctx?.lopList      || []
  const gv = ctx?.gvList       || []
  const hp = ctx?.hocPhiList   || []
  const lt = ctx?.lichThiList  || []
  const hs = ctx?.hoSoList     || []
  const kh = ctx?.khoaHocList  || []
  const cb = ctx?.capBangList  || []
  const lh = ctx?.lienHeList   || []
  const bt = ctx?.baiThiList   || []

  // Hồ sơ theo trạng thái (gộp gọn)
  const hsTheoTT = hs.reduce((acc, h) => { acc[h.trang_thai] = (acc[h.trang_thai]||0)+1; return acc }, {})
  const hsTheoTTStr = Object.entries(hsTheoTT).map(([tt,n]) => `${tt}:${n}`).join(', ')

  // Xe hỏng và bảo trì
  const xeHong   = xe.filter(x => x.trang_thai === 'hong')
  const xeBaoTri = xe.filter(x => x.trang_thai === 'bao_tri')

  // Báo lỗi xe chờ xử lý (chỉ lấy 3 cái mới nhất)
  const blCho = bl.filter(b => b.trang_thai === 'cho_xu_ly')
  const blStr = blCho.slice(0,3).map(b =>
    `[${b.muc_do}]${b.xe?.bien_so||'?'}:"${b.tieu_de?.substring(0,30)}"(${b.created_at?.slice(0,10)||''})`
  ).join(' | ')

  // Lớp đang học (chỉ tên + số HV)
  const lpDangHoc = lp.filter(l => l.trang_thai === 'dang_hoc')
  const lpStr = lpDangHoc.slice(0,6).map(l => `${l.ten_lop}(${l.si_so||0}HV)`).join(', ')

  // Lịch thi sắp tới (3 cái)
  const ltSap = lt.filter(l => new Date(l.ngay_thi) >= new Date()).slice(0,3)
  const ltStr = ltSap.map(l => `${l.ngay_thi?.slice(0,10)} ${l.loai_thi==='tot_nghiep'?'TN':'SH'} ${l.dia_diem||''}`).join(' | ')

  // Giảng viên tóm tắt
  const gvActive = gv.filter(g => g.trang_thai === 'active' || g.is_active).length

  // Khóa học (tên + loại bằng)
  const khStr = kh.slice(0,5).map(k => `${k.ten_khoa||k.ma_khoa}(${k.loai_bang})`).join(', ')

  // Bài thi cấu hình
  const btStr = bt.map(b => `${b.loai_bang}:đạt≥${b.diem_dat}/${b.diem_toi_da}`).join(', ')

  return `Bạn là trợ lý AI của Trung Tâm Lái Xe Sao Việt. Admin: ${adminInfo?.ho_ten||'Admin'}.

DỮ LIỆU HỆ THỐNG:
Tổng hồ sơ:${s.tongHoSo||0} | Chờ đóng HP:${s.choDongHocPhi||0} | Chờ mở lớp:${s.choMoLop||0} | Đang học:${s.dangHoc||0} | Đủ ĐK thi:${s.duDieuKienThi||0} | Đã đậu TN:${s.dauTotNghiep||0}
Lịch học hôm nay:${s.lichHoc||0} buổi | Doanh thu tháng:${s.doanhThu ? Number(s.doanhThu).toLocaleString('vi-VN')+'đ' : '0đ'}
Hồ sơ: ${hsTheoTTStr||'không có'}
Xe: tổng ${xe.length} | sẵn sàng:${xe.filter(x=>x.trang_thai==='san_sang').length} | bảo trì:${xeBaoTri.length} | hỏng:${xeHong.length}${xeHong.length>0?' ('+xeHong.map(x=>x.bien_so).join(',')+')'  :''}
Báo lỗi xe: tổng ${bl.length} | chờ XL:${blCho.length} | đang XL:${bl.filter(b=>b.trang_thai==='dang_xu_ly').length}${blCho.length>0?' | chi tiết: '+blStr:''}
Lớp học: tổng ${lp.length} | đang học:${lpDangHoc.length} | sắp KG:${lp.filter(l=>l.trang_thai==='sap_khai_giang').length}${lpDangHoc.length>0?' | '+lpStr:''}
Lịch thi sắp: ${ltStr||'không có'}
Học phí: đã đóng:${hp.filter(h=>h.trang_thai==='da_dong').length} | chưa đóng:${hp.filter(h=>h.trang_thai==='chua_dong').length} | còn nợ:${hp.filter(h=>h.trang_thai==='con_no').length}
GV: tổng ${gv.length} | active:${gvActive} | LT:${gv.filter(g=>g.chuyen_mon==='ly_thuyet').length} | TH:${gv.filter(g=>g.chuyen_mon==='thuc_hanh').length} | cả2:${gv.filter(g=>g.chuyen_mon==='ca_hai').length}
Khóa học: ${khStr||kh.length+' khóa'}
Cấp bằng TN chờ: ${cb.filter(c=>!c.ngay_cap_bang).length} | Liên hệ chờ: ${lh.filter(l=>!l.da_xu_ly).length}
Bài thi: ${btStr||bt.length+' loại'}

PHẠM VI: Chỉ trả lời về quản lý trung tâm lái xe (HV/lớp/xe/thi/HP/GV/cấp bằng) và luật/quy trình thi bằng lái VN. Câu ngoài phạm vi: từ chối lịch sự.
QUY TẮC: Tiếng Việt, ngắn gọn, dùng số liệu trên, không bịa số, dùng emoji.
Nếu hỏi về dữ liệu cụ thể không có trong context (ví dụ: doanh thu tháng khác, danh sách tên học viên cụ thể, chi tiết hồ sơ cá nhân...): trả lời "📋 Tôi chỉ có dữ liệu tổng hợp hiện tại, không có thông tin chi tiết về [chủ đề đó]. Bạn có thể kiểm tra trực tiếp trên trang quản lý tương ứng."`
}

// ════════════════════════════════════════════════════════════════
// Component chính
// ════════════════════════════════════════════════════════════════
const AIAssistant = () => {
  const { token, adminInfo, backendUrl, isAdmin } = useAdmin()
  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [ctx,       setCtx]       = useState(null)
  const [ctxLoaded, setCtxLoaded] = useState(false)
  const chatRef    = useRef(null)
  const inputRef   = useRef(null)
  const sessionRef = useRef(null)  // ChatSession

  if (!isAdmin) return null

  // ── Tải dữ liệu khi mở lần đầu ──────────────────────────────
  useEffect(() => {
    if (open && !ctxLoaded && token) {
      fetchAllContext(backendUrl, token).then(data => {
        setCtx(data)
        setCtxLoaded(true)
      })
    }
  }, [open, ctxLoaded, token, backendUrl])

  // ── Khởi tạo model + chat session khi ctx sẵn sàng ──────────
  // systemInstruction PHẢI truyền vào getGenerativeModel(), không phải startChat()
  useEffect(() => {
    if (!open || !ctxLoaded || sessionRef.current) return

    const sysPrompt = buildSystemPrompt(adminInfo, ctx)

    // gemini-2.5-flash-lite: nhanh, tiết kiệm token, còn quota free tier
    sessionRef.current = ai.chats.create({
      model: 'gemini-2.5-flash-lite',
      config: {
        systemInstruction: sysPrompt,
        maxOutputTokens: 400,
        temperature: 0.4,
      },
      history: [],
    })

    // Tin nhắn chào với dữ liệu thực
    const s  = ctx?.stats || {}
    const bl = ctx?.baoLoi?.filter(b => b.trang_thai === 'cho_xu_ly') || []
    const xh = ctx?.xeList?.filter(x => x.trang_thai === 'hong')      || []
    const lh = ctx?.lienHeList?.filter(l => !l.da_xu_ly)              || []

    let greeting = `Xin chào **${adminInfo?.ho_ten || 'Admin'}**! 👋\n\n`
    greeting += `📊 Hệ thống: **${s.tongHoSo||0}** học viên | **${ctx?.lopList?.filter(l=>l.trang_thai==='dang_hoc').length||0}** lớp đang học`
    if (bl.length > 0) greeting += ` | ⚠️ **${bl.length}** báo lỗi xe chờ xử lý`
    if (xh.length > 0) greeting += ` | 🔧 **${xh.length}** xe đang hỏng`
    if (lh.length > 0) greeting += ` | 📩 **${lh.length}** liên hệ chờ`
    greeting += `\n\nTôi hỗ trợ **quản lý trung tâm lái xe** và **luật giao thông**. Hỏi tôi bất kỳ điều gì trong phạm vi đó!`

    setMessages([{ role: 'ai', text: greeting, time: new Date() }])
  }, [open, ctxLoaded, adminInfo, ctx])

  // ── Auto scroll ───────────────────────────────────────────────
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // ── Gọi API với retry khi 503 ────────────────────────────────
  const callWithRetry = async (text, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await sessionRef.current.sendMessage({ message: text })
        return result.text
      } catch (err) {
        const msg = err?.message || ''
        const is503 = msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')
        const is429 = msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')

        // 503: retry sau 1.5s
        if (is503 && attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1500 * attempt))
          continue
        }
        // 429: không retry, báo ngay
        if (is429) throw Object.assign(err, { _type: 'quota' })
        // Lỗi khác
        throw err
      }
    }
  }

  // ── Gửi tin nhắn ─────────────────────────────────────────────
  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading || !sessionRef.current) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', text, time: new Date() }])
    setLoading(true)

    try {
      const aiText = await callWithRetry(text)
      setMessages(prev => [...prev, { role: 'ai', text: aiText, time: new Date() }])
    } catch (err) {
      console.error('Gemini error:', err)
      const msg = err?.message || ''
      let friendly

      if (err._type === 'quota' || msg.includes('429') || msg.includes('quota')) {
        friendly = '⚠️ Hệ thống AI đang bận, vui lòng thử lại sau ít phút.'
      } else if (msg.includes('503') || msg.includes('UNAVAILABLE') || msg.includes('high demand')) {
        friendly = '⚠️ Máy chủ AI đang quá tải. Vui lòng thử lại sau.'
      } else if (msg.includes('API_KEY') || msg.includes('API key')) {
        friendly = '⚠️ Lỗi xác thực. Liên hệ quản trị viên hệ thống.'
      } else {
        friendly = '⚠️ Không lấy được phản hồi. Vui lòng thử lại.'
      }

      setMessages(prev => [...prev, { role: 'ai', text: friendly, time: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  // ── Render markdown ──────────────────────────────────────────
  const renderInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)
    return parts.map((p, i) => {
      if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2,-2)}</strong>
      if (p.startsWith('*')  && p.endsWith('*'))  return <em key={i}>{p.slice(1,-1)}</em>
      return p
    })
  }

  const formatMsg = (text) =>
    text.split('\n').map((line, i, arr) => (
      <span key={i}>{renderInline(line)}{i < arr.length-1 && <br />}</span>
    ))

  const fmtTime = (d) =>
    d ? `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` : ''

  // ── Quick prompts ─────────────────────────────────────────────
  const quickPrompts = [
    '📊 Tổng quan hệ thống hôm nay',
    '⚠️ Báo lỗi xe chưa xử lý',
    '👥 Học viên chờ mở lớp',
    '💰 Học viên còn nợ học phí',
    '🏫 Lớp học đang hoạt động',
    '📅 Lịch thi sắp tới',
    '🎓 Danh sách chờ cấp bằng',
    '📋 Quy trình thi bằng B2',
  ]

  return (
    <>
      <button
        className={`ai-fab ${open ? 'ai-fab--open' : ''}`}
        onClick={() => setOpen(!open)}
        title="Trợ lý AI" aria-label="Mở trợ lý AI"
      >
        {open ? '✕' : '🤖'}
        {!open && <span className="ai-fab-label">AI</span>}
      </button>

      {open && (
        <div className="ai-panel" role="dialog" aria-label="Trợ lý AI">
          {/* Header */}
          <div className="ai-panel-header">
            <div className="ai-header-info">
              <div className="ai-header-avatar">🤖</div>
              <div>
                <p className="ai-header-name">Trợ lý AI Sao Việt</p>
                <p className="ai-header-status">
                  <span className="ai-status-dot" />
                  {ctxLoaded ? 'Đã kết nối dữ liệu hệ thống' : 'Đang tải dữ liệu...'}
                </p>
              </div>
            </div>
            <button className="ai-header-close" onClick={() => setOpen(false)} aria-label="Đóng">✕</button>
          </div>

          {/* Messages */}
          <div className="ai-messages" ref={chatRef}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`ai-msg ai-msg--${msg.role}`}>
                {msg.role === 'ai' && <div className="ai-msg-avatar">🤖</div>}
                <div className="ai-msg-bubble">
                  <div className="ai-msg-text">{formatMsg(msg.text)}</div>
                  <span className="ai-msg-time">{fmtTime(msg.time)}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg ai-msg--ai">
                <div className="ai-msg-avatar">🤖</div>
                <div className="ai-msg-bubble ai-msg-bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length === 1 && (
            <div className="ai-quick-prompts">
              {quickPrompts.map((q, i) => (
                <button key={i} className="ai-quick-btn"
                  onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50) }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-input-area">
            <textarea
              ref={inputRef}
              className="ai-input"
              placeholder={ctxLoaded ? 'Nhập câu hỏi... (Enter để gửi)' : 'Đang tải dữ liệu hệ thống...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading || !ctxLoaded}
              aria-label="Nhập câu hỏi"
            />
            <button className="ai-send-btn" onClick={sendMessage}
              disabled={loading || !input.trim() || !ctxLoaded} aria-label="Gửi">
              {loading ? '⏳' : '➤'}
            </button>
          </div>
          <p className="ai-powered-by">Powered by Google Gemini ✨</p>
        </div>
      )}
    </>
  )
}

export default AIAssistant
