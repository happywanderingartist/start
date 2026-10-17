const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const empty = text => `<p class="empty">${esc(text)}</p>`;
const statusLabel = status => ({pending:'待审核',approved:'已通过',rejected:'已退回',joined:'已加入',followed:'已关注',available:'可交换',withdrawn:'已撤回',accepted:'已接受'}[status] || status || '未设置');
const section = (title, body) => `<section class="private-section"><div class="section-head"><h2>${esc(title)}</h2></div>${body}</section>`;
const row = (title, meta, status) => `<div class="private-row"><div><strong>${esc(title)}</strong><small>${esc(meta || '')}</small></div>${status ? `<span class="status-pill">${esc(statusLabel(status))}</span>` : ''}</div>`;

export function renderPrivateMe({authError = '', profile = null, memberships = [], notifications = [], submissions = [], exchanges = [], listings = [], book = [], doll = null} = {}) {
  const profileBlock = profile
    ? `<div class="private-profile"><strong>${esc(profile.nickname || 'START 用户')}</strong><span>${esc(profile.artists || '还没有添加关注艺人')}</span><span>${esc(profile.interests || '还没有设置兴趣')}</span></div>`
    : empty(authError ? '登录后显示昵称、关注艺人和兴趣' : '暂无个人资料');
  const authBlock = authError
    ? `<div class="auth-note" role="status"><strong>身份服务尚未接入</strong><p>本地原型保留完整入口；接入微信身份后，投稿、收藏、打卡和交换申请会写入你的账号。</p></div>`
    : '';
  const joinedMemberships=memberships.filter(item=>item.status==='joined');
  const membershipBlock = joinedMemberships.length ? joinedMemberships.map(item => `<a class="inline-link" href="#/community/${encodeURIComponent(item.community_id)}">${esc(item.name || item.artistName || '社群')} ›</a>`).join('') : empty('还没有加入社群');
  const submissionBlock = submissions.length ? submissions.map(item => row(item.data?.name || item.name || '未命名投稿', item.data?.city || item.kind || '投稿', item.status)).join('') : empty('还没有投稿地点或路线');
  const exchangeBlock = exchanges.length ? exchanges.map(item => row(item.name || `物料申请 ${String(item.id || '').slice(0, 8)}`, '线下交换由双方自行确认', item.status)).join('') : empty('还没有物料交换申请');
  const listingBlock = listings.length ? listings.map(item => row(item.data?.name || item.name || '我的物料', '物料集市', item.status)).join('') : empty('还没有发布物料');
  const bookBlock = book.length ? book.map(item => row(item.snapshot?.name || item.text || 'START Book 记录', item.at ? new Date(item.at).toLocaleDateString('zh-CN') : '私人记录')).join('') : empty('还没有私人打卡记录');
  const notificationBlock = notifications.length ? notifications.map(item => row(item.kind || '新通知', item.created_at ? new Date(item.created_at).toLocaleString('zh-CN') : '', item.read ? '已读' : '未读')).join('') : empty('暂无通知');
  const dollBlock = doll ? `<div class="private-doll"><strong>${esc(doll.character === 'boy' ? '男娃' : '女娃')}</strong><span>${esc(doll.outfit || 'original')} · ${esc(doll.expression || 'neutral')}</span></div>` : empty('首次进入时选择一个娃娃');
  return `<div class="private-shell">
    <div class="public-top"><a href="#/">‹ 首页</a><span class="public-badge">ME</span></div>
    <header class="private-hero"><p class="public-badge">START · 私人空间</p><h1>我的工作台</h1><p>把走过的地点、喜欢的艺人和想交换的物料放在一起。</p></header>
    ${authBlock}
    <a class="inline-link" href="/app/legacy-me.html#/me">查看已确认的 Me 视觉原型</a>
    ${section('个人资料', profileBlock)}
    <section class="private-actions" aria-label="提交地点或路线"><p class="public-badge">提交地点或路线</p><a class="primary" href="#/submit?kind=place">提交地点</a><a class="primary" href="#/submit?kind=route">提交路线</a><a class="secondary" href="#/community">打开社群</a></section>
    ${section('我的社群', membershipBlock)}
    ${section('我的投稿', submissionBlock)}
    ${section('物料交换', `<div class="private-actions"><a href="#/market">管理物料与申请</a></div>${listingBlock}${exchangeBlock}`)}
    ${section('START Book', `<div class="private-actions"><a href="#/book">打开 START Book</a></div>${bookBlock}`)}
    ${section('我的娃娃', `${dollBlock}<a class="inline-link" href="/app/legacy-me.html#/me/doll">换装与表情 ›</a>`)}
    ${section('通知', notificationBlock)}
  </div>`;
}

export function renderSubmissionForm({kind = 'place', artists = []} = {}) {
  const route = kind === 'route';
  const artistOptions = artists.length ? artists.map(artist => `<option value="${esc(artist.id)}">${esc(artist.name)}</option>`).join('') : '<option value="">暂无艺人</option>';
  const categoryOptions = ['美食','咖啡','娱乐','景点','书店','其他'].map(category => `<option value="${category}">${category}</option>`).join('');
  return `<div class="submission-shell">
    <div class="public-top"><a href="#/me">‹ 我的工作台</a><span class="public-badge">投稿</span></div>
    <header class="view-title"><p class="public-badge">COMMUNITY · 内容投稿</p><h1>${route ? '提交路线' : '提交地点'}</h1><p>${route ? '把一组已核对的打卡点整理成一条路线。' : '把艺人打卡点补充到对应城市和分类里。'}</p></header>
    <div class="submission-tabs" role="tablist" aria-label="投稿类型"><a role="tab" aria-selected="${!route}" href="#/submit?kind=place">地点</a><a role="tab" aria-selected="${route}" href="#/submit?kind=route">路线</a></div>
    <form data-private-submit data-kind="${route ? 'route' : 'place'}" novalidate>
      <div class="form-status" data-form-status role="alert" tabindex="-1" hidden></div>
      <label for="submission-name">名称<span aria-hidden="true">*</span></label><input id="submission-name" name="name" required maxlength="200" autocomplete="off">
      <label for="submission-city">城市<span aria-hidden="true">*</span></label><input id="submission-city" name="city" required maxlength="200" autocomplete="address-level2">
      <label for="submission-artist">艺人<span aria-hidden="true">*</span></label><select id="submission-artist" name="artistId" required>${artistOptions}</select>
      ${route ? `<p id="submission-stops-label">站点<span aria-hidden="true">*</span></p><ol class="route-stop-list" data-route-stops aria-label="路线站点"></ol>` : `<label for="submission-category">类别<span aria-hidden="true">*</span></label><select id="submission-category" name="category" required>${categoryOptions}</select><label for="submission-same-spot">打卡同款</label><textarea id="submission-same-spot" name="sameSpot" rows="3" maxlength="3500" placeholder="例如：MV 00:36 的取景位置"></textarea>`}
      <label for="submission-source">来源<span aria-hidden="true">*</span></label><textarea id="submission-source" name="source" required rows="3" maxlength="3500" placeholder="原帖、视频或现场记录来源"></textarea>
      <label for="submission-description">补充说明</label><textarea id="submission-description" name="description" rows="3" maxlength="3500"></textarea>
      <div class="submission-tools"><label for="map-search">在地图里找地点</label><div class="tool-row"><input id="map-search" name="mapQuery" placeholder="搜索地点名称"><button type="button" class="secondary" data-map-search>地图搜索</button></div><small>选择高德搜索结果后回填地点与坐标，请核对实际位置。</small></div>
      <div class="submission-tools"><label for="text-import">从文字识别</label><textarea id="text-import" name="textImport" rows="4" maxlength="3500" placeholder="粘贴小红书或其他来源的地点文字"></textarea><button type="button" class="secondary" data-text-import>识别文字</button><small>识别结果会填回表单，提交前请逐项检查。</small></div>
      <label for="submission-media">现场照片</label><input id="submission-media" name="media" type="file" accept="image/png,image/jpeg,image/webp" multiple>
      <button class="primary submit-button" type="submit">提交审核</button>
    </form>
  </div>`;
}
