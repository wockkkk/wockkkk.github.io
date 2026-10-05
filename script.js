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
        const debugPanel = document.getElementById('debugStatus');
        
        if (avatar) {
            if (debugPanel) debugPanel.textContent = '✅ 头像已加载';
            
            // 使用 pointerup（兼容触摸和鼠标）
            avatar.addEventListener('pointerup', () => {
                if (debugPanel) debugPanel.textContent = '👆 pointerup 触发';
                startAvatarSpin();
            });
            
            // 也保留 click（备用）
            avatar.addEventListener('click', () => {
                if (debugPanel) debugPanel.textContent = '👆 click 触发';
                startAvatarSpin();
            });
        } else {
            if (debugPanel) debugPanel.textContent = '❌ 未找到头像';
        }
    }

    function startAvatarSpin() {
        const avatar = document.querySelector('.avatar');
        const debugPanel = updateDebugPanel;
        
        if (!avatar) return;
        
        if (debugPanel) debugPanel.textContent = '🌀 开始旋转';
        
        const startTime = performance.now();
        const duration = 2500;
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 平滑贝塞尔缓动 (ease-in-out)
            const ease = t => {
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            };
            
            // 总旋转度数：7200 度
            const rawRotation = 7200 * progress;
            // 缩放：中间达到 1.2 倍
            const scale = 1 + 0.2 * Math.sin(progress * Math.PI);
            
            avatar.style.transform = `rotate(${rawRotation}deg) scale(${scale})`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                if (debugPanel) debugPanel.textContent = '🎬 旋转完成';
                // 保留原始动画状态
            }
        }
        
        requestAnimationFrame(animate);
    }

    function updateDebugPanel() {}
