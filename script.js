    // 初始化全局调试对象
    window.debugInfo = {
        isAnimating: false,
        startTime: null,
        duration: 2500,
        animationId: null,
        events: [],
        rotation: 0,
        scale: 1.0,
        remainingTime: 0,
        randomProgress: 0
    };

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

    // 调试面板拖拽功能
    function setupDragPanel() {
        const panel = document.getElementById('debugPanel');
        const handle = document.getElementById('debugPanelDrag');
        
        if (!panel || !handle) return;
        
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        // 鼠标/触摸指针 Down 事件
        function onDown(e) {
            if (!isDebugMode()) return;
            isDragging = true;
            
            // 获取原始位置
            const style = window.getComputedStyle(panel);
            const matrix = new WebKitCSSMatrix(style.transform);
            initialLeft = matrix.m41 || parseFloat(panel.style.left) || 0;
            initialTop = matrix.m42 || parseFloat(panel.style.top) || 0;
            
            // 处理触摸/鼠标事件
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            } else {
                startX = e.clientX;
                startY = e.clientY;
            }
            
            panel.style.zIndex = 10000; // 拖动时提升层级
            handle.style.cursor = 'grabbing';
            
            // 阻止默认触摸行为
            if (e.type === 'touchstart') {
                e.preventDefault();
            }
        }
        
        // 指针 Move 事件
        function onMove(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            
            // 获取移动距离
            let clientX, clientY;
            if (e.type === 'touchmove') {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            
            const dx = clientX - startX;
            const dy = clientY - startY;
            
            // 计算新位置
            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;
            
            // 限制在屏幕内
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            
            newLeft = Math.max(0, Math.min(newLeft, maxX));
            newTop = Math.max(0, Math.min(newTop, maxY));
            
            // 应用位置
            panel.style.left = newLeft + 'px';
            panel.style.top = newTop + 'px';
            panel.style.right = 'auto';
            panel.style.transform = 'none';
        }
        
        // 指针 Up 事件
        function onUp() {
            if (!isDragging) return;
            isDragging = false;
            panel.style.zIndex = 9999;
            handle.style.cursor = 'move';
            
            // 保存位置到 localStorage
            if (isDebugMode()) {
                localStorage.setItem('debugPanelPosition', JSON.stringify({
                    left: panel.style.left,
                    top: panel.style.top
                }));
            }
        }
        
        // 绑定事件
        handle.addEventListener('mousedown', onDown);
        handle.addEventListener('touchstart', onDown, { passive: false });
        
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchend', onUp);
        document.addEventListener('mouseleave', onUp);
    }
    
    // 检查是否启用调试模式 (#debug)
    function isDebugMode() {
        return window.location.hash === '#debug';
    }

    // 全局调试面板关闭函数
    window.closeDebugPanel = function() {
        const panel = document.getElementById('debugPanel');
        if (panel) panel.style.display = 'none';
        window.location.hash = ''; // 移除 #debug
        window.location.reload();
    };

    function setupAvatarClick() {
        const avatar = document.querySelector('.avatar');
        
        // 设置调试面板拖拽功能
        setupDragPanel();
        
        // 显示/隐藏调试面板
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.style.display = isDebugMode() ? 'block' : 'none';
            
            // 恢复之前保存的位置
            if (isDebugMode()) {
                const savedPos = localStorage.getItem('debugPanelPosition');
                if (savedPos) {
                    const { left, top } = JSON.parse(savedPos);
                    debugPanel.style.left = left + 'px';
                    debugPanel.style.top = top + 'px';
                    debugPanel.style.right = 'auto';
                    debugPanel.style.transform = 'none';
                }
            }
            
            updateDebugPanel(`页面已加载 - ${isDebugMode() ? '🔴' : '🟢'} ${isDebugMode() ? '调试模式开启' : '调试模式关闭'}`);
        }
        
        // 设置事件日志
        logEvent('页面加载完成');
        if (avatar) {
            if (debugPanel) updateDebugPanel('✅ 头像已加载');

            // 使用 pointerup（兼容触摸和鼠标）
            avatar.addEventListener('pointerup', () => {
                logEvent('pointerup 触发');
                startAvatarSpin();
            });

            // 也保留 click（备用）
            avatar.addEventListener('click', () => {
                logEvent('click 触发');
                startAvatarSpin();
            });
        } else {
            if (debugPanel) updateDebugPanel('❌ 未找到头像');
        }
    }

    function updateDebugPanel(status) {
        const debugPanel = document.getElementById('debugPanel');
        if (!debugPanel || !isDebugMode()) return;

        const statusEl = document.getElementById('debugStatus');
        const progressEl = document.getElementById('debugProgress');
        const rotationEl = document.getElementById('debugRotation');
        const scaleEl = document.getElementById('debugScale');
        const timeEl = document.getElementById('debugTime');
        const eventLogEl = document.getElementById('debugEventLog');

        if (statusEl) statusEl.textContent = status;
        if (progressEl) progressEl.textContent = `进度：${Math.round(window.debugInfo.randomProgress || 0)}%`;
        if (rotationEl) rotationEl.textContent = `${Math.round(window.debugInfo.rotation || 0)}°`;
        if (scaleEl) scaleEl.textContent = window.debugInfo.scale ? window.debugInfo.scale.toFixed(2) : '1.00';
        if (timeEl) timeEl.textContent = `${Math.max(0, Math.round(window.debugInfo.remainingTime || 0))}ms`;

        // 更新事件日志 - 每次只追加新事件
        if (eventLogEl && window.debugInfo.events.length > 0) {
            const lastEvent = window.debugInfo.events[window.debugInfo.events.length - 1];
            eventLogEl.innerHTML = `<div style="color:#aaa;">📋 事件日志:</div>` +
                window.debugInfo.events.map(e => `<div>• ${e}</div>`).join('');
        }
    }

    function logEvent(event) {
        if (!window.debugInfo) return;
        window.debugInfo.events.push(event);
        updateDebugPanel(`📋 ${event}`);
    }

    function startAvatarSpin() {
        const avatar = document.querySelector('.avatar');
        if (!avatar) return;

        if (isDebugMode()) logEvent('🚀 启动旋转');

        // 重置动画相关的调试信息，但保留事件日志
        window.debugInfo.isAnimating = true;
        window.debugInfo.startTime = performance.now();
        window.debugInfo.rotation = 0;
        window.debugInfo.scale = 1.0;
        window.debugInfo.remainingTime = window.debugInfo.duration;
        window.debugInfo.randomProgress = 0;

        // 隐藏调试面板3秒
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            setTimeout(() => {
                if (isDebugMode()) debugPanel.style.display = 'block';
            }, 3000);
        }

        const duration = window.debugInfo.duration;

        function animate(currentTime) {
            const elapsed = currentTime - window.debugInfo.startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 平滑贝塞尔缓动 (ease-in-out)
            const ease = t => {
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            };

            // 总旋转度数：7200 度
            const rawRotation = 7200 * progress;
            // 缩放：中间达到 1.2 倍
            const scale = 1 + 0.2 * Math.sin(progress * Math.PI);

            // 更新调试信息
            if (isDebugMode() && window.debugInfo) {
                window.debugInfo.rotation = rawRotation;
                window.debugInfo.scale = scale;
                window.debugInfo.remainingTime = Math.max(0, duration - elapsed);
                window.debugInfo.randomProgress = progress * 100;
                updateDebugPanel('🌀 动画中...');
            }

            avatar.style.transform = `rotate(${rawRotation}deg) scale(${scale})`;

            if (progress < 1) {
                window.debugInfo.animationId = requestAnimationFrame(animate);
            } else {
                window.debugInfo.isAnimating = false;
                window.debugInfo.animationId = null;

                if (isDebugMode()) {
                    logEvent('✅ 旋转完成');
                    updateDebugPanel('🎬 动画结束');
                }

                // 清除所有样式
                avatar.style.transform = '';
            }
        }

        window.debugInfo.animationId = requestAnimationFrame(animate);
    }

    // 窗口调整时也检查调试模式
    window.addEventListener('resize', () => {
        const debugPanel = document.getElementById('debugPanel');
        if (debugPanel) {
            debugPanel.style.display = isDebugMode() ? 'block' : 'none';
        }
    });
