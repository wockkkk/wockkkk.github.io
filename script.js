    // 滚动进度条
    const progressBar = document.getElementById('scrollProgress');
    const backTop = document.getElementById('backTop');

    function onScroll() {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        progressBar.style.width = progress + '%';
        backTop.classList.toggle('show', scrollTop > 300);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 回到顶部
    backTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 色块滚动入场动画（错开出现）
    const reveals = document.querySelectorAll('.block.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('visible'), index * 120);
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    reveals.forEach(el => revealObserver.observe(el));

    // 导航栏当前板块高亮
    const navLinks = document.querySelectorAll('.top-nav a:not(.logo)');
    const sections = document.querySelectorAll('#home, #about, #skills, #project, #contact');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { threshold: 0.3 });
    sections.forEach(section => navObserver.observe(section));

    // 图片加载后确保 DOM 就绪再添加事件监听（应对移动端）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAvatarClick);
    } else {
        setupAvatarClick();
    }

    function setupAvatarClick() {
        const avatar = document.querySelector('.avatar');
        console.log('调试: 头像元素', avatar);
        if (avatar) {
            // 添加点击和触摸事件
            avatar.addEventListener('click', () => {
                console.log('调试: 点击触发');
                startAvatarSpin();
            });
            // 也添加 touchend（移动端更可靠）
            avatar.addEventListener('touchend', (e) => {
                e.preventDefault(); // 防止触发 click
                console.log('调试: 触摸触发');
                startAvatarSpin();
            });

            // 动画结束后移除类
            avatar.addEventListener('animationend', () => {
                console.log('调试: 动画结束');
                avatar.classList.remove('spinning');
            });
        }
    }

    function startAvatarSpin() {
        // 移除所有动画重置
        const avatar = document.querySelector('.avatar');
        if (avatar) {
            avatar.classList.remove('spinning');
            // 强制重绘后重新添加类
            void avatar.offsetWidth;
            avatar.classList.add('spinning');
        }
    }
