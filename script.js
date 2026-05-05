addEventListener('load', () => {
    const p = document.getElementById('preloader');
    setTimeout(() => {
        p.classList.add('out');
        document.querySelectorAll('.hero .reveal-up, .hero .reveal-scale').forEach(e => e.classList.add('go'));
    }, 700);
});

// ===== 自定义光标 + rAF 循环（可暂停） =====
const cur = document.getElementById('cur');
const ring = document.getElementById('curRing');
let mx = 0, my = 0, rx = 0, ry = 0, rafId;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

function animFrame() {
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    rafId = requestAnimationFrame(animFrame);
}
animFrame();

document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(rafId); }
    else { animFrame(); }
});

document.querySelectorAll('[data-cursor],a,button,.life-card,.fc,.jp-card,.conn-card,.ac,.dp-tags span').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('h'); ring.classList.add('h'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('h'); ring.classList.remove('h'); });
});

// ===== 导航栏（rAF 节流） =====
const hdr = document.getElementById('hdr');
const btt = document.getElementById('btt');
const heroImg = document.querySelector('.hero-img');
let scrollTick = false;

addEventListener('scroll', () => {
    if (!scrollTick) {
        scrollTick = true;
        requestAnimationFrame(() => {
            const y = scrollY;
            hdr.classList.toggle('on', y > 60);
            btt.classList.toggle('vis', y > 500);
            if (heroImg) heroImg.style.transform = `translateY(${y * 0.32}px)`;
            scrollTick = false;
        });
    }
}, { passive: true });

btt.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

// ===== 导航高亮 =====
const navs = document.querySelectorAll('.hn-link');
const navObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            const id = en.target.id;
            navs.forEach(n => n.classList.toggle('active', n.getAttribute('href') === '#' + id));
        }
    });
}, { threshold: 0.28, rootMargin: '-60px 0px -40% 0px' });
document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

// ===== 全屏菜单 =====
const burger = document.getElementById('burger');
const fsmenu = document.getElementById('fsmenu');

burger.addEventListener('click', () => {
    const open = fsmenu.classList.toggle('on');
    burger.classList.toggle('on', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.fsmenu-nav a').forEach(a => {
    a.addEventListener('click', () => {
        burger.classList.remove('on');
        burger.setAttribute('aria-expanded', 'false');
        fsmenu.classList.remove('on');
        document.body.style.overflow = '';
    });
});

// ===== 滚动入场 =====
const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
        if (en.isIntersecting) {
            en.target.classList.add('go');
            en.target.querySelectorAll('.hs-num').forEach(n => {
                if (!n.dataset.done) { n.dataset.done = '1'; countNum(n, +n.dataset.to); }
            });
            revObs.unobserve(en.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.sec .reveal-up, .sec .reveal-scale, .job-banner .reveal-up, .hs-item').forEach(el => revObs.observe(el));

// ===== 数字递增 =====
function countNum(el, to) {
    const dur = 2000, t0 = performance.now();
    (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(to * ease).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
    })(t0);
}

// ===== 院系标签 =====
const tabs = document.querySelectorAll('.dt');

tabs.forEach(t => {
    t.addEventListener('click', () => {
        const id = t.dataset.tab;
        tabs.forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        document.querySelectorAll('.dp').forEach(p => {
            p.classList.remove('active');
            p.style.animationName = 'none';
        });
        const target = document.getElementById(id);
        if (target) {
            target.style.animationName = '';
            target.classList.add('active');
        }
    });
});

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
