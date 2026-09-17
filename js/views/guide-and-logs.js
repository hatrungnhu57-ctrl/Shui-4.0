/**
 * CẨM NANG CHƠI HỤI MIỀN NAM & NHẬT KÝ KIỂM TOÁN (GUIDE & ACTIVITY LOGS)
 */

import { store } from '../store.js';
import { GUIDE_ARTICLES } from '../guide-data.js';

export function renderGuideView(container) {
  let activeCategory = 'all';

  function renderHTML() {
    const filteredArticles = activeCategory === 'all'
      ? GUIDE_ARTICLES
      : GUIDE_ARTICLES.filter(a => a.category === activeCategory);

    container.innerHTML = `
      <div>
        <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">📚 Cẩm Nang Chơi Hụi Toàn Tập</h2>
        <div style="font-size: 12.5px; color: var(--text-muted);">
          Kiến thức, quy tắc tính tiền, pháp lý & phòng chống rủi ro chuẩn miền Nam
        </div>
      </div>

      <!-- Bộ lọc danh mục -->
      <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 4px;">
        <button class="btn btn-sm btn-guide-cat ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}" data-cat="all">
          Tất cả (13)
        </button>
        <button class="btn btn-sm btn-guide-cat ${activeCategory === 'knowledge' ? 'btn-primary' : 'btn-outline'}" data-cat="knowledge">
          📖 Thuật ngữ & Cách tính
        </button>
        <button class="btn btn-sm btn-guide-cat ${activeCategory === 'safety' ? 'btn-primary' : 'btn-outline'}" data-cat="safety">
          🛡️ Phòng ngừa rủi ro
        </button>
        <button class="btn btn-sm btn-guide-cat ${activeCategory === 'law' ? 'btn-primary' : 'btn-outline'}" data-cat="law">
          ⚖️ Pháp lý & Bằng chứng
        </button>
        <button class="btn btn-sm btn-guide-cat ${activeCategory === 'template' ? 'btn-primary' : 'btn-outline'}" data-cat="template">
          📝 Mẫu thỏa thuận
        </button>
      </div>

      <!-- Danh sách bài viết cẩm nang (Accordion) -->
      <div class="item-list">
        ${filteredArticles.map(art => `
          <div class="card guide-card" data-id="${art.id}" style="cursor: pointer;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 14.5px; font-weight: 700; color: var(--text-main); flex: 1;">
                ${art.title}
              </h3>
              <span class="guide-toggle-icon" style="font-size: 14px; color: var(--text-muted); margin-left: 8px;">▼</span>
            </div>
            <p style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">
              ${art.summary}
            </p>
            <div class="guide-content" id="content-${art.id}" style="display: none; font-size: 13.5px; line-height: 1.6; border-top: 1px dashed var(--border-color); padding-top: 10px; margin-top: 6px; color: #334155;">
              ${art.content}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Gán sự kiện mở rộng bài viết
    container.querySelectorAll('.guide-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const content = document.getElementById(`content-${id}`);
        const icon = card.querySelector('.guide-toggle-icon');
        if (content) {
          const isOpen = content.style.display === 'block';
          content.style.display = isOpen ? 'none' : 'block';
          if (icon) icon.innerText = isOpen ? '▼' : '▲';
        }
      });
    });

    // Gán sự kiện lọc
    container.querySelectorAll('.btn-guide-cat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeCategory = e.currentTarget.getAttribute('data-cat');
        renderHTML();
      });
    });
  }

  renderHTML();
}

export function renderLogsView(container) {
  const logs = store.state.logs;

  container.innerHTML = `
    <div>
      <h2 style="font-size: 18px; font-weight: 800; color: var(--text-main);">📜 Nhật Ký Hoạt Động & Kiểm Toán</h2>
      <div style="font-size: 12.5px; color: var(--text-muted);">
        Lưu vết toàn bộ thao tác thêm, sửa, đổi tiền, khui hụi & quay số minh bạch
      </div>
    </div>

    <div class="card">
      <div class="item-list">
        ${logs.map(log => {
          let badgeClass = 'badge-info';
          if (log.action === 'CREATE_HUI') badgeClass = 'badge-success';
          if (log.action === 'OPEN_CYCLE') badgeClass = 'badge-warning';
          if (log.action === 'RECORD_PAYMENT') badgeClass = 'badge-primary';
          if (log.action === 'MERGE_PROFILE') badgeClass = 'badge-danger';

          return `
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span class="badge ${badgeClass}">${log.action}</span>
                <span style="font-size: 11px; color: var(--text-muted);">🕒 ${log.timestamp}</span>
              </div>
              <div style="font-size: 13px; color: var(--text-main); font-weight: 600; margin-top: 2px;">
                ${log.description}
              </div>
              <div style="font-size: 11.5px; color: var(--text-muted);">
                Người thực hiện: <strong>${log.actorName}</strong> (Đối tượng: ${log.targetType})
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
