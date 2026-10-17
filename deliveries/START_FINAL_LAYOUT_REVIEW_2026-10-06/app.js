// Phase C reuses the supplied baseline controller. No production API.
const entryScript = document.currentScript;
const assetBase = new URL('.', entryScript.src);
const designRoute = document.body.dataset.designRoute;
const hashMode = location.protocol === 'file:' || assetBase.pathname !== '/' || !!designRoute;
function pathNow(){if(location.hash.startsWith('#/'))return location.hash.slice(1).split('?')[0];const d=designRoute?.split('?')[0];return d || (hashMode ? '/' : location.pathname === '/index.html' ? '/' : location.pathname);}
function searchNow(){if(location.hash.startsWith('#/')){const i=location.hash.indexOf('?');return i<0?'':location.hash.slice(i);}if(designRoute){const i=designRoute.indexOf('?');return i<0?'':designRoute.slice(i);}return location.search;}
function navUrl(url){return hashMode ? location.pathname + '#' + url : url;}
// Private Phase A/B presentation only. Never used as the product SearchProvider.
const app = document.querySelector('#app'), sheet = document.querySelector('#sheet');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let data, searchTimer, selectedStop = 1, composing = false, originFocus, searchGeneration = 0, departureScroll = null;
let entry = history.state ?? { key: crypto.randomUUID(), scroll: 0 };
history.replaceState(entry, '');
history.scrollRestoration = 'manual';
const qs = () => new URLSearchParams(searchNow());
const routeUrl = r => '/routes/' + r.id;
const artistUrl = '/artists/10000000-0000-4000-8000-000000000001';
const currentRoute = () => data.routes.find(r => pathNow() === routeUrl(r)) ?? data.route;
const placeUrl = id => '/places/' + id;
const back = `<a class="back" href="/" data-back aria-label="返回">←</a>`;
const action = (name, label) => `<button class="text-action" data-action="${name}">${label}</button>`;
const row = (href, title, meta = '', number = '', extra = '') => `<a class="rule-row" href="${esc(href)}" ${extra}>${number ? `<span class="number">${number}</span>` : ''}<span class="row-label od-field"><span class="row-title od-clamp-2">${esc(title)}</span>${meta ? `<span class="row-meta">${esc(meta)}</span>` : ''}</span><span class="arrow" aria-hidden="true">↗</span></a>`;
const blank = (label, title) => `<div class="state"><h2>${label}</h2><p>${title}</p></div>`;
function save() { entry = { ...entry, scroll: scrollY }; history.replaceState(entry, ''); }
function go(url) { entry = { ...entry, scroll: departureScroll ?? scrollY }; departureScroll = null; history.replaceState(entry, ''); if (sheet.open)
    sheet.close(); entry = { key: crypto.randomUUID(), scroll: 0, from: pathNow() + searchNow() }; history.pushState(entry, '', navUrl(url)); render(); window.scrollTo(0, 0); }
document.addEventListener('pointerdown', e => { const link = e.target.closest('a[href^="/"],button[data-query]'); departureScroll = link && !link.hasAttribute('data-back') ? scrollY : null; });
function returnBack() { if (entry.from) {
    history.back();
}
else
    go('/search?q=' + encodeURIComponent('台北')); }
addEventListener('popstate', () => { entry = history.state ?? { key: 'direct', scroll: 0 }; if (sheet.open)
    sheet.close(); render(); requestAnimationFrame(() => window.scrollTo(0, entry.scroll ?? 0)); });
addEventListener('pagehide', save);
function openSheet(title, content) { if (!sheet.open)
    originFocus = document.activeElement; sheet.innerHTML = `<div class="sheet-head"><h2 id="sheet-title">${esc(title)}</h2><button class="close" data-action="close" aria-label="关闭">×</button></div>${content}`; if (!sheet.open)
    sheet.showModal(); sheet.querySelector('button')?.focus(); }
sheet.addEventListener('close', () => { if (originFocus?.isConnected)
    originFocus.focus(); });
sheet.addEventListener('click', e => { if (e.target === sheet) {
    const b = sheet.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom)
        sheet.close();
} });
function evidenceContext() {
    const r = currentRoute();
    const stop = r.stops.find(s => s.sequence === selectedStop);
    const place = data.places.find(p => pathNow() === placeUrl(p.identity.id))
        ?? (pathNow().startsWith('/routes/') ? data.places.find(p => p.identity.id === stop?.placeId) : undefined);
    const relation = place?.artistRelations?.find(x => x.artist.id === r.artist.id) ?? place?.artistRelations?.[0];
    return { place, relation, source: relation?.sources?.[0] ?? place?.sources?.[0] ?? r.sources?.[0] };
}
function source() {
    const context = evidenceContext(), s = context.source;
    openSheet('SOURCE', `<p>${esc(s?.title ?? '来源未收录')}</p><p class="sheet-detail">来源不可用 · 此处是合成测试来源，不能证明真实艺人到访。</p><div class="sheet-actions">${s?.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">打开来源 ↗</a>` : ''}${action('verification', 'VERIFICATION ↗')}</div>`);
}
function verification() {
    const {place, relation, source: s} = evidenceContext();
    openSheet('VERIFICATION', `<p>Place：${esc(place?.identity.name ?? '地点未收录')} · ${esc(place?.identity.verification ?? 'unknown')}</p><p>ArtistPlaceRelation：${esc(relation?.verification ?? 'unknown')}；这是关联可信度。</p><p>Claim：无已核验主张。Source：${esc(s?.availability ?? 'unknown')}。</p><p class="sheet-detail">合成读模型的发布状态不表示地点、关联或主张都已核验。</p>`);
}
function stopPreview(n) { selectedStop = n; syncMarkers(); const s = currentRoute().stops[n - 1]; openSheet(`${String(n).padStart(2, '0')} · ${s.name}`, `<p class="eyebrow">${esc(data.hub.identity.canonicalName)} · 年份未收录</p><p>合成线索用于布局验证；不声称艺人真实到访。</p><div class="sheet-actions">${action('source', 'SOURCE ↗')}<a href="${placeUrl(s.placeId)}">PLACE ↗</a></div>`); }
function syncMarkers() { document.querySelectorAll('[data-stop],[data-marker]').forEach(el => { const n = Number(el.dataset.stop ?? el.dataset.marker); el.classList.toggle('active', n === selectedStop); el.setAttribute('aria-pressed', String(n === selectedStop)); }); const status = document.querySelector('#map-status'); if (status)
    status.textContent = `已选 ${String(selectedStop).padStart(2, '0')} · ${currentRoute().stops[selectedStop - 1].name}；距离与时长暂无数据`; }
function home() { return homeView(); }
function search() { return searchView(); }
function loadResults(q) {
    clearTimeout(searchTimer);
    const generation = ++searchGeneration;
    const target = app.querySelector('.results');
    const index = app.querySelector('.result-index');
    index.hidden = true;
    const scenario = qs().get('state');
    target.innerHTML = `<div class="state" role="status"><p>正在查找…</p><div class="skeleton"></div><div class="skeleton"></div></div>`;
    if (scenario === 'loading')
        return;
    searchTimer = setTimeout(() => {
        if (generation !== searchGeneration || !target.isConnected)
            return;
        if (scenario === 'error') {
            target.innerHTML = `<div class="state"><h2>暂时无法搜索</h2><p>请稍后重试。原型模拟连接错误。</p>${action('retry', '重试 ↻')}</div>`;
            return;
        }
        const key = q.trim().toLowerCase();
        let mode = key.includes('苏打绿') || key === '蘇打綠' || key === 'sodagreen' ? 'artist' : key.includes('台北') ? 'city' : key.includes('南京') ? 'nanjing' : key.includes('春日') ? 'place' : key.includes('现场') ? 'event' : !key ? 'default' : 'empty';
        if (scenario === 'empty')
            mode = 'empty';
        if (mode === 'empty') {
            target.innerHTML = blank('没有找到', '试试艺人名字、城市或地点；不会自动进入固定路线。');
            return;
        }
        const sections = data.search.sections.map(s => ({ ...s, items: s.items.filter(item => mode === 'nanjing' ? (s.type === 'artist' || item.city.id === data.hub.footprintCities[1].city.id) : mode === 'place' ? s.type === 'place' && item.name.includes('春日') : mode === 'event' ? s.type === 'event' : mode === 'city' ? (s.type === 'artist' || item.city.id === data.hub.footprintCities[0].city.id) : true) }));
        target.innerHTML = sections.map(s => `<section class="section" id="result-${s.type}"><h2>${({ artist: 'ARTIST', route: 'ROUTE', place: 'PLACE', event: 'EVENT' })[s.type]}</h2>${s.items.length ? s.items.map((i, n) => s.type === 'artist' ? row(artistUrl, i.canonicalName, i.footprintCities.map(c => c.city.name).join(' / ')) : s.type === 'route' ? row(routeUrl(i), i.title, `${i.artist.canonicalName} · ${i.city.name}`, String(n + 1).padStart(2, '0')) : s.type === 'place' ? row(placeUrl(i.id), '• ' + i.name, i.city.name) : `<button class="rule-row" data-action="event"><span class="event-date">12 / 01</span><span class="row-label">${esc(i.title)}<span class="row-meta">LIVE · ${esc(i.city.name)} · 已取消（测试）</span></span><span class="arrow">↗</span></button>`).join('') : '<p class="muted">暂无匹配内容</p>'}</section>`).join('');
        index.innerHTML = sections.map(s => `<a href="#result-${s.type}" data-result="${s.type}">${s.type.toUpperCase()}</a>`).join('');
        index.hidden = false;
        requestAnimationFrame(() => window.scrollTo(0, entry.scroll ?? 0));
    }, 240);
}
function artist() { return artistView(); }
function syncCity() { const chapters = [...app.querySelectorAll('.chapter')]; if (!chapters.length)
    return; let active = 0; chapters.forEach((el, i) => { if (el.getBoundingClientRect().top <= 80)
    active = i; }); activateCity(active); }
addEventListener('scroll', () => requestAnimationFrame(syncCity), { passive: true });
function activateCity(i) { app.querySelectorAll('[data-city]').forEach(a => { if (a.dataset.city === String(i)) {
    a.setAttribute('aria-current', 'true');
    if (innerWidth < 768) {
        const nav = a.parentElement;
        nav.scrollTo({ left: a.offsetLeft - nav.offsetLeft - 16, behavior: 'auto' });
    }
}
else
    a.removeAttribute('aria-current'); }); }
function route() { return routeView(); }
function place() { return placeView(); }
function render() { window.cleanupHomeCarousel?.(); cleanupMe(); cleanupDoll(); document.body.classList.remove("community-active"); clearTimeout(searchTimer); searchGeneration++; composing = false; document.title = 'START · Discovery 原型';
    if(meRender() || dollRender() || tradeRender() || communityRender())return;
    if(memoryRender())return;if(journeyRender())return;
    if (pathNow() === '/')
    home();
else if (pathNow() === '/search')
    search();
else if (pathNow().startsWith('/artists/')) {
    if (pathNow() !== artistUrl) {
        app.innerHTML = `<main class="page">${back}${blank('艺人不存在', '原型仅包含指定合成读模型。')}</main>`;
    }
    else
        artist();
}
else if (pathNow().startsWith('/routes/')) {
    if (!data.hub.recommendedRoutes.some(r => pathNow() === routeUrl(r)))
        app.innerHTML = `<main class="page">${back}${blank('路线不存在', '原型没有此路线。')}</main>`;
    else
        route();
}
else if (pathNow().startsWith('/places/'))
    place();
else
    app.innerHTML = `<main class="page">${back}${blank('页面不存在', '')}</main>`; }
document.addEventListener('submit', e => { if (e.target.matches('[data-search]')) {
    e.preventDefault();
    if (composing)
        return;
    const q = e.target.querySelector('input').value.trim();
    go('/search?q=' + encodeURIComponent(q));
} });
document.addEventListener('click', async (e) => { const target = e.target.closest('a,button'); if (!target)
    return; if (target.matches('[data-back]')) {
    e.preventDefault();
    returnBack();
    return;
} if (target.dataset.result) {
    e.preventDefault();
    document.querySelector('#result-' + target.dataset.result)?.scrollIntoView();
    return;
} if (target.dataset.city !== undefined) {
    e.preventDefault();
    activateCity(target.dataset.city);
    document.querySelector('#city-' + target.dataset.city)?.scrollIntoView();
    return;
} if (target.dataset.href) {
    go(target.dataset.href);
    return;
} if (target.dataset.query) {
    go('/search?q=' + encodeURIComponent(target.dataset.query));
    return;
} if (target.dataset.stop) {
    stopPreview(Number(target.dataset.stop));
    return;
} if (target.dataset.marker) {
    selectedStop = Number(target.dataset.marker);
    syncMarkers();
    return;
} if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('/')) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey)
        return;
    e.preventDefault();
    go(target.getAttribute('href'));
    return;
} switch (target.dataset.action) {
    case 'close':
        sheet.close();
        break;
    case 'source':
        source();
        break;
    case 'verification':
        verification();
        break;
    case 'map':
        document.querySelector('#map')?.classList.add('is-target');
        document.querySelector('#map')?.scrollIntoView();
        break;
    case 'start':
        beginJourney(currentRoute());
        break;
    case 'share':
        try {
            await navigator.clipboard.writeText(location.href);
            openSheet('分享给朋友', `<p>已复制此本地原型链接。需要在本机启动原型才能访问。</p>`);
        }
        catch {
            openSheet('分享给朋友', `<p>请复制浏览器地址：</p><p class="sheet-detail">${esc(location.href)}</p>`);
        }
        break;
    case 'address':
        openSheet('ADDRESS', `<p>${esc(data.places.find(p => pathNow() === placeUrl(p.identity.id))?.address)}</p><p class="sheet-detail">测试地址，未接地图 Provider，不执行真实导航。</p>`);
        break;
    case 'event':
        openSheet('EVENT · 最小读目标', `<p>${esc(data.event.title)}</p><p>12 / 01 · 台北 · 已取消（测试）</p><p class="sheet-detail">合成 Event read 模型；不是 Event Hub，不提供报名。</p>`);
        break;
    case 'retry': {
        const url = new URL(pathNow() + searchNow(), 'http://prototype.local');
        url.searchParams.delete('state');
        history.replaceState(entry, '', navUrl(url.pathname + url.search));
        loadResults(qs().get('q') ?? '');
        break;
    }
    case 'deferred-nav':
        openSheet('后续切片', `<p>Community 与 Me 尚未开放。当前可体验发现路线。</p>`);
        break;
    case 'doll':
        openSheet('DOLL · 比例占位', `<p>不加载、不重绘锁定角色素材。低频轻互动待后续切片。</p>`);
        break;
} });
/* Shared editable views. The baseline controller calls these functions. */
/* Lucide 1.8.0 icon nodes, ISC license retained in assets/LICENSE-lucide. */
const iconNodes = {"search":[["path",{"d":"m21 21-4.34-4.34"}],["circle",{"cx":"11","cy":"11","r":"8"}]],"arrow":[["path",{"d":"M5 12h14"}],["path",{"d":"m12 5 7 7-7 7"}]],"back":[["path",{"d":"m15 18-6-6 6-6"}]],"swap":[["path",{"d":"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{"d":"M21 3v5h-5"}],["path",{"d":"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{"d":"M8 16H3v5"}]],"music":[["path",{"d":"M9 18V5l12-2v13"}],["circle",{"cx":"6","cy":"18","r":"3"}],["circle",{"cx":"18","cy":"16","r":"3"}]],"art":[["path",{"d":"M15 18h-5"}],["path",{"d":"M18 14h-8"}],["path",{"d":"M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"}],["rect",{"width":"8","height":"4","x":"10","y":"6","rx":"1"}]],"film":[["rect",{"width":"18","height":"18","x":"3","y":"3","rx":"2"}],["path",{"d":"M7 3v18"}],["path",{"d":"M3 7.5h4"}],["path",{"d":"M3 12h18"}],["path",{"d":"M3 16.5h4"}],["path",{"d":"M17 3v18"}],["path",{"d":"M17 7.5h4"}],["path",{"d":"M17 16.5h4"}]],"book":[["path",{"d":"M12 7v14"}],["path",{"d":"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"}]],"home":[["path",{"d":"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"}],["path",{"d":"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"}]],"people":[["path",{"d":"M18 21a8 8 0 0 0-16 0"}],["circle",{"cx":"10","cy":"8","r":"5"}],["path",{"d":"M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"}]],"person":[["circle",{"cx":"12","cy":"8","r":"5"}],["path",{"d":"M20 21a8 8 0 0 0-16 0"}]],"photo":[["rect",{"width":"18","height":"18","x":"3","y":"3","rx":"2","ry":"2"}],["circle",{"cx":"9","cy":"9","r":"2"}],["path",{"d":"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"}]]};
function icon(name) {
  const nodes = iconNodes[name] ?? iconNodes.arrow;
  return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + nodes.map(([tag, attrs]) => '<' + tag + ' ' + Object.entries(attrs).map(([key, value]) => key + '="' + value + '"').join(' ') + '/>').join('') + '</svg>';
}
function pageTop(label='DISCOVERY') {return `<div class="page-top od-row"><a class="back od-fixed" href="/" data-back aria-label="返回">${icon('back')}</a><span class="eyebrow">${label}</span><span class="micro-brand approved-logo" aria-label="START"><img src="${new URL('assets/START_LOGO_APPROVED.png',assetBase).href}" alt="" width="1672" height="941"></span></div>`;}
function homeView() {
  const saved=entry.homeQuery ?? '';
  const group=entry.homeGroup ?? 0;
  const categories=[['音乐','music',group ? '/search?q=苏打绿' : artistUrl],['文艺','art',group ? '/search?q=台北' : routeUrl(data.routes[0])],['电影','film','/search?q=电影'],['书店','book',placeUrl(data.places[0].identity.id)]];
  const artwork = new URL('assets/HOME_APPROVED.png', assetBase).href;
  app.innerHTML=`<main class="page home"><h1 class="home-brand" aria-label="START WITH…?"><span class="approved-title" aria-hidden="true"><img src="${artwork}" alt="" width="853" height="1844"></span></h1><div class="start-prompt"><label class="search-label" for="home-search">想从什么开始</label><a class="home-companion" href="/me/doll" aria-label="打开我的娃娃"><img src="${new URL('assets/doll/LOCKED_DOLL_GIRL.png',assetBase).href}" alt="我的娃娃" width="1536" height="1536"></a><button type="button" class="companion-pause" aria-label="暂停娃娃动态" aria-pressed="false">Ⅱ</button><form class="search-form od-row" data-search>${icon('search')}<input id="home-search" type="search" maxlength="120" autocomplete="off" aria-label="想从什么开始" value="${esc(saved)}" placeholder="艺人 / 城市 / 地点" aria-describedby="home-hint"><button type="submit" class="search-submit od-fixed" aria-label="搜索">${icon('arrow')}</button></form><div class="suggestion-list" hidden></div><span class="muted home-hint" id="home-hint">输入后按回车搜索</span></div><section class="recommend" aria-label="城市精选推荐" aria-roledescription="轮播"><div class="section-head"><div><small>START IN TAIPEI</small><h2>今天，从这里开始</h2></div><button id="play" aria-label="暂停自动播放">暂停</button></div>
<div class="viewport" tabindex="0" aria-label="精选卡片，可使用左右方向键切换"><div class="track">
<article class="recommend-card" aria-roledescription="幻灯片" aria-label="1 / 4，路线"><div class="cover route-cover"><div class="cover-photo book-photo" aria-hidden="true"><img src="${artwork}" alt=""></div><span class="cover-tag">路线 / CITY WALK</span><span class="image-note">原稿视觉素材 · 非地点实拍</span></div><div class="card-body"><small class="card-kicker">台北 · 路线示例</small><h3>从书店出发，<br>走进一个下午。</h3><p>书店、咖啡和一段慢慢走的街道。</p><a href="${routeUrl(data.routes[0])}" class="card-action">看看这条路线 <span>↗</span></a></div></article>
<article class="recommend-card place-slide" aria-roledescription="幻灯片" aria-label="2 / 4，地点"><div class="cover"><div class="cover-photo art-photo" aria-hidden="true"><img src="${artwork}" alt=""></div><span class="cover-tag">地点 / EXPLORE</span><span class="image-note">原稿视觉素材 · 非地点实拍</span></div><div class="card-body"><small class="card-kicker">台北 · 地点示例</small><h3>街角的书店，<br>留一点时间给它。</h3><p>先翻几页书，再决定下一站。</p><a href="${placeUrl(data.places[0].identity.id)}" class="card-action">看看这个地方 <span>↗</span></a></div></article>
<article class="recommend-card live-slide" aria-roledescription="幻灯片" aria-label="3 / 4，演出"><div class="cover"><div class="cover-photo music-photo" aria-hidden="true"><img src="${artwork}" alt=""></div><span class="cover-tag">演出 / LIVE</span><span class="image-note">原稿视觉素材 · 非演出实拍</span></div><div class="card-body"><small class="card-kicker">台北 · 演出示例 / 日期待补</small><h3>今晚的期待，<br>留给一场现场。</h3><p>艺人、场馆与票务来源待核验。</p><a href="/events/ongoing" class="card-action">看看近期演出 <span>↗</span></a></div></article>
<article class="recommend-card post-slide" aria-roledescription="幻灯片" aria-label="4 / 4，精选帖"><div class="cover"><div class="cover-photo film-photo" aria-hidden="true"><img src="${artwork}" alt=""></div><span class="cover-tag">精选帖 / JOURNAL</span><span class="image-note">原稿视觉素材 · 非帖子配图</span></div><div class="card-body"><small class="card-kicker">台北 · 帖子版式示例</small><h3>把喜欢的街道，<br>走成自己的路线。</h3><p>读一篇攻略，再出发去看看。</p><a href="/community" class="card-action">读读这篇攻略 <span>↗</span></a></div></article>
</div></div><div class="controls"><div class="dots" aria-label="选择推荐卡片"><button aria-label="第1张，路线" data-slide="0" aria-current="true"></button><button aria-label="第2张，地点" data-slide="1"></button><button aria-label="第3张，演出" data-slide="2"></button><button aria-label="第4张，精选帖" data-slide="3"></button></div><div><button id="prev" aria-label="上一张">‹</button><span id="count">01 / 04</span><button id="next" aria-label="下一张">›</button></div></div><p class="sr-only" id="announcement" aria-live="off"></p></section>
<section class="layout-review place-directory"><div class="directory-heading"><h2>这座城市值得去</h2><a href="city.html">全部地点 ↗</a></div><div class="category-rail" aria-label="地点分类"><button data-place-filter="全部" aria-pressed="true">全部</button><button data-place-filter="餐厅" aria-pressed="false">餐厅</button><button data-place-filter="咖啡" aria-pressed="false">咖啡</button><button data-place-filter="娱乐" aria-pressed="false">娱乐</button><button data-place-filter="景点" aria-pressed="false">景点</button><button data-place-filter="书店" aria-pressed="false">书店</button></div><div class="review-place-list"><a href="city.html" class="review-place-row" data-place-type="书店"><span class="place-image ice">摄影待补</span><span><strong>街角书店</strong><small>书店 · 台北 / 示例地点</small></span><span>›</span></a><a href="city.html" class="review-place-row" data-place-type="咖啡"><span class="place-image clay">摄影待补</span><span><strong>露台咖啡</strong><small>咖啡 · 台北 / 示例地点</small></span><span>›</span></a><a href="city.html" class="review-place-row" data-place-type="景点"><span class="place-image leaf">摄影待补</span><span><strong>临江步道</strong><small>景点 · 台北 / 示例地点</small></span><span>›</span></a></div><p class="filter-empty" hidden>暂无这类地点</p></section><div class="step-strip"><div class="step-label od-row"><span>今日步数</span><span class="od-nowrap">3,200 / 6,000 步</span></div><progress value="3200" max="6000" aria-label="步数示意，非真实步数"></progress><p class="muted">示意数据</p></div></main><nav class="nav" aria-label="主导航"><a href="/" aria-current="page"><span class="approved-nav-icon" data-nav="home" aria-hidden="true"><img src="${artwork}" alt="" width="853" height="1844"></span><span>Start</span></a><button data-href="/community"><span class="approved-nav-icon" data-nav="community" aria-hidden="true"><img src="${artwork}" alt="" width="853" height="1844"></span><span>Community</span></button><button data-href="/me"><span class="approved-nav-icon" data-nav="me" aria-hidden="true"><img src="${artwork}" alt="" width="853" height="1844"></span><span>Me</span></button></nav>`;
  const carouselCleanup=window.mountHomeCarousel();const companionCleanup=mountHomeCompanion();window.cleanupHomeCarousel=()=>{carouselCleanup();companionCleanup();};
  bindReviewFilters(app);
  const input=app.querySelector('input'),page=app.querySelector('.home'),list=app.querySelector('.suggestion-list');
  const suggest=()=>{const q=input.value.trim();entry={...entry,homeQuery:input.value};history.replaceState(entry,'');list.hidden=!q;const matches=['苏打绿','台北','春日书店'].filter(x=>x.includes(q)||q.toLowerCase()==='sodagreen');list.innerHTML=q?matches.map(x=>`<button type="button" data-query="${esc(x)}">${esc(x)} ↗</button>`).join(''):'';if(q&&!matches.length)list.innerHTML='<p class="reference-note">按回车查找更多内容</p>';};
  input.addEventListener('focus',()=>{page.classList.add('focused');suggest();});
  input.addEventListener('blur',()=>setTimeout(()=>{if(!page.contains(document.activeElement)){page.classList.remove('focused');list.hidden=true;}},100));
  input.addEventListener('input',()=>{if(!composing)suggest();});
  input.addEventListener('compositionstart',()=>composing=true);
  input.addEventListener('compositionend',()=>{composing=false;suggest();});
}
function searchView() {
  const q=qs().get('q') ?? '';
  app.innerHTML=`<main class="page search">${pageTop('SEARCH')}<header class="search-header"><form data-search><label class="search-label" for="result-search">搜索艺人、城市、地点</label><div class="search-form od-row">${icon('search')}<input id="result-search" type="search" aria-label="搜索艺人、城市、地点" maxlength="120" value="${esc(q)}" placeholder="艺人 / 城市 / 地点"><button type="submit" class="search-submit od-fixed" aria-label="搜索">${icon('arrow')}</button></div></form></header><p class="search-caption">${q?'关于「'+esc(q)+'」':'从一个名字开始'}</p><div class="search-layout"><nav class="result-index" aria-label="搜索结果分组" hidden></nav><div class="results" aria-live="polite"></div></div></main>`;
  const input=app.querySelector('input');
  const live=()=>{const url='/search?q='+encodeURIComponent(input.value);history.replaceState(entry,'',navUrl(url));loadResults(input.value);app.querySelector('.search-caption').textContent=input.value?'关于「'+input.value+'」':'从一个名字开始';};
  input.addEventListener('compositionstart',()=>composing=true);input.addEventListener('compositionend',()=>{composing=false;live();});input.addEventListener('input',()=>{if(!composing)live();});loadResults(q);
}
function artistView() {
  const cityLabels=[...data.hub.footprintCities.map(c=>c.city.name),...data.presentation.extraCityLabels];
  app.innerHTML=`<main class="page artist">${pageTop('ARTIST')}<div class="artist-cover od-row"><div class="artist-mark" aria-hidden="true">苏</div><header class="identity od-field"><p class="eyebrow">ARTIST / CITY BOOKLET</p><h1>${esc(data.hub.identity.canonicalName)}</h1><p class="muted">从一座城市，读一条路线</p></header></div><div class="artist-layout"><nav class="city-index od-rail" aria-label="城市索引">${cityLabels.map((c,i)=>`<a href="#city-${i}" data-city="${i}" ${i===0?'aria-current="true"':''}>${esc(c)}</a>`).join('')}</nav><div class="chapters">${cityLabels.map((c,i)=>{const routes=data.hub.recommendedRoutes.filter(r=>r.city.name===c);return `<section class="chapter" id="city-${i}"><h2><small>${String(i+1).padStart(2,'0')}</small>${esc(c)}</h2>${i<2?`<div class="chapter-intro od-field"><span class="eyebrow">CITY CHAPTER</span><p class="chapter-caption">${c==='台北'?'书店、河岸与城市声音':'一条城市声音散步路线'} · 合成示例</p></div>${routes.map((r,n)=>row(routeUrl(r),r.title,'',String(n+1).padStart(2,'0'))).join('')}`:'<p class="chapter-empty">暂无可公开推荐路线</p><p class="chapter-empty"><small>布局压力示例，不表示真实艺人足迹</small></p>'}${i===0?`<details class="optional-event"><summary>相关活动 <span class="muted">（可选）</span></summary><button class="rule-row od-row" data-action="event"><span class="row-label od-field"><span>${esc(data.event.title)}</span><span class="row-meta">12 / 01 · 已取消（测试）</span></span><span class="arrow" aria-hidden="true">${icon('arrow')}</span></button></details>`:''}</section>`;}).join('')}</div></div></main>`;requestAnimationFrame(syncCity);
}
function routeView() {
  const r=currentRoute();if(selectedStop>r.stops.length)selectedStop=1;
  const story=r.summary ?? '短故事暂未收录。';
  app.innerHTML=`<main class="page route">${pageTop('ROUTE')}<header class="identity od-field"><p class="eyebrow">${esc(r.artist.canonicalName)} / ${esc(r.city.name)}</p><h1>${esc(r.title)}</h1></header><section class="route-summary od-stack"><h2>为什么值得去</h2><p>${esc(r.whyWorthReplicating ?? '测试内容，不作为真实旅行建议')}</p><p class="story-note">${story}</p></section><div class="actions od-row">${action('start','START →')}${action('share','SHARE ↗')}</div><div class="route-layout"><section class="stops"><div class="section-label od-row"><h2>ROUTE</h2><button class="text-action" data-action="map">MAP ↓</button></div>${r.stops.map(s=>`<button class="rule-row stop-row od-row ${s.sequence===selectedStop?'active':''}" data-stop="${s.sequence}" aria-pressed="${s.sequence===selectedStop}"><span class="number">${String(s.sequence).padStart(2,'0')}</span><span class="row-label od-field"><span>${esc(s.name)}</span><span class="stop-detail">${s.sequence===1?'从这里开始':'继续这一站'}</span></span><span class="arrow" aria-hidden="true">${icon('arrow')}</span></button>`).join('')}</section><section class="map-panel" id="map"><div class="section-label od-row"><h2>MAP</h2><span class="muted">示意，不能导航</span></div><div class="map-frame" aria-label="站点关系示意图，非真实地图"><svg class="map-lines" viewBox="0 0 400 320" preserveAspectRatio="none" aria-hidden="true"><path d="M0 80h400M0 160h400M0 240h400M80 0v320M160 0v320M240 0v320M320 0v320"/></svg><div class="trace" aria-hidden="true"></div>${r.stops.map((s,i)=>`<button class="marker ${s.sequence===selectedStop?'active':''}" data-marker="${s.sequence}" aria-pressed="${s.sequence===selectedStop}" aria-label="地图站点 ${s.sequence} ${esc(s.name)}" style="left:${[12,62,52,20,65][i]}%;top:${[16,12,38,56,65][i]}%">${String(s.sequence).padStart(2,'0')}</button>`).join('')}<span class="map-caption">站点关系示意 · 合成数据</span></div><p class="map-status" id="map-status" role="status"></p></section></div></main>`;syncMarkers();
}
function placeView() {
  const p=data.places.find(p=>pathNow()===placeUrl(p.identity.id));
  if(!p){app.innerHTML=`<main class="page">${pageTop('PLACE')}${blank('地点不存在','该链接没有对应的合成读模型。')}</main>`;return;}
  app.innerHTML=`<main class="page place">${pageTop('PLACE')}<header class="identity od-field"><p class="eyebrow">${esc(p.identity.city.name)} / PLACE FILE</p><h1>${esc(p.identity.name)}</h1><p class="muted">${esc(p.relatedArtists[0]?.canonicalName ?? '关联未收录')} / 年份未收录</p></header><div class="place-layout"><section class="why od-stack"><h2>WHY</h2><p>${esc(p.artistRelations[0]?.explanation ?? '关联说明未收录')}</p>${action('source','SOURCE ↗')}</section><section class="here"><h2>HERE</h2><button class="address od-field" data-action="address"><strong>ADDRESS ↗</strong><span>${esc(p.address ?? '地址暂未收录')}</span></button><div class="mini-grid od-grid"><div class="mini-info od-field"><h3>PHOTO SPOT</h3><p>暂未收录</p></div><div class="mini-info od-field"><h3>ANGLE</h3><p>暂未收录</p></div></div><p class="notice">营业时间 / 到访提示暂未收录</p></section><section class="section reference"><div class="section-label od-row"><h2>REFERENCE</h2><span class="muted">无已授权媒体</span></div><div class="image-slot">${icon('photo')}<p>摄影档案待补齐<br>图片不作为艺人到访证据</p></div>${action('reference','查看资料说明 ↗')}</section><section class="related"><h2>RELATED</h2>${p.relatedRoutes[0]?row(routeUrl(p.relatedRoutes[0]),p.relatedRoutes[0].title):'<p class="muted">关联路线未收录</p>'}${p.relatedArtists[0]?row(artistUrl,p.relatedArtists[0].canonicalName):''}</section></div></main>`;
}
function phaseCExtraActions(e) {
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.action==='swap'){entry={...entry,homeGroup:(entry.homeGroup ?? 0)?0:1};history.replaceState(entry,'');homeView();app.querySelector('.swap')?.focus({preventScroll:true});}
  if(t.dataset.action==='reference'){openSheet('REFERENCE', '<p>暂无已授权摄影、Photo Spot或Angle资料。</p><p class="sheet-detail">不使用参考图中的人物、品牌或照片，不把示意图片当作到访证据。</p>');}
}

document.addEventListener('click', phaseCExtraActions);
addEventListener('hashchange',()=>{entry=history.state ?? {key:'hash',scroll:0};if(sheet.open)sheet.close();render();requestAnimationFrame(()=>scrollTo(0,entry.scroll??0));});

try { data=JSON.parse(document.querySelector('#fixture-data').textContent);render(); } catch(error) { console.error(error); app.innerHTML='<main class="boot-error"><h1>原型无法载入</h1><p>请通过本地服务器打开，或重新载入页面。</p><button class="text-action" onclick="location.reload()">重新载入</button></main>'; }

