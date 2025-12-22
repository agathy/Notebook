// cardStackManager.js - 卡片堆滑动管理器

class CardStackManager {
    constructor(container, options = {}) {
        this.container = container;
        this.cards = [];
        this.currentIndex = 0;
        this.isAnimating = false;
        
        // 配置选项
        this.options = {
            swipeThreshold: 80,  // 降低滑动阈值，更容易触发
            rotationAngle: 15,   // 旋转角度
            stackOffset: 8,      // 堆叠偏移
            scaleStep: 0.05,     // 缩放步长
            ...options
        };
        
        // 触摸/鼠标事件状态
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createSwipeHint();
    }
    
    setupEventListeners() {
        // 触摸事件（移动设备优先）
        this.container.addEventListener('touchstart', this.handleStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleEnd.bind(this), { passive: false });
        
        // 鼠标事件（桌面设备）
        this.container.addEventListener('mousedown', this.handleStart.bind(this));
        document.addEventListener('mousemove', this.handleMove.bind(this));
        document.addEventListener('mouseup', this.handleEnd.bind(this));
        
        // 防止默认的拖拽行为
        this.container.addEventListener('dragstart', (e) => e.preventDefault());
        
        // 防止上下文菜单
        this.container.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    createSwipeHint() {
        // 检查是否已经存在提示元素
        if (!this.swipeHint || !this.container.contains(this.swipeHint)) {
            this.swipeHint = document.createElement('div');
            this.swipeHint.className = 'swipe-hint';
            this.container.appendChild(this.swipeHint);
        }
    }
    
    showSwipeHint(text) {
        this.swipeHint.textContent = text;
        this.swipeHint.classList.add('show');
        setTimeout(() => {
            this.swipeHint.classList.remove('show');
        }, 1000);
    }
    
    handleStart(e) {
        if (this.isAnimating || this.cards.length === 0) return;
        
        // 阻止默认行为，特别是在移动设备上
        e.preventDefault();
        e.stopPropagation();
        
        this.isDragging = true;
        
        const point = e.touches ? e.touches[0] : e;
        this.startX = point.clientX;
        this.startY = point.clientY;
        this.currentX = point.clientX;
        this.currentY = point.clientY;
        
        // 添加触摸反馈
        this.container.classList.add('touching');
        
        // 获取当前顶部卡片
        const topCard = this.getTopCard();
        if (topCard) {
            topCard.classList.add('swiping');
        }
    }
    
    handleMove(e) {
        if (!this.isDragging || this.isAnimating) return;
        
        // 阻止默认行为和事件冒泡
        e.preventDefault();
        e.stopPropagation();
        
        const point = e.touches ? e.touches[0] : e;
        this.currentX = point.clientX;
        this.currentY = point.clientY;
        this.deltaX = this.currentX - this.startX;
        this.deltaY = this.currentY - this.startY;
        
        // 只有水平滑动距离大于垂直滑动距离时才处理
        if (Math.abs(this.deltaX) > Math.abs(this.deltaY)) {
            // 更新顶部卡片的位置和旋转
            const topCard = this.getTopCard();
            if (topCard) {
                const rotation = (this.deltaX / this.container.offsetWidth) * this.options.rotationAngle;
                const opacity = Math.max(0.3, 1 - Math.abs(this.deltaX) / (this.container.offsetWidth * 0.8));
                
                topCard.style.transform = `translateX(${this.deltaX}px) translateY(${this.deltaY * 0.1}px) rotate(${rotation}deg)`;
                topCard.style.opacity = opacity;
                
                // 显示滑动提示
                if (Math.abs(this.deltaX) > 50) {
                    if (this.deltaX > 0) {
                        this.showSwipeHint('👉 下一个');
                    } else {
                        this.showSwipeHint('👈 上一个');
                    }
                }
            }
        }
    }
    
    handleEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.container.classList.remove('touching');
        
        const topCard = this.getTopCard();
        if (!topCard) return;
        
        topCard.classList.remove('swiping');
        
        // 判断是否达到滑动阈值
        if (Math.abs(this.deltaX) > this.options.swipeThreshold) {
            if (this.deltaX > 0) {
                this.swipeRight();
            } else {
                this.swipeLeft();
            }
        } else {
            // 回弹到原位
            this.resetTopCard();
        }
        
        // 重置状态
        this.deltaX = 0;
        this.deltaY = 0;
    }
    
    swipeLeft() {
        if (this.isAnimating) return;
        this.previousCard();
    }
    
    swipeRight() {
        if (this.isAnimating) return;
        this.nextCard();
    }
    
    nextCard() {
        if (this.isAnimating || this.currentIndex >= this.cards.length - 1) {
            console.log('nextCard blocked:', { 
                isAnimating: this.isAnimating, 
                currentIndex: this.currentIndex, 
                totalCards: this.cards.length 
            });
            return;
        }
        
        console.log('Moving to next card:', this.currentIndex + 1);
        this.isAnimating = true;
        const topCard = this.getTopCard();
        
        if (topCard) {
            // 滑出动画
            topCard.classList.add('swipe-right');
            
            setTimeout(() => {
                // 移除顶部卡片
                topCard.remove();
                
                // 更新索引
                this.currentIndex++;
                
                // 重新构建卡片堆
                this.updateCardStack();
                
                this.isAnimating = false;
                this.onCardChange();
                console.log('Next card animation completed, new index:', this.currentIndex);
            }, 300);
        } else {
            console.error('No top card found for nextCard');
            this.isAnimating = false;
        }
    }
    
    previousCard() {
        if (this.isAnimating || this.currentIndex <= 0) {
            console.log('previousCard blocked:', { 
                isAnimating: this.isAnimating, 
                currentIndex: this.currentIndex 
            });
            return;
        }
        
        console.log('Moving to previous card:', this.currentIndex - 1);
        this.isAnimating = true;
        
        // 更新索引
        this.currentIndex--;
        
        // 重新构建卡片堆
        this.updateCardStack();
        
        this.isAnimating = false;
        this.onCardChange();
        console.log('Previous card completed, new index:', this.currentIndex);
    }
    
    resetTopCard() {
        const topCard = this.getTopCard();
        if (topCard) {
            topCard.style.transform = '';
            topCard.style.opacity = '';
        }
    }
    
    getTopCard() {
        // 查找第一个卡片元素（跳过swipe-hint）
        const cards = this.container.querySelectorAll('.word-card-item');
        const topCard = cards[0] || null;
        
        console.log('getTopCard called, found:', !!topCard);
        if (!topCard) {
            console.log('Available cards in container:', cards.length);
            console.log('Container children:', this.container.children.length);
            console.log('First child class:', this.container.firstElementChild?.className);
        }
        return topCard;
    }
    
    updateCardStack() {
        console.log('updateCardStack called, currentIndex:', this.currentIndex, 'totalCards:', this.cards.length);
        
        // 清除所有现有的卡片
        const existingCards = this.container.querySelectorAll('.word-card-item');
        existingCards.forEach(card => card.remove());
        
        // 计算需要显示的卡片数量
        const visibleCards = Math.min(4, this.cards.length - this.currentIndex);
        
        console.log('Creating', visibleCards, 'cards starting from index', this.currentIndex);
        
        // 创建新的卡片
        for (let i = 0; i < visibleCards; i++) {
            const cardIndex = this.currentIndex + i;
            if (cardIndex < this.cards.length) {
                console.log('Creating card for index:', cardIndex, 'data:', this.cards[cardIndex]);
                const cardElement = this.createCardElement(this.cards[cardIndex]);
                if (cardElement) {
                    this.container.appendChild(cardElement);
                    console.log('Card created and added to DOM');
                } else {
                    console.error('Failed to create card element for index:', cardIndex);
                }
            }
        }
        
        // 更新卡片样式和位置
        this.updateCardPositions();
        
        const finalCardCount = this.container.querySelectorAll('.word-card-item').length;
        console.log('updateCardStack completed, final card count:', finalCardCount);
    }
    
    updateCardPositions() {
        // 只获取卡片元素，不包括swipe-hint
        const cardElements = this.container.querySelectorAll('.word-card-item');
        
        console.log('updateCardPositions called with', cardElements.length, 'cards');
        
        cardElements.forEach((card, index) => {
            // 移除所有动画类
            card.classList.remove('swipe-left', 'swipe-right', 'removing', 'swiping');
            
            // 重置样式
            card.style.transform = '';
            card.style.opacity = '';
            card.style.zIndex = 10 - index;
            
            // 应用堆叠效果
            const offset = index * this.options.stackOffset;
            const scale = 1 - (index * this.options.scaleStep);
            const opacity = Math.max(0.4, 1 - (index * 0.2));
            
            card.style.transform = `translateY(${offset}px) scale(${scale})`;
            card.style.opacity = opacity;
        });
    }
    
    createCardElement(wordData) {
        // 这个方法需要在外部实现，因为它依赖于具体的卡片创建逻辑
        if (this.onCreateCard) {
            return this.onCreateCard(wordData);
        }
        
        // 默认实现
        const card = document.createElement('div');
        card.className = 'word-card-item';
        card.textContent = '卡片内容';
        return card;
    }
    
    setCards(cards) {
        this.cards = cards;
        this.currentIndex = 0;
        this.renderCards();
    }
    
    renderCards() {
        console.log('renderCards called with', this.cards.length, 'cards');
        
        // 清空容器，但保留提示元素的引用
        const existingHint = this.swipeHint;
        this.container.innerHTML = '';
        this.swipeHint = null; // 重置引用
        
        // 重新创建提示元素
        this.createSwipeHint();
        
        if (this.cards.length === 0) {
            this.container.innerHTML += `
                <div class="cards-empty">
                    <i class="fas fa-layer-group"></i>
                    <h3>暂无单词</h3>
                    <p>添加一些单词来查看卡片堆视图</p>
                </div>
            `;
            return;
        }
        
        // 渲染初始卡片
        this.updateCardStack();
        this.onCardChange();
        
        console.log('renderCards completed, cards in DOM:', this.container.querySelectorAll('.word-card-item').length);
    }
    
    getCurrentCard() {
        return this.cards[this.currentIndex] || null;
    }
    
    getCurrentIndex() {
        return this.currentIndex;
    }
    
    getTotalCards() {
        return this.cards.length;
    }
    
    goToCard(index) {
        if (index < 0 || index >= this.cards.length || index === this.currentIndex || this.isAnimating) {
            return;
        }
        
        this.currentIndex = index;
        this.renderCards();
    }
    
    // 事件回调
    onCardChange() {
        if (this.onCardChangeCallback) {
            this.onCardChangeCallback(this.currentIndex, this.cards[this.currentIndex]);
        }
    }
    
    // 设置回调函数
    setOnCardChange(callback) {
        this.onCardChangeCallback = callback;
    }
    
    setOnCreateCard(callback) {
        this.onCreateCard = callback;
    }
    
    // 销毁
    destroy() {
        // 移除事件监听器
        this.container.removeEventListener('mousedown', this.handleStart);
        document.removeEventListener('mousemove', this.handleMove);
        document.removeEventListener('mouseup', this.handleEnd);
        this.container.removeEventListener('touchstart', this.handleStart);
        document.removeEventListener('touchmove', this.handleMove);
        document.removeEventListener('touchend', this.handleEnd);
    }
}

export { CardStackManager };
// 暴露调试函数到全局作用域
if (typeof window !== 'undefined') {
    window.cardStackDebug = {
        manager: () => window.cardStackManager,
        nextCard: () => window.cardStackManager?.nextCard(),
        prevCard: () => window.cardStackManager?.previousCard(),
        getCurrentIndex: () => window.cardStackManager?.getCurrentIndex(),
        getTotalCards: () => window.cardStackManager?.getTotalCards()
    };
}