/* ========================================
   陕铁院 · 高级感官网 — 主脚本
   模块化结构：配置 → 缓存DOM → 功能模块
   ======================================== */

// ===== 配置常量 =====
// 将散落各处的魔法数字集中管理，方便维护调整
const CONFIG = {
    preloader: {
        delay: 700,            // 预加载消失延迟 (ms)
        typingStart: 1200      // 打字机开始延迟 (ms)
    },
    cursor: {
        easing: 0.13           // 光标跟随缓动系数
    },
    scroll: {
        headerThreshold: 60,   // 导航栏变紧凑的滚动距离 (px)
        backToTopThreshold: 500 // 回到顶部按钮出现的滚动距离 (px)
    },
    typing: {
        speed: 100             // 打字速度 (ms/字)
    },
    particles: {
        density: 12000,        // 粒子密度因子 (屏幕面积/此值=粒子数)
        maxCount: 60           // 最大粒子数量
    },
    animation: {
        numberDuration: 2000,  // 数字递增动画时长 (ms)
        touchThreshold: 60     // 触摸滑动最小距离 (px)
    },
    modal: {
        focusDelay: 100        // 模态焦点恢复延迟 (ms)
    }
};

// ===== DOM 元量缓存 =====
// 缓存常用 DOM 引用，避免重复查询
const DOM = {
    preloader: document.getElementById('preloader'),
    cursor: document.getElementById('cur'),
    cursorRing: document.getElementById('curRing'),
    header: document.getElementById('hdr'),
    backToTop: document.getElementById('btt'),
    heroImg: document.querySelector('.hero-img'),
    burger: document.getElementById('burger'),
    fsMenu: document.getElementById('fsmenu'),
    majorModal: document.getElementById('majorModal'),
    lightbox: document.getElementById('lightbox'),
    heroParticles: document.getElementById('heroParticles'),
    majorSearch: document.getElementById('majorSearch'),
    majorSearchClear: document.getElementById('majorSearchClear'),
    majorSearchResults: document.getElementById('majorSearchResults'),
    navLinks: document.querySelectorAll('.hn-link'),
    tabButtons: document.querySelectorAll('.dt'),
    deptPanels: document.querySelectorAll('.dp'),
    panelsWrap: document.querySelector('.dept-panels')
};

// ===== 预加载 =====
addEventListener('load', () => {
    if (DOM.preloader) {
        setTimeout(() => {
            DOM.preloader.classList.add('out');
            document.querySelectorAll('.hero .reveal-up, .hero .reveal-scale').forEach(e => e.classList.add('go'));
        }, CONFIG.preloader.delay);
    }
});

// ===== 自定义光标 + rAF 循环 =====
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0, rafId;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animFrame() {
    // 使用 transform 代替 left/top，GPU 加速，避免布局重排
    DOM.cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    ringX += (mouseX - ringX) * CONFIG.cursor.easing;
    ringY += (mouseY - ringY) * CONFIG.cursor.easing;
    DOM.cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    rafId = requestAnimationFrame(animFrame);
}
animFrame();

// 页面不可见时暂停光标动画，节省性能
document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else { animFrame(); }
});

// 给可交互元素添加光标悬停效果
document.querySelectorAll('[data-cursor],a,button,.life-card,.fc,.jp-card,.conn-card,.ac,.dp-tags span,.tl-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        DOM.cursor.classList.add('h');
        DOM.cursorRing.classList.add('h');
    });
    el.addEventListener('mouseleave', () => {
        DOM.cursor.classList.remove('h');
        DOM.cursorRing.classList.remove('h');
    });
});

// ===== 导航栏（rAF 节流） =====
let scrollTick = false;

addEventListener('scroll', () => {
    if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(() => {
            const y = scrollY;
            if (DOM.header) DOM.header.classList.toggle('on', y > CONFIG.scroll.headerThreshold);
            if (DOM.backToTop) DOM.backToTop.classList.toggle('vis', y > CONFIG.scroll.backToTopThreshold);
            if (DOM.heroImg) DOM.heroImg.style.transform = `translateY(${y * 0.32}px)`;
            scrollTick = false;
        });
    }
}, { passive: true });

if (DOM.backToTop) {
    DOM.backToTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== 导航高亮 =====
const navObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            const id = en.target.id;
            DOM.navLinks.forEach(n => n.classList.toggle('active', n.getAttribute('href') === '#' + id));
        }
    });
}, { threshold: 0.28, rootMargin: '-60px 0px -40% 0px' });

document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

// ===== 全屏菜单 =====
if (DOM.burger && DOM.fsMenu) {
    DOM.burger.addEventListener('click', () => {
        const open = DOM.fsMenu.classList.toggle('on');
        DOM.burger.classList.toggle('on', open);
        DOM.burger.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });

    document.querySelectorAll('.fsmenu-nav a').forEach(a => {
        a.addEventListener('click', () => {
            DOM.burger.classList.remove('on');
            DOM.burger.setAttribute('aria-expanded', 'false');
            DOM.fsMenu.classList.remove('on');
            document.body.style.overflow = '';
        });
    });
}

// ===== 滚动入场动画 =====
const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            en.target.classList.add('go');
            // 触发数字递增动画
            en.target.querySelectorAll('.hs-num').forEach(n => {
                if (!n.dataset.done) { n.dataset.done = '1'; countNum(n, +n.dataset.to); }
            });
            revObs.unobserve(en.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.sec .reveal-up, .sec .reveal-scale, .job-banner .reveal-up, .hs-item').forEach(el => revObs.observe(el));

// ===== 数字递增动画 =====
function countNum(el, to) {
    const dur = CONFIG.animation.numberDuration;
    const t0 = performance.now();
    (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        // 指数缓出：先快后慢
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(to * ease).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
    })(t0);
}

// ===== 院系标签切换（支持键盘导航 + ARIA） =====
function switchTab(targetTab) {
    const id = targetTab.dataset.tab;
    // 更新按钮状态
    DOM.tabButtons.forEach(x => {
        x.classList.remove('active');
        x.setAttribute('aria-selected', 'false');
        x.setAttribute('tabindex', '-1');
    });
    targetTab.classList.add('active');
    targetTab.setAttribute('aria-selected', 'true');
    targetTab.setAttribute('tabindex', '0');
    // 切换面板
    DOM.deptPanels.forEach(p => {
        p.classList.remove('active');
        p.style.animationName = 'none';
    });
    const panel = document.getElementById(id);
    if (panel) {
        panel.style.animationName = '';
        panel.classList.add('active');
    }
}

DOM.tabButtons.forEach((t, i) => {
    t.setAttribute('tabindex', i === 0 ? '0' : '-1');
    t.addEventListener('click', () => switchTab(t));

    // 键盘导航：左右箭头切换标签（遵循 WAI-ARIA tablist 模式）
    t.addEventListener('keydown', e => {
        let next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            next = DOM.tabButtons[(i + 1) % DOM.tabButtons.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            next = DOM.tabButtons[(i - 1 + DOM.tabButtons.length) % DOM.tabButtons.length];
        }
        if (next) {
            next.focus();
            switchTab(next);
        }
    });
});

// ===== 移动端触摸滑动切换院系 =====
if (DOM.panelsWrap) {
    let touchStartX = 0;

    DOM.panelsWrap.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    DOM.panelsWrap.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        const activeIdx = [...DOM.tabButtons].findIndex(t => t.classList.contains('active'));

        if (Math.abs(diff) > CONFIG.animation.touchThreshold) {
            let nextIdx;
            if (diff > 0) { // 左滑 → 下一个
                nextIdx = (activeIdx + 1) % DOM.tabButtons.length;
            } else { // 右滑 → 上一个
                nextIdx = (activeIdx - 1 + DOM.tabButtons.length) % DOM.tabButtons.length;
            }
            switchTab(DOM.tabButtons[nextIdx]);
            DOM.tabButtons[nextIdx].focus();
        }
    }, { passive: true });
}

// ===== 平滑滚动 =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e) {
        e.preventDefault();
        const t = document.querySelector(this.getAttribute('href'));
        if (t) {
            const top = t.getBoundingClientRect().top + pageYOffset - 60;
            scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ===== 专业搜索筛选功能 =====
// 从 majorData 构建搜索索引，支持实时搜索和键盘导航
(function initMajorSearch() {
    if (!DOM.majorSearch) return;

    let activeResultIdx = -1;
    let filteredResults = [];

    // 实时搜索
    DOM.majorSearch.addEventListener('input', () => {
        const query = DOM.majorSearch.value.trim();
        DOM.majorSearchClear.style.display = query ? '' : 'none';

        if (!query) {
            hideResults();
            return;
        }

        // 在所有专业中搜索匹配
        filteredResults = Object.keys(majorData).filter(name =>
            name.includes(query) || majorData[name].dept.includes(query)
        );

        if (filteredResults.length === 0) {
            DOM.majorSearchResults.innerHTML = '<div class="ms-no-result">未找到匹配的专业</div>';
            DOM.majorSearchResults.style.display = '';
            activeResultIdx = -1;
            return;
        }

        // 渲染搜索结果，高亮匹配文字
        DOM.majorSearchResults.innerHTML = filteredResults.map((name, i) => {
            const data = majorData[name];
            const highlighted = name.replace(
                new RegExp(`(${escapeRegExp(query)})`, 'g'),
                '<span class="ms-match">$1</span>'
            );
            return `<div class="ms-result-item${i === 0 ? ' active' : ''}" role="option" data-name="${name}" data-idx="${i}">
                ${highlighted}
                <span class="ms-result-dept">${data.dept}</span>
            </div>`;
        }).join('');
        DOM.majorSearchResults.style.display = '';
        activeResultIdx = 0;

        // 绑定结果点击事件
        DOM.majorSearchResults.querySelectorAll('.ms-result-item').forEach(item => {
            item.addEventListener('click', () => {
                openMajor(item.dataset.name);
                clearSearch();
            });
        });
    });

    // 键盘导航搜索结果
    DOM.majorSearch.addEventListener('keydown', e => {
        const items = DOM.majorSearchResults.querySelectorAll('.ms-result-item');
        if (!items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeResultIdx = (activeResultIdx + 1) % items.length;
            updateActiveResult(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeResultIdx = (activeResultIdx - 1 + items.length) % items.length;
            updateActiveResult(items);
        } else if (e.key === 'Enter' && activeResultIdx >= 0) {
            e.preventDefault();
            openMajor(filteredResults[activeResultIdx]);
            clearSearch();
        } else if (e.key === 'Escape') {
            clearSearch();
            DOM.majorSearch.blur();
        }
    });

    // 清除按钮
    DOM.majorSearchClear.addEventListener('click', clearSearch);

    // 点击外部关闭结果
    document.addEventListener('click', e => {
        if (!e.target.closest('.major-search')) {
            hideResults();
        }
    });

    function updateActiveResult(items) {
        items.forEach((item, i) => item.classList.toggle('active', i === activeResultIdx));
        items[activeResultIdx]?.scrollIntoView({ block: 'nearest' });
    }

    function hideResults() {
        DOM.majorSearchResults.style.display = 'none';
        activeResultIdx = -1;
    }

    function clearSearch() {
        DOM.majorSearch.value = '';
        DOM.majorSearchClear.style.display = 'none';
        hideResults();
    }

    // 转义正则特殊字符
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
})();

// ===== 专业详情数据 =====
// 每个专业包含：名称、所属学院、学制、核心课程、就业方向、专业特色、简介
// 数据来源：各学院官方网站 (xxx.sxri.net)
const majorData = {
    /* ── 高铁工程学院 (gtxy.sxri.net) ── */
    '铁道工程技术': {
        dept: '高铁工程学院', duration: '3年',
        intro: '国家"双高计划"高水平专业群核心专业，培养掌握铁路线路、路基、桥涵、隧道等工程施工与维护技术的高素质技术技能人才。毕业生主要面向中国中铁、中国铁建等大型央企就业。',
        courses: ['铁路线路施工与维护', '铁路桥涵施工', '隧道施工技术', '铁路工程测量', '工程材料检测', '铁路工程概预算'],
        jobs: ['铁路线路工', '桥隧工', '工程施工员', '工程监理员', '铁路局技术岗'],
        features: ['国家示范专业', '校内拥有全真铁路综合实训基地', '与全国18个铁路局建立订单培养']
    },
    '高速铁路综合维修技术': {
        dept: '高铁工程学院', duration: '3年',
        intro: '面向高速铁路建设与维护一线，培养掌握高速铁路路基、桥涵、隧道、轨道及附属结构施工与维护的高素质技术技能人才。毕业生主要面向中国中铁、中国铁建及各铁路局高铁养护维修部门就业。',
        courses: ['高速铁路轨道施工', '高铁线路检测技术', '无砟轨道施工', '高铁养护维修', '高速铁路精测精调', '高铁病害整治'],
        jobs: ['高铁线路检测员', '高铁养护技术员', '高铁施工员', '铁路局高铁段技术岗'],
        features: ['紧跟高铁发展前沿', '拥有高铁实训模拟系统', '毕业生供不应求']
    },
    '建设工程管理': {
        dept: '高铁工程学院', duration: '3年',
        intro: '培养掌握工程项目管理、质量控制、进度管理等综合能力的管理型人才。项目经理是工程行业的核心岗位，发展空间巨大。',
        courses: ['工程项目管理', '施工组织设计', '工程质量管理', '工程安全管理', '建设工程法规', 'BIM项目管理'],
        jobs: ['施工管理员', '项目经理助理', '质量管理员', '工程监理'],
        features: ['管理+技术复合培养', '晋升空间大', '是走向项目经理的起点']
    },
    /* ── 测绘与检测学院 (chxy.sxri.net) ── */
    '工程测量技术': {
        dept: '测绘与检测学院', duration: '3年',
        intro: '培养掌握工程控制测量、地形测量、施工放样、变形监测等技能的专业人才。拥有陕西省高性能混凝土工程实验室和高铁精密测量技术应用研究中心。',
        courses: ['工程控制测量', '线桥隧施工测量', '数字测图', '高速铁路精密测量', '工程变形监测', '测绘程序设计与应用'],
        jobs: ['测量员', '测绘工程师', '施工放样技术员', '高铁精测技术员'],
        features: ['全国测绘技能大赛屡获一等奖', '拥有高铁精密测量技术应用研究中心', '就业面广']
    },
    /* ── 城轨工程学院 (cgxy.sxri.net) ── */
    '城市轨道交通工程技术': {
        dept: '城轨工程学院', duration: '3年',
        intro: '聚焦城轨工程自动化掘进、装配化施工、动态化监测、信息化管理等关键技术，培养面向地铁、铁路局及地铁公司的高技能人才。',
        courses: ['地铁施工技术', '城市轨道线路维护', '地下工程防水', '地铁车站施工', '轨道几何检测', '城市轨道概论'],
        jobs: ['地铁施工技术员', '城轨线路维护员', '质量员', '安全员', '监测员'],
        features: ['与全国多家地铁公司合作', '就业城市好', '工作环境相对优越']
    },
    '地下与隧道工程技术（隧道施工）': {
        dept: '城轨工程学院', duration: '3年',
        intro: '培养掌握地下空间开发与隧道工程施工技术的专业人才。主要面向地铁、铁路、公路、水电、市政工程等行业企业就业。',
        courses: ['隧道施工技术', '地下工程施工', '矿山法施工', '岩土工程', '地下工程监测', '新奥法施工'],
        jobs: ['隧道施工技术员', '地下工程施工员', '养护维修技术员', '工程管理员'],
        features: ['国家基建重点方向', '技术含量高', '薪资水平好']
    },
    '地下与隧道工程技术（盾构施工）': {
        dept: '城轨工程学院', duration: '3年',
        intro: '聚焦盾构机操作与隧道掘进施工，培养掌握盾构设备操控、维保和掘进施工管理的高端技能人才。盾构机是国之重器，操作人才十分稀缺。',
        courses: ['盾构机构造与原理', '盾构操作技术', '盾构维保技术', '盾构施工管理', '隧道掘进监测', '泥水处理技术'],
        jobs: ['盾构机操作手', '盾构维保工程师', '盾构施工管理员', '隧道掘进技术员'],
        features: ['人才极度稀缺', '薪资待遇优厚', '技术含量高、不可替代性强']
    },
    '地下与隧道工程技术（掘进机施工）': {
        dept: '城轨工程学院', duration: '3年',
        intro: '培养掌握全断面隧道掘进机（TBM）施工、操作、组装调试和运维养护的专业人才。面向轨道交通、公路隧道、水利水电、矿山与能源等建设单位就业。',
        courses: ['掘进机构造与原理', 'TBM操作技术', '掘进机施工管理', '隧道施工监测', '设备组装调试', '运维与养护技术'],
        jobs: ['掘进机操作员', 'TBM技术员', '设备调试工程师', '隧道施工管理员'],
        features: ['高端装备操作人才', '行业需求旺盛', '不可替代性强']
    },
    /* ── 道桥与建筑学院 (qjxy.sxri.net) ── */
    '道路与桥梁工程技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握公路、城市道路、桥梁工程施工与管理技术的专业人才。设有桥梁创新技术应用研究中心，与多家大型建筑企业保持密切合作。',
        courses: ['路基路面工程', '桥梁工程施工', '道路勘测设计', '公路工程检测', '道桥工程计量', '市政工程施工'],
        jobs: ['道路施工技术员', '桥梁施工技术员', '公路检测员', '工程计量员', '市政工程师'],
        features: ['就业面最广的专业之一', '国家基建核心需求', '技能证书体系完善']
    },
    '建筑工程技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握建筑施工技术、质量控制和项目管理能力的专业人才。建筑行业体量巨大，技术人才需求持续旺盛，是经久不衰的热门专业。',
        courses: ['建筑施工技术', '建筑结构', '建筑工程计量', '建筑CAD', 'BIM技术应用', '装配式建筑'],
        jobs: ['施工员', '质量员', '安全员', '资料员', 'BIM建模师'],
        features: ['行业需求稳定', '职业发展路径清晰', '建造师考试对口']
    },
    '建筑装饰工程技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握室内外装饰设计与施工管理能力的专业人才。随着人们对居住品质要求的提升，建筑装饰行业持续繁荣。',
        courses: ['装饰施工技术', '装饰材料', '室内设计原理', '装饰工程预算', '建筑CAD制图', '装饰工程管理'],
        jobs: ['装饰施工员', '室内设计师', '装饰预算员', '项目经理助理'],
        features: ['创意与技术结合', '个人发展空间大', '可自主创业']
    },
    '给排水工程技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握建筑给排水系统设计、施工和运维管理能力的专业人才。城市基础设施建设和海绵城市建设推动本专业人才需求持续增长。',
        courses: ['给排水管道工程', '建筑给排水设计', '水处理技术', '消防工程', '给排水施工组织', 'BIM管线综合'],
        jobs: ['给排水施工员', '设备安装工程师', '市政管线工程师', '水务运营管理'],
        features: ['城市基础设施刚需', '绿色建筑方向', '就业稳定']
    },
    '水利水电建筑工程': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握水利水电工程施工与管理技术的专业人才。国家水网建设和清洁能源发展为本专业提供了广阔的就业前景。',
        courses: ['水工建筑物', '水利工程施工', '水电站', '水文与水资源', '工程地质', '水利工程施工组织'],
        jobs: ['水利工程施工员', '水电站运维员', '水利工程监理', '水资源管理'],
        features: ['国家重点投资方向', '就业前景广阔', '服务清洁能源建设']
    },
    '智能建造技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握BIM技术、装配式建筑、智能施工设备等新型建造技术的复合型人才。建筑业数字化转型急需本专业毕业生。',
        courses: ['BIM技术综合应用', '装配式建筑施工', '智能测量技术', '3D打印建筑技术', '建筑机器人应用', '绿色建筑技术'],
        jobs: ['BIM工程师', '智能建造技术员', '装配式建筑施工员', '数字化建造管理'],
        features: ['建筑行业未来方向', '数字化转型急需', '技术前沿']
    },
    /* ── 工程管理与物流学院 (glxy.sxri.net) ── */
    '工程造价': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握工程预算、招投标、合同管理和成本控制能力的复合型人才。造价岗位是工程建设的关键环节，被称为"工程管家"。',
        courses: ['工程计量与计价', '安装工程预算', '招投标与合同管理', '工程造价软件', 'BIM造价应用', '工程审计'],
        jobs: ['造价员', '招投标专员', '合同管理员', '审计员', '成本控制岗'],
        features: ['适合细致型人才', '男女比例均衡', '持证后薪资增长快']
    },
    '建设工程监理': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握工程质量、进度、投资控制和合同管理能力的监理人才。监理是工程质量的"守护者"，是建设工程不可或缺的重要环节。',
        courses: ['建设工程监理', '质量控制', '进度控制', '投资控制', '合同管理', '监理实务'],
        jobs: ['监理员', '专业监理工程师', '质量检测员', '工程验收员'],
        features: ['国家强制监理制度保障', '职业准入门槛明确', '工作相对稳定']
    },
    '安全技术与管理': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握安全生产管理、安全评价、事故预防与应急处理能力的专业人才。"安全第一"是工程建设的基本原则，安全管理人员是各企业刚需。',
        courses: ['安全管理学', '安全评价技术', '职业卫生', '消防安全技术', '应急管理', '安全法律法规'],
        jobs: ['安全管理员', '安全评价师', '注册安全工程师', 'HSE管理岗'],
        features: ['国家重视安全生产', '持证上岗含金量高', '各行业都需要']
    },
    '工程物流管理': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握工程物资采购、仓储管理、供应链管理等技能的专业人才。铁路和基建工程物资需求量巨大，物流管理直接影响工程进度和成本。',
        courses: ['工程物资管理', '仓储与配送管理', '供应链管理', '材料检测技术', '物流信息技术', '采购管理'],
        jobs: ['物资管理员', '仓储主管', '采购专员', '供应链管理岗'],
        features: ['铁路行业特色', '实操性强', '央企岗位多']
    },
    '现代物流管理': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握现代物流运营、智慧物流系统和供应链管理能力的复合型人才。电商物流和智慧仓储推动行业高速发展。',
        courses: ['智慧物流', '物流系统规划与设计', '冷链物流', '物流数据分析', '跨境电商物流', '供应链金融'],
        jobs: ['物流规划师', '仓储运营经理', '供应链分析师', '物流信息技术岗'],
        features: ['行业发展迅速', '智慧物流新方向', '就业面广']
    },
    /* ── 铁道运输学院 (ysxy.sxri.net) ── */
    '铁道交通运营管理': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养掌握铁路行车组织、客运组织、货运组织等运营管理能力的专业人才。拥有铁路行车管理综合实训基地。',
        courses: ['铁路行车组织', '铁路客运组织', '铁路货运组织', '铁路运输设备', '铁路安全管理', '铁路运输调度'],
        jobs: ['车站值班员', '客运值班员', '货运值班员', '列车调度员', '车务段管理岗'],
        features: ['铁路运输核心岗位', '就业稳定性强', '铁路局直招']
    },
    '铁道信号自动控制': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养掌握铁路信号设备安装、调试、维护和故障处理能力的专业人才。信号系统是列车运行的"大脑"，是铁路安全运营的关键。',
        courses: ['铁路信号基础', '区间信号自动控制', '车站信号联锁', '列车运行控制系统', '信号施工与维护', 'CTCS系统'],
        jobs: ['信号工', '信号设备维护员', '信号工程师', '电务段技术岗'],
        features: ['铁路安全核心技术', '智能化发展方向', '人才供不应求']
    },
    '城市轨道交通运营管理': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养具备城市轨道交通行车组织、客运组织、票务管理等能力的运营管理人才。随着城市轨道交通网络不断扩展，运营管理人才需求持续增长。',
        courses: ['城轨行车组织', '城轨客运组织', '城轨信号系统', '票务管理', '城轨安全管理', '应急处置'],
        jobs: ['地铁行车值班员', '站务员', '调度员', '票务管理员', '客运值班员'],
        features: ['工作稳定体面', '城市就业机会多', '地铁公司直招']
    },
    '城市轨道交通通信信号技术': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养掌握城市轨道交通通信和信号系统安装、调试与维护能力的专业人才。地铁网络快速扩张急需通信信号技术人才。',
        courses: ['城轨信号基础', '城轨通信系统', '列车自动控制ATC', '信号联锁系统', '数据通信技术', '城轨信号施工'],
        jobs: ['信号维护员', '通信维护员', '地铁信号工程师', '设备调试技术员'],
        features: ['地铁新线需求大', '技术含量高', '城市就业']
    },
    '铁道通信与信息化技术': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养掌握铁路通信系统和信息化技术应用能力的专业人才。铁路信息化建设持续推进，通信技术人才需求旺盛。',
        courses: ['铁路通信系统', '光纤通信技术', '移动通信技术', '铁路信息化应用', '数据通信与网络', '通信线路施工'],
        jobs: ['通信工', '通信设备维护员', '信息化技术员', '通信工程师'],
        features: ['铁路信息化核心', '技术更新快', '发展空间大']
    },
    '铁路物流管理': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养掌握铁路货运组织、物流运营和多式联运管理能力的专业人才。铁路现代物流体系建设为本专业带来新机遇。',
        courses: ['铁路货运组织', '铁路物流运营', '多式联运管理', '物流信息技术', '货运安全管理', '冷链物流'],
        jobs: ['铁路货运员', '物流调度员', '货运安全管理', '多式联运运营'],
        features: ['铁路特色物流', '多式联运新机遇', '就业稳定']
    },
    '计算机网络技术': {
        dept: '铁道运输学院', duration: '3年',
        intro: '培养掌握计算机网络组建、管理和维护能力的技术人才。信息化建设和数字化转型推动网络技术人才需求持续增长。',
        courses: ['计算机网络', '网络安全技术', '服务器管理', '数据库技术', '云计算技术', '网络工程实施'],
        jobs: ['网络管理员', '网络安全工程师', 'IT运维工程师', '系统集成技术员'],
        features: ['IT行业基础岗位', '各行各业都需要', '技能提升空间大']
    },
    /* ── 铁道动力学院 (dlxy.sxri.net) ── */
    '铁道供电技术': {
        dept: '铁道动力学院', duration: '3年',
        intro: '培养掌握铁路牵引供电系统安装、调试、运行与维护的专业人才。高铁和电气化铁路的发展使得供电技术人才需求不断增长。',
        courses: ['牵引变电所', '接触网施工与维护', '高电压技术', '电力线路施工', '继电保护', '供电系统运行'],
        jobs: ['接触网工', '变电所值班员', '供电段技术员', '电力维护工程师'],
        features: ['铁路电气化核心专业', '技术含量高', '工作稳定性好']
    },
    '动车组检修技术': {
        dept: '铁道动力学院', duration: '3年',
        intro: '培养掌握动车组检修、调试和运用维护能力的高端技能人才。中国高铁运营里程世界第一，动车组检修人才需求旺盛。',
        courses: ['动车组构造', '动车组制动技术', '动车组电气设备', '动车组检修工艺', '动车组运用与管理', '转向架检修'],
        jobs: ['动车组机械师', '动车组检修员', '动车所技术岗', '车辆段检修管理'],
        features: ['高铁核心技术岗位', '薪资待遇好', '职业荣誉感强']
    },
    '铁道机车运用与维护': {
        dept: '铁道动力学院', duration: '3年',
        intro: '培养掌握铁路机车运用、操纵和维护检修能力的专业人才。拥有铁道机车产业学院，校企合作深入。',
        courses: ['机车总体', '机车电机电器', '机车制动', '机车运用与操纵', '机车检修工艺', '机车故障诊断'],
        jobs: ['机车乘务员', '机车检修员', '机务段技术岗', '机车调试员'],
        features: ['铁路核心岗位', '铁道机车产业学院', '就业稳定']
    },
    '铁道车辆技术': {
        dept: '铁道动力学院', duration: '3年',
        intro: '培养掌握铁道车辆检修、运用和管理能力的专业人才。铁路客货车辆的安全运行离不开专业的车辆技术人才。',
        courses: ['车辆构造', '车辆制动', '车辆检修工艺', '客车电气装置', '车辆运用与管理', '车辆故障诊断'],
        jobs: ['车辆检修员', '车辆钳工', '车辆段技术岗', '客车检车员'],
        features: ['铁路运营安全保障', '技术性岗位', '就业稳定']
    },
    '城市轨道交通供配电技术': {
        dept: '铁道动力学院', duration: '3年',
        intro: '培养掌握城市轨道交通供电系统安装、调试与维护能力的专业人才。地铁供电系统是城轨安全运营的基础保障。',
        courses: ['城轨供电系统', '城轨变电所', '接触网施工', '电力电缆施工', 'SCADA系统', '供电安全管理'],
        jobs: ['城轨供电维护员', '变电所值班员', '接触网工', '供电工程师'],
        features: ['地铁新线需求大', '技术岗位', '城市就业']
    },
    '城市轨道车辆应用技术': {
        dept: '铁道动力学院', duration: '3年',
        intro: '培养掌握城市轨道车辆驾驶、检修和运用管理能力的专业人才。地铁和轻轨网络快速扩张急需车辆应用技术人才。',
        courses: ['城轨车辆构造', '城轨车辆制动', '城轨车辆电气', '城轨车辆检修', '城轨车辆驾驶', '车辆故障处理'],
        jobs: ['地铁司机', '城轨车辆检修员', '车辆段技术岗', '车辆调度员'],
        features: ['地铁核心岗位', '就业城市好', '工作稳定体面']
    },
    /* ── 铁道装备制造学院 (zbxy.sxri.net) ── */
    '机电一体化技术': {
        dept: '铁道装备制造学院', duration: '3年',
        intro: '培养掌握机械、电气、自动化控制等综合技能的复合型人才。机电一体化是现代制造业的基石，就业领域非常广泛。',
        courses: ['机械设计基础', '电气控制技术', 'PLC编程', '液压与气动', '传感器技术', '自动生产线安装调试'],
        jobs: ['设备维护工程师', '自动化技术员', 'PLC编程员', '生产线管理'],
        features: ['万金油专业', '制造业刚需', '技能提升空间大']
    },
    '智能焊接技术': {
        dept: '铁道装备制造学院', duration: '3年',
        intro: '培养掌握智能焊接工艺、焊接机器人操作和焊接质量检测的专业人才。国家紧缺人才方向，持证焊工薪资优厚。',
        courses: ['焊接方法与设备', '焊接结构生产', '焊接机器人编程', '焊接质量检验', '金属材料与热处理', '智能焊接技术'],
        jobs: ['焊接工艺员', '焊接机器人操作员', '焊接质检员', '焊接工程师'],
        features: ['国家紧缺人才', '持证焊工薪资高', '智能化转型前景好']
    },
    '智能控制技术': {
        dept: '铁道装备制造学院', duration: '3年',
        intro: '培养掌握工业自动化控制系统设计、安装和调试能力的专业人才。智能制造2025战略推动智能控制技术人才需求爆发。',
        courses: ['自动控制原理', 'PLC与组态技术', '工业机器人技术', '传感器与检测技术', '电气CAD', '智能制造系统'],
        jobs: ['自动化工程师', '工业机器人技术员', '智能控制系统调试员', '设备维护工程师'],
        features: ['智能制造核心方向', '行业前景好', '技术含量高']
    },
    '铁道养路机械应用技术': {
        dept: '铁道装备制造学院', duration: '3年',
        intro: '培养掌握大型养路机械操作、维护和管理能力的专业人才。铁路养护机械化水平不断提高，养路机械操作人才需求旺盛。',
        courses: ['大型养路机械构造', '养路机械操作技术', '养路机械检修', '线路机械施工', '液压传动技术', '养路机械电气控制'],
        jobs: ['大型养路机械操作员', '养路机械检修员', '线路机械施工管理', '铁路养护技术员'],
        features: ['铁路养护机械化核心', '持证操作含金量高', '就业稳定']
    },
    '城市轨道交通机电技术': {
        dept: '铁道装备制造学院', duration: '3年',
        intro: '培养掌握城市轨道交通机电设备安装、调试与维护能力的专业人才。地铁车站的电梯、通风、给排水等机电设备需要专业人才维护。',
        courses: ['城轨机电设备', '电梯与自动扶梯', '通风空调技术', '低压电气技术', 'BAS系统', '机电设备检修'],
        jobs: ['机电设备维护员', '车站设备管理', '地铁机电工程师', '设备安装调试'],
        features: ['地铁运维核心岗位', '就业面广', '技术实用']
    },
    '智能工程机械运用技术': {
        dept: '铁道装备制造学院', duration: '3年',
        intro: '培养掌握智能工程机械操作、维修和管理能力的专业人才。基础设施建设持续推进，工程机械操作和维保人才需求旺盛。',
        courses: ['工程机械构造', '工程机械电气控制', '工程机械液压', '智能施工技术', '工程机械维修', '施工机械管理'],
        jobs: ['工程机械操作员', '设备维修工程师', '工程机械管理员', '施工现场设备管理'],
        features: ['基建刚需岗位', '智能化升级方向', '薪资水平好']
    }
};

// ===== 专业详情模态弹窗 =====
const modal = DOM.majorModal;
const modalContent = modal.querySelector('.modal-content');
const modalClose = modal.querySelector('.modal-close');
let lastFocusedElement = null; // 记录打开模态前的焦点元素

// 关闭模态
function closeModal() {
    modal.classList.remove('on');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // 恢复之前的焦点
    if (lastFocusedElement) lastFocusedElement.focus();
}

modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);

// ESC 键关闭 + 焦点陷阱
document.addEventListener('keydown', e => {
    if (!modal.classList.contains('on')) return;

    if (e.key === 'Escape') {
        closeModal();
        return;
    }

    // 焦点陷阱：Tab 键在模态内循环
    if (e.key === 'Tab') {
        const focusable = modalContent.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
        }
    }
});

// 打开模态
function openMajor(name) {
    const data = majorData[name];
    if (!data) return;

    // 记录当前焦点
    lastFocusedElement = document.activeElement;

    // 填充内容
    modal.querySelector('.modal-title').textContent = name;
    modal.querySelector('.modal-dept').textContent = data.dept;
    modal.querySelector('.modal-duration').textContent = '学制 ' + data.duration;

    // 简介
    modal.querySelector('.modal-intro').textContent = data.intro;

    // 核心课程
    const courseList = modal.querySelector('.modal-courses');
    courseList.innerHTML = data.courses.map(c => '<li>' + c + '</li>').join('');

    // 就业方向
    const jobList = modal.querySelector('.modal-jobs');
    jobList.innerHTML = data.jobs.map(j => '<li>' + j + '</li>').join('');

    // 专业特色
    const featureList = modal.querySelector('.modal-features');
    featureList.innerHTML = data.features.map(f => '<li>' + f + '</li>').join('');

    // 显示模态
    modal.classList.add('on');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalContent.scrollTop = 0;

    // 将焦点移到关闭按钮
    setTimeout(() => modalClose.focus(), CONFIG.modal.focusDelay);
}

// 给所有专业标签绑定点击事件 + 添加 tabindex
document.querySelectorAll('.dp-tags span').forEach(tag => {
    tag.style.cursor = 'none';
    tag.setAttribute('data-cursor', 'pointer');
    tag.setAttribute('tabindex', '0'); // 可聚焦
    tag.setAttribute('role', 'button');
    tag.addEventListener('click', () => openMajor(tag.textContent.trim()));
    // 支持 Enter / Space 键打开
    tag.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openMajor(tag.textContent.trim());
        }
    });
});

// ===== 磁性按钮 =====
document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
        btn.style.transform = 'translate(0,0)';
        btn.addEventListener('transitionend', function handler() {
            btn.style.transition = '';
            btn.removeEventListener('transitionend', handler);
        });
    });
});

// ===== 打字机效果 =====
(function initTyping() {
    const el = document.querySelector('.typing-text');
    if (!el) return;
    const text = el.dataset.text;
    let i = 0;
    const cursor = document.querySelector('.typing-cursor');

    // 等预加载消失后开始打字
    setTimeout(() => {
        const timer = setInterval(() => {
            el.textContent = text.slice(0, i + 1);
            i++;
            if (i >= text.length) {
                clearInterval(timer);
                // 打完后2秒隐藏光标
                setTimeout(() => { if (cursor) cursor.style.opacity = '0'; }, 2000);
            }
        }, CONFIG.typing.speed);
    }, CONFIG.preloader.typingStart);
})();

// ===== 首页轨道粒子动画 =====
(function initParticles() {
    const canvas = DOM.heroParticles;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [], animId;

    function resize() {
        w = canvas.width = canvas.offsetWidth;
        h = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // 粒子类：沿铁路轨道方向浮动的光点
    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.3) * 0.4; // 略微右倾，模拟轨道方向
            this.vy = (Math.random() - 0.5) * 0.2;
            this.r = Math.random() * 1.5 + 0.5;
            this.alpha = Math.random() * 0.4 + 0.1;
            this.life = Math.random() * 300 + 200;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life--;
            if (this.life <= 0 || this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(201, 169, 110, ${this.alpha})`;
            ctx.fill();
        }
    }

    // 创建粒子（数量根据屏幕大小调整）
    const count = Math.min(Math.floor(w * h / CONFIG.particles.density), CONFIG.particles.maxCount);
    for (let i = 0; i < count; i++) particles.push(new Particle());

    // 绘制轨道线（水平细线）
    function drawTracks() {
        const trackCount = 3;
        ctx.strokeStyle = 'rgba(201, 169, 110, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= trackCount; i++) {
            const y = h * (i / (trackCount + 1));
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
            // 枕木
            for (let x = 0; x < w; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, y - 3);
                ctx.lineTo(x, y + 3);
                ctx.stroke();
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        drawTracks();
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();

    // 页面不可见时暂停
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(animId);
        else animate();
    });
})();

// ===== 照片灯箱 =====
(function initLightbox() {
    const lb = DOM.lightbox;
    if (!lb) return;
    const lbImg = lb.querySelector('.lightbox-img');
    const lbCaption = lb.querySelector('.lightbox-caption');
    const lbClose = lb.querySelector('.lightbox-close');
    const lbPrev = lb.querySelector('.lightbox-prev');
    const lbNext = lb.querySelector('.lightbox-next');
    const cards = document.querySelectorAll('.life-card');
    let currentIdx = 0;

    // 收集所有校园生活图片数据
    const photos = [...cards].map(card => ({
        src: card.querySelector('img').src,
        alt: card.querySelector('img').alt,
        caption: card.querySelector('.life-info h3')?.textContent || ''
    }));

    function openLb(idx) {
        currentIdx = idx;
        lbImg.src = photos[idx].src;
        lbImg.alt = photos[idx].alt;
        lbCaption.textContent = photos[idx].caption;
        lb.classList.add('on');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLb() {
        lb.classList.remove('on');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function showPrev() {
        currentIdx = (currentIdx - 1 + photos.length) % photos.length;
        lbImg.src = photos[currentIdx].src;
        lbImg.alt = photos[currentIdx].alt;
        lbCaption.textContent = photos[currentIdx].caption;
    }

    function showNext() {
        currentIdx = (currentIdx + 1) % photos.length;
        lbImg.src = photos[currentIdx].src;
        lbImg.alt = photos[currentIdx].alt;
        lbCaption.textContent = photos[currentIdx].caption;
    }

    // 绑定事件
    cards.forEach((card, i) => {
        card.style.cursor = 'none';
        card.setAttribute('data-cursor', 'pointer');
        card.setAttribute('tabindex', '0');
        card.addEventListener('click', () => openLb(i));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
        });
    });

    lbClose.addEventListener('click', closeLb);
    lb.querySelector('.lightbox-backdrop').addEventListener('click', closeLb);
    lbPrev.addEventListener('click', showPrev);
    lbNext.addEventListener('click', showNext);

    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('on')) return;
        if (e.key === 'Escape') closeLb();
        if (e.key === 'ArrowLeft') showPrev();
        if (e.key === 'ArrowRight') showNext();
    });
})();
