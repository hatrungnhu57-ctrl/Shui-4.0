/**
 * CẨM NANG CHƠI HỤI TOÀN TẬP - CHUẨN MIỀN NAM
 * 13 chuyên đề kiến thức, kỹ năng, pháp lý và an toàn khi chơi hụi
 */

export const GUIDE_ARTICLES = [
  {
    id: "guide-1",
    slug: "hui-la-gi",
    title: "1. Hụi là gì? Bản chất tập quán chơi hụi",
    category: "knowledge",
    summary: "Hiểu đúng bản chất hụi: hình thức tương trợ tài chính truyền thống lâu đời của người dân Nam Bộ.",
    content: `
      <p><strong>Hụi</strong> (ở miền Bắc gọi là <em>Họ</em>, miền Trung gọi là <em>Biêu</em> hoặc <em>Phường</em>) là một hình thức giao dịch về tài sản theo tập quán dân gian có từ lâu đời tại Việt Nam, đặc biệt rất phổ biến ở các tỉnh Nam Bộ.</p>
      <p>Bản chất của hụi là một nhóm người (hụi viên) cùng nhau thỏa thuận góp một số tiền định kỳ vào một ngày nhất định, để lần lượt từng người được lĩnh trọn số tiền đó nhằm mục đích:</p>
      <ul>
        <li><strong>Tích lũy, tiết kiệm:</strong> Cho những ai chưa cần tiền gấp, chờ đến các kỳ cuối mới hốt để nhận lãi.</li>
        <li><strong>Huy động vốn nhanh:</strong> Cho những ai đang cần vốn làm ăn, buôn bán hoặc giải quyết việc gấp có thể hốt hụi sớm.</li>
      </ul>
      <p><em>Lưu ý quan trọng:</em> Pháp luật Việt Nam (Nghị định 19/2019/NĐ-CP) công nhận và bảo vệ việc chơi hụi nhằm mục đích tương trợ trong nhân dân, nhưng nghiêm cấm triệt để việc tổ chức hụi để cho vay nặng lãi hoặc lừa đảo chiếm đoạt tài sản.</p>
    `
  },
  {
    id: "guide-2",
    slug: "chu-hui-la-gi",
    title: "2. Chủ hụi (Đầu thảo) là gì? Trách nhiệm và quyền lợi",
    category: "knowledge",
    summary: "Chủ hụi là người đứng mũi chịu sào, tổ chức khơi dây, gom tiền và giao tiền hốt hụi.",
    content: `
      <p><strong>Chủ hụi</strong> (còn gọi là <em>Đầu thảo</em>) là người đứng ra khởi xướng, lập ra dây hụi, rủ rê các hụi viên, trực tiếp thu tiền góp của từng người và giao số tiền hốt hụi cho người trúng trong từng kỳ.</p>
      <p><strong>Quyền lợi của chủ hụi:</strong></p>
      <ul>
        <li>Được quyền hốt kỳ đầu tiên (kỳ số 1) mà không phải chịu tiền thăm/lãi (hốt hụi không mất tiền bỏ thăm), gọi là hưởng phần hụi đầu.</li>
        <li>Được hưởng một khoản tiền thù lao quản lý gọi là <strong>Tiền thảo</strong> (thường theo thỏa thuận bằng 50% mức góp 1 phần của 1 kỳ khi hụi viên hốt).</li>
      </ul>
      <p><strong>Trách nhiệm nặng nề của chủ hụi:</strong></p>
      <ul>
        <li>Phải đôn đốc thu đủ tiền hụi chết, hụi sống đúng hẹn.</li>
        <li>Theo tập quán và luật định, nếu hụi viên giựt hụi hoặc trễ hạn, chủ hụi có trách nhiệm ứng tiền đóng bù để giao đủ tiền cho người hốt kỳ đó.</li>
        <li>Phải lập sổ theo dõi minh bạch, ghi nhận chứng từ đóng tiền rõ ràng.</li>
      </ul>
    `
  },
  {
    id: "guide-3",
    slug: "hui-vien-la-gi",
    title: "3. Hụi viên (Tay hụi / Con hụi / Chân hụi) là ai?",
    category: "knowledge",
    summary: "Người tham gia góp tiền trong dây hụi, có thể tham gia một hoặc nhiều chân.",
    content: `
      <p><strong>Hụi viên</strong> là các cá nhân tham gia vào dây hụi theo lời mời của chủ hụi hoặc thông qua sự giới thiệu.</p>
      <ul>
        <li>Mỗi suất tham gia được gọi là một <strong>Chân hụi</strong> hoặc <strong>Phần hụi</strong>.</li>
        <li>Một hụi viên có thể chơi 1 chân, 2 chân hoặc nửa chân (chia phần với người khác).</li>
        <li>Hụi viên có quyền tham gia bỏ thăm, kêu hụi hoặc quay số để lĩnh tiền hụi khi đến kỳ khui.</li>
        <li>Nghĩa vụ cao nhất của hụi viên là nộp tiền đúng hạn; sau khi hốt hụi phải có trách nhiệm đóng hụi chết đầy đủ cho đến khi mãn dây.</li>
      </ul>
    `
  },
  {
    id: "guide-4",
    slug: "hui-song-hui-chet",
    title: "4. Hụi sống và Hụi chết là gì? Cách tính tiền chuẩn",
    category: "knowledge",
    summary: "Phân biệt rạch ròi giữa chân hụi sống và chân hụi chết cùng công thức tính tiền mỗi kỳ.",
    content: `
      <p>Đây là hai khái niệm cơ bản nhất trong cách chơi hụi có lãi của miền Nam:</p>
      <h4>1. Hụi Sống (Chưa Hốt Hụi):</h4>
      <p>Là những chân hụi mà chủ nhân <strong>chưa từng hốt hụi</strong> ở các kỳ trước. Khi đến kỳ đóng tiền, hụi sống được quyền <strong>trừ bớt số tiền thăm trúng</strong> của người hốt kỳ đó.</p>
      <div style="background:#f0fdf4; padding:8px 12px; border-radius:6px; border-left:4px solid #22c55e; margin:8px 0;">
        <strong>Công thức Hụi Sống:</strong><br/>
        <em>Tiền phải đóng = (Mức góp định kỳ - Mức tiền thăm trúng) × Số chân</em>
      </div>

      <h4>2. Hụi Chết (Đã Hốt Hụi):</h4>
      <p>Là những chân hụi mà người chơi <strong>đã hốt hụi</strong> ở các kỳ trước. Kể từ kỳ tiếp theo sau khi hốt, người này chuyển thành hụi chết, bắt buộc phải đóng <strong>đủ 100% mức góp gốc</strong> mà không được trừ bất kỳ khoản lãi nào.</p>
      <div style="background:#fef2f2; padding:8px 12px; border-radius:6px; border-left:4px solid #ef4444; margin:8px 0;">
        <strong>Công thức Hụi Chết:</strong><br/>
        <em>Tiền phải đóng = Mức góp định kỳ × Số chân</em>
      </div>
    `
  },
  {
    id: "guide-5",
    slug: "hot-hui-khui-hui",
    title: "5. Khui hụi và Hốt hụi là gì? Quy trình diễn ra",
    category: "knowledge",
    summary: "Quy trình tổ chức một buổi khui hụi từ việc kiểm diện, bỏ giá đến bàn giao tiền.",
    content: `
      <p><strong>Khui hụi</strong> là buổi gặp gỡ (trực tiếp hoặc trực tuyến) vào đúng ngày giờ đã thỏa thuận để xác định ai là người được nhận tiền của kỳ đó.</p>
      <p><strong>Hốt hụi</strong> (Lãnh hụi) là hành động người trúng kỳ đó nhận toàn bộ số tiền gom được từ các chân hụi sống và hụi chết.</p>
      <p><strong>Số tiền người hốt nhận thực tế:</strong></p>
      <ul>
        <li>Cộng tất cả tiền đóng của các phần hụi sống (đã trừ thăm).</li>
        <li>Cộng tất cả tiền đóng của các phần hụi chết (đóng đủ gốc).</li>
        <li>Trừ đi phần hụi của chính người hốt kỳ này.</li>
        <li>Trừ tiền thảo cho chủ hụi (nếu có thỏa thuận).</li>
      </ul>
    `
  },
  {
    id: "guide-6",
    slug: "keu-hui-bo-lai",
    title: "6. Kêu hụi (Bỏ lãi) là gì?",
    category: "knowledge",
    summary: "Hình thức đấu giá tiền thăm công khai giữa các hụi viên hụi sống.",
    content: `
      <p>Trong hình thức <strong>Kêu hụi công khai</strong>, tại buổi khui, những người có nhu cầu cần hốt sẽ lần lượt xướng giá tiền lãi (tiền thăm) mà mình chấp nhận chịu cho mỗi phần.</p>
      <p><strong>Ví dụ:</strong> Dây hụi 2.000.000đ/tháng.<br/>
      - Chị Ba kêu 200.000đ.<br/>
      - Anh Năm cần tiền hơn, kêu 350.000đ.<br/>
      - Không ai kêu cao hơn thì Anh Năm trúng hụi kỳ này với mức thăm 350.000đ.</p>
      <p>Khi đó, mỗi chân hụi sống chỉ phải nộp: <code>2.000.000 - 350.000 = 1.650.000đ</code>.</p>
    `
  },
  {
    id: "guide-7",
    slug: "bo-tham-kin",
    title: "7. Bỏ thăm kín là gì? Khi nào nên áp dụng?",
    category: "knowledge",
    summary: "Ghi mức thăm vào phiếu kín để đảm bảo tính bất ngờ, công bằng và tránh cạnh tranh đẩy lãi quá cao.",
    content: `
      <p><strong>Bỏ thăm kín</strong> là hình thức mỗi hụi viên muốn hốt sẽ tự ghi mức giá tiền thăm mình chấp nhận chịu vào một mảnh giấy nhỏ, gấp kín lại và đưa cho chủ hụi.</p>
      <p>Sau khi nhận đủ phiếu của những người tham gia bỏ thăm, chủ hụi mở đồng loạt trước sự chứng kiến của mọi người. Ai ghi mức giá cao nhất sẽ là người trúng hụi.</p>
      <p><strong>Trường hợp bằng giá:</strong> Nếu có 2 hay nhiều người cùng bỏ mức giá cao nhất bằng nhau, có thể chọn hình thức bốc thăm lại giữa những người đó hoặc quay số random.</p>
    `
  },
  {
    id: "guide-8",
    slug: "quay-random-khi-nao",
    title: "8. Khi nào nên quay Random (Xổ số may mắn)?",
    category: "knowledge",
    summary: "Ứng dụng quay ngẫu nhiên cho hụi không lãi, hụi tương trợ gia đình hoặc khi hòa thăm.",
    content: `
      <p>Quay số ngẫu nhiên (Random Draw) là phương pháp hiện đại, minh bạch tuyệt đối được khuyến khích trong các trường hợp:</p>
      <ul>
        <li><strong>Hụi không lãi (Hụi tương trợ):</strong> Mọi người chơi hụi nhằm mục đích tích lũy thuần túy, ai đến lượt may mắn thì được nhận trước không mất lãi.</li>
        <li><strong>Khi có nhiều người bằng giá thăm:</strong> Không muốn nâng giá làm thiệt hại người chơi, việc quay random giữa những người bằng giá là giải pháp công bằng nhất.</li>
        <li><strong>Hụi gia đình, bạn bè công sở:</strong> Muốn tạo không khí vui vẻ, minh bạch, tránh cạnh tranh tiền bạc.</li>
      </ul>
      <p><em>Quy tắc vàng:</em> Chỉ quay số giữa những người <strong>chưa từng hốt</strong> và <strong>không có nợ tồn đọng</strong>.</p>
    `
  },
  {
    id: "guide-9",
    slug: "luu-y-nguoi-moi",
    title: "9. Người mới chơi hụi cần lưu ý những gì?",
    category: "safety",
    summary: "Những nguyên tắc sống còn giúp bảo toàn vốn cho người mới bắt đầu.",
    content: `
      <ol>
        <li><strong>Chọn chủ hụi có uy tín, có tài sản bảo đảm:</strong> Tuyệt đối không chơi với chủ hụi mở quá nhiều dây hụi cùng lúc hoặc có lối sống xa hoa bất thường.</li>
        <li><strong>Biết rõ mặt và lai lịch các hụi viên khác:</strong> Yêu cầu chủ hụi công khai danh sách họ tên, số điện thoại của toàn bộ tay hụi trong dây.</li>
        <li><strong>Không tham lãi quá cao:</strong> Những dây hụi có người bỏ thăm với mức lãi cao bất thường (trên 30-40% giá trị phần) thường tiềm ẩn nguy cơ giựt hụi rất lớn.</li>
        <li><strong>Giữ lại toàn bộ biên nhận và lịch sử chuyển khoản:</strong> Tuyệt đối không giao tiền mặt mà không có ký nhận hoặc tin nhắn xác nhận.</li>
      </ol>
    `
  },
  {
    id: "guide-10",
    slug: "dau-hieu-rui-ro",
    title: "10. Nhận diện các dấu hiệu dây hụi rủi ro (Báo động đỏ)",
    category: "safety",
    summary: "Cảnh giác trước các biểu hiện có thể dẫn đến vỡ hụi, giựt hụi.",
    content: `
      <div style="background:#fef2f2; border:1px solid #fecaca; border-radius:8px; padding:12px;">
        <h4 style="color:#b91c1c; margin-bottom:6px;">⚠️ CÁC DẤU HIỆU CẦN RÚT LUI HOẶC KIỂM TRA NGAY:</h4>
        <ul style="color:#7f1d1d;">
          <li>Chủ hụi mập mờ, không cung cấp danh sách thành viên trong dây.</li>
          <li>Xuất hiện hụi viên "ma" (chủ hụi tự ý kê thêm tên người lạ để hốt lấy tiền xoay sở).</li>
          <li>Chủ hụi liên tục khất lần việc giao tiền sau khi hốt (quá 2-3 ngày không giao).</li>
          <li>Nhiều người bỏ lãi cao ngất ngưởng rồi sau khi hốt thì mất liên lạc.</li>
          <li>Chủ hụi liên tục mở dây hụi mới để lấy tiền dây sau bù tiền thiếu hụt của dây trước.</li>
        </ul>
      </div>
    `
  },
  {
    id: "guide-11",
    slug: "chung-cu-dong-tien",
    title: "11. Cần lưu chứng cứ gì khi giao nhận tiền hụi?",
    category: "law",
    summary: "Cách lập bằng chứng pháp lý hợp lệ theo quy định của Bộ luật Dân sự.",
    content: `
      <p>Khi có tranh chấp xảy ra, Tòa án và Cơ quan chức năng chỉ căn cứ vào <strong>chứng cứ xác thực</strong>:</p>
      <ul>
        <li><strong>Ưu tiên Chuyển khoản ngân hàng:</strong> Nội dung chuyển khoản ghi rõ ràng: <code>[Họ tên] dong hui [Tên dây] ky [Số kỳ]</code>.</li>
        <li><strong>Biên nhận / Giấy giao nhận có chữ ký:</strong> Nếu giao tiền mặt, phải có ký xác nhận của chủ hụi có ghi rõ ngày tháng và số tiền bằng chữ.</li>
        <li><strong>Hình ảnh / Tin nhắn Zalo:</strong> Chụp lại màn hình xác nhận đã nhận tiền từ chủ hụi.</li>
        <li><strong>Sổ hụi điện tử:</strong> Xuất file PDF/Excel từ ứng dụng Sổ Hụi để đối chiếu định kỳ.</li>
      </ul>
    `
  },
  {
    id: "guide-12",
    slug: "mau-thoa-thuan-hui",
    title: "12. Mẫu Thỏa thuận Chơi hụi Đơn giản & Hợp pháp",
    category: "template",
    summary: "Mẫu cam kết văn bản rõ ràng giữa chủ hụi và các hụi viên trước khi khởi động dây hụi.",
    content: `
      <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:12px; border-radius:8px; font-family:monospace; font-size:12px; white-space:pre-wrap;">
CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

GIẤY THỎA THUẬN CHƠI HỤI
(Theo Nghị định 19/2019/NĐ-CP)

Hôm nay, ngày ... tháng ... năm ..., tại: ...
Chúng tôi gồm có:
1. CHỦ HỤI: Ông/Bà ... - CCCD: ... - SĐT: ... - Địa chỉ: ...
2. CÁC HỤI VIÊN: Gồm ... thành viên theo danh sách đính kèm.

Hai bên thống nhất các điều khoản dây hụi như sau:
- Tên dây hụi: ...
- Mức tiền góp: ... VNĐ/kỳ cho mỗi phần hụi.
- Tổng số phần: ... phần (tương ứng ... kỳ).
- Chu kỳ mở: Ngày ... hàng tháng (hoặc ... hàng tuần).
- Hình thức khui: Kêu hụi có lãi / Bỏ thăm kín / Quay ngẫu nhiên.
- Tiền thảo chủ hụi: ... VNĐ khi hốt hụi.
- Trách nhiệm nộp tiền: Hụi viên nộp trong vòng 24h kể từ khi khui.
- Trách nhiệm chủ hụi: Giao đủ tiền cho người hốt trong vòng 24h sau khi thu.

Các bên cam kết thực hiện đúng thỏa thuận, không tự ý bỏ dở.
      </div>
    `
  },
  {
    id: "guide-13",
    slug: "khuyen-cao-phap-ly",
    title: "13. Khuyến cáo Pháp lý & Giới hạn của Ứng dụng",
    category: "law",
    summary: "Tuyên bố miễn trừ trách nhiệm và hướng dẫn tuân thủ Nghị định 19/2019/NĐ-CP.",
    content: `
      <p>Ứng dụng <strong>Sổ Hụi</strong> tuân thủ nghiêm ngặt các nguyên tắc:</p>
      <ul>
        <li><strong>Chỉ là công cụ hỗ trợ:</strong> Giúp người dùng ghi chép, lập sổ sách, tính toán toán học, tạo biên nhận và thông báo nhắc việc.</li>
        <li><strong>Không can thiệp dòng tiền:</strong> Ứng dụng không mở tài khoản ví điện tử, không lưu trữ tiền bạc của bất kỳ ai, không thu phí trung gian giao dịch.</li>
        <li><strong>Tuân thủ trần lãi suất:</strong> Lãi suất phát sinh từ việc bỏ thăm không được vượt quá 20%/năm theo quy định tại Bộ luật Dân sự 2015.</li>
        <li><strong>Thông báo UBND cấp xã:</strong> Với các dây hụi có giá trị từ 100 triệu đồng trở lên hoặc mở từ 2 dây hụi trở lên, chủ hụi có nghĩa vụ thông báo bằng văn bản cho UBND cấp xã nơi cư trú theo Điều 14 Nghị định 19/2019/NĐ-CP.</li>
      </ul>
    `
  }
];
