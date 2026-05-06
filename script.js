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
const majorData = {
    /* ── 铁道工程学院 ── */
    '铁道工程技术': {
        dept: '铁道工程学院', duration: '3年',
        intro: '本专业是国家"双高计划"高水平专业群核心专业，培养掌握铁路线路、路基、桥涵、隧道等工程施工与维护技术的高素质技术技能人才。毕业生主要面向中国中铁、中国铁建等大型央企就业。',
        courses: ['铁路线路施工与维护', '铁路桥涵施工', '隧道施工技术', '铁路工程测量', '工程材料检测', '铁路工程概预算'],
        jobs: ['铁路线路工', '桥隧工', '工程施工员', '工程监理员', '铁路局技术岗'],
        features: ['国家示范专业', '校内拥有全真铁路综合实训基地', '与全国18个铁路局建立订单培养']
    },
    '高速铁道工程技术': {
        dept: '铁道工程学院', duration: '3年',
        intro: '面向高速铁路建设与维护一线，培养具备高铁线路检测、养护维修、施工管理能力的高端技能人才。紧跟中国高铁"走出去"战略，就业前景广阔。',
        courses: ['高速铁路轨道施工', '高铁线路检测技术', '无砟轨道施工', '高铁养护维修', '铁路工程施工组织', '高铁精测技术'],
        jobs: ['高铁线路检测员', '高铁养护技术员', '高铁施工员', '铁路局高铁段技术岗'],
        features: ['紧跟高铁发展前沿', '拥有高铁实训模拟系统', '毕业生供不应求']
    },
    '铁道桥梁隧道工程技术': {
        dept: '铁道工程学院', duration: '3年',
        intro: '专注铁路桥梁与隧道工程的施工、检测与维护，培养"桥隧合一"的复合型技术人才。中国桥梁隧道建设规模世界第一，本专业人才需求持续旺盛。',
        courses: ['桥梁施工技术', '隧道施工技术', '桥隧检测与加固', '地下工程施工', '盾构施工技术', 'BIM建模技术'],
        jobs: ['桥梁施工技术员', '隧道施工技术员', '桥隧检测工程师', '地铁施工技术员'],
        features: ['桥隧合一特色培养', '合作企业覆盖全国主要桥隧项目', '实训条件一流']
    },
    '铁路养护与维修': {
        dept: '铁道工程学院', duration: '3年',
        intro: '培养掌握铁路线路日常养护、病害诊断、维修施工等专业技能的应用型人才。铁路运营安全离不开养护维修，本专业是铁路运输安全的重要保障。',
        courses: ['铁路线路养护', '铁路钢轨探伤', '线路病害整治', '大型养路机械', '铁路安全管理', '轨道检测技术'],
        jobs: ['线路养护工', '钢轨探伤工', '大型机械操作员', '铁路安全管理员'],
        features: ['就业稳定性强', '实操技能要求高', '铁路运营安全核心岗位']
    },
    /* ── 城轨工程学院 ── */
    '城市轨道交通工程技术': {
        dept: '城轨工程学院', duration: '3年',
        intro: '面向城市地铁、轻轨等轨道交通基础设施建设与维护，培养掌握轨道施工、车站建设、线路维护等技能的专业人才。全国40多个城市开通地铁，人才缺口巨大。',
        courses: ['地铁施工技术', '城市轨道线路维护', '地下工程防水', '地铁车站施工', '轨道几何检测', '城市轨道概论'],
        jobs: ['地铁施工技术员', '城轨线路维护员', '地铁站务管理', '城轨工程监理'],
        features: ['与全国多家地铁公司合作', '就业城市好', '工作环境相对优越']
    },
    '城市轨道交通运营管理': {
        dept: '城轨工程学院', duration: '3年',
        intro: '培养具备城市轨道交通行车组织、客运组织、票务管理等能力的运营管理人才。随着城市轨道交通网络不断扩展，运营管理人才需求持续增长。',
        courses: ['城轨行车组织', '城轨客运组织', '城轨道交通信号', '票务管理', '城轨安全管理', '应急处置'],
        jobs: ['地铁行车值班员', '站务员', '调度员', '票务管理员', '客运值班员'],
        features: ['工作稳定体面', '城市就业机会多', '地铁公司直招']
    },
    '地下与隧道工程技术': {
        dept: '城轨工程学院', duration: '3年',
        intro: '培养掌握地下空间开发与隧道工程施工技术的专业人才。随着城市地下空间的不断开发，地下管廊、地下停车场等工程日益增多，专业前景广阔。',
        courses: ['隧道施工技术', '地下工程施工', '盾构施工技术', '岩土工程', '地下工程监测', '矿山法施工'],
        jobs: ['隧道施工技术员', '盾构操作员', '地下工程施工员', '岩土工程检测员'],
        features: ['技术含量高', '薪资水平好', '国家基建重点方向']
    },
    '盾构施工技术': {
        dept: '城轨工程学院', duration: '3年',
        intro: '聚焦盾构机操作与隧道掘进施工，培养掌握盾构设备操控、维保和掘进施工管理的高端技能人才。盾构机是国之重器，操作人才十分稀缺。',
        courses: ['盾构机构造与原理', '盾构操作技术', '盾构维保技术', '盾构施工管理', '隧道掘进监测', '泥水处理技术'],
        jobs: ['盾构机操作手', '盾构维保工程师', '盾构施工管理员', '隧道掘进技术员'],
        features: ['人才极度稀缺', '薪资待遇优厚', '技术含量高、不可替代性强']
    },
    /* ── 测绘工程学院 ── */
    '工程测量技术': {
        dept: '测绘工程学院', duration: '3年',
        intro: '培养掌握工程控制测量、地形测量、施工放样、变形监测等技能的专业人才。测量是工程建设的"眼睛"，任何工程都离不开测绘先行。',
        courses: ['控制测量', '地形测量', 'GPS测量技术', '施工放样', '数字化测图', '工程变形监测'],
        jobs: ['测量员', '测绘工程师', '施工放样技术员', 'GIS数据处理员'],
        features: ['全国测绘技能大赛屡获一等奖', '测绘仪器先进', '就业面广']
    },
    '测绘地理信息技术': {
        dept: '测绘工程学院', duration: '3年',
        intro: '培养掌握GIS数据采集、处理、分析和应用的复合型测绘人才。地理信息技术已融入智慧城市、国土规划、导航定位等众多领域。',
        courses: ['GIS原理与应用', '遥感图像处理', '空间数据库', '地图制图', '不动产测绘', '三维建模技术'],
        jobs: ['GIS工程师', '地理信息数据处理员', '测绘内业技术员', '国土测绘员'],
        features: ['信息化程度高', '就业领域宽', '与大数据、AI融合趋势明显']
    },
    '无人机测绘技术': {
        dept: '测绘工程学院', duration: '3年',
        intro: '培养掌握无人机操控、航空摄影测量、三维建模等新技术的测绘人才。无人机测绘是行业发展方向，具有高效、安全、低成本的优势。',
        courses: ['无人机操控技术', '航空摄影测量', '倾斜摄影测量', '三维建模', '正射影像制作', '无人机维保'],
        jobs: ['无人机操控员', '航测数据处理员', '三维建模师', '无人机维保员'],
        features: ['新兴热门方向', '技术前沿', '持证上岗、含金量高']
    },
    '摄影测量与遥感技术': {
        dept: '测绘工程学院', duration: '3年',
        intro: '培养掌握卫星遥感、航空摄影测量等技术，能进行遥感数据处理和空间信息提取的专业人才。遥感技术广泛应用于国土、农业、环保等领域。',
        courses: ['摄影测量学', '遥感原理与应用', '数字图像处理', '遥感制图', 'LiDAR数据处理', '卫星定位技术'],
        jobs: ['遥感工程师', '摄影测量技术员', '遥感数据分析师', '测绘内业处理员'],
        features: ['技术含量高', '国家信息化建设需要', '与航天技术紧密关联']
    },
    /* ── 道桥与建筑学院 ── */
    '道路与桥梁工程技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握公路、城市道路、桥梁工程施工与管理技术的专业人才。"要致富先修路"，道桥建设是国家基础设施建设的核心领域。',
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
    '工程造价': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握工程预算、招投标、合同管理和成本控制能力的复合型人才。造价岗位是工程建设的关键环节，被称为"工程管家"。',
        courses: ['工程计量与计价', '安装工程预算', '招投标与合同管理', '工程造价软件', 'BIM造价应用', '工程审计'],
        jobs: ['造价员', '招投标专员', '合同管理员', '审计员', '成本控制岗'],
        features: ['适合细致型人才', '男女比例均衡', '持证后薪资增长快']
    },
    '建筑装饰工程技术': {
        dept: '道桥与建筑学院', duration: '3年',
        intro: '培养掌握室内外装饰设计与施工管理能力的专业人才。随着人们对居住品质要求的提升，建筑装饰行业持续繁荣。',
        courses: ['装饰施工技术', '装饰材料', '室内设计原理', '装饰工程预算', '建筑CAD制图', '装饰工程管理'],
        jobs: ['装饰施工员', '室内设计师', '装饰预算员', '项目经理助理'],
        features: ['创意与技术结合', '个人发展空间大', '可自主创业']
    },
    /* ── 工程管理与物流学院 ── */
    '建设工程管理': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握工程项目管理、质量控制、进度管理等综合能力的管理型人才。项目经理是工程行业的核心岗位，发展空间巨大。',
        courses: ['工程项目管理', '施工组织设计', '工程质量管理', '工程安全管理', '建设工程法规', 'BIM项目管理'],
        jobs: ['施工管理员', '项目经理助理', '质量管理员', '工程监理'],
        features: ['管理+技术复合培养', '晋升空间大', '是走向项目经理的起点']
    },
    '工程物流管理': {
        dept: '工程管理与物流学院', duration: '3年',
        intro: '培养掌握工程物资采购、仓储管理、供应链管理等技能的专业人才。铁路和基建工程物资需求量巨大，物流管理直接影响工程进度和成本。',
        courses: ['工程物资管理', '仓储与配送管理', '供应链管理', '材料检测技术', '物流信息技术', '采购管理'],
        jobs: ['物资管理员', '仓储主管', '采购专员', '供应链管理岗'],
        features: ['铁路行业特色', '实操性强', '央企岗位多']
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
    /* ── 机电工程学院 ── */
    '铁道供电技术': {
        dept: '机电工程学院', duration: '3年',
        intro: '培养掌握铁路牵引供电系统安装、调试、运行与维护的专业人才。高铁和电气化铁路的发展使得供电技术人才需求不断增长。',
        courses: ['牵引变电所', '接触网施工与维护', '高电压技术', '电力线路施工', '继电保护', '供电系统运行'],
        jobs: ['接触网工', '变电所值班员', '供电段技术员', '电力维护工程师'],
        features: ['铁路电气化核心专业', '技术含量高', '工作稳定性好']
    },
    '铁道信号自动控制': {
        dept: '机电工程学院', duration: '3年',
        intro: '培养掌握铁路信号设备安装、调试、维护和故障处理能力的专业人才。信号系统是列车运行的"大脑"，是铁路安全运营的关键。',
        courses: ['铁路信号基础', '区间信号自动控制', '车站信号联锁', '列车运行控制系统', '信号施工与维护', 'CTCS系统'],
        jobs: ['信号工', '信号设备维护员', '信号工程师', '电务段技术岗'],
        features: ['铁路安全核心技术', '智能化发展方向', '人才供不应求']
    },
    '机电一体化技术': {
        dept: '机电工程学院', duration: '3年',
        intro: '培养掌握机械、电气、自动化控制等综合技能的复合型人才。机电一体化是现代制造业的基石，就业领域非常广泛。',
        courses: ['机械设计基础', '电气控制技术', 'PLC编程', '液压与气动', '传感器技术', '自动生产线安装调试'],
        jobs: ['设备维护工程师', '自动化技术员', 'PLC编程员', '生产线管理'],
        features: ['万金油专业', '制造业刚需', '技能提升空间大']
    },
    '智能焊接技术': {
        dept: '机电工程学院', duration: '3年',
        intro: '培养掌握智能焊接工艺、焊接机器人操作和焊接质量检测的专业人才。随着智能制造的发展，传统焊接正在向自动化、智能化转型。',
        courses: ['焊接方法与设备', '焊接结构生产', '焊接机器人编程', '焊接质量检验', '金属材料与热处理', '智能焊接技术'],
        jobs: ['焊接工艺员', '焊接机器人操作员', '焊接质检员', '焊接工程师'],
        features: ['国家紧缺人才', '持证焊工薪资高', '智能化转型前景好']
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
