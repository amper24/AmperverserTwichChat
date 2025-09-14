class TwitchChat {
    constructor() {
        this.socket = null;
        this.channel = '';
        this.isConnected = false;
        this.messageCount = 0;
        this.maxMessages = 100; // Максимальное количество сообщений в чате
        
        // Кэш для бейджей
        this.badgeCache = new Map();
        this.twitchClientId = 'ixowm4lsi8n8c07c5q6o9wajawma2m'; // Ваш Client ID
        this.twitchOAuthToken = '3907ydvzaj8du83lv2fqvy6uk6151s'; // Ваш OAuth токен
        
        // Массивы для эмодзи (7TV, BTTV, FFZ)
        this.sevenTVGlobalEmotes = [];
        this.sevenTVChannelEmotes = [];
        this.bttvGlobalEmotes = [];
        this.bttvChannelEmotes = [];
        this.bttvSharedEmotes = [];
        this.ffzGlobalEmotes = [];
        this.ffzChannelEmotes = [];
        
        // Настройки по умолчанию
        this.settings = {
            borderWidth: 3,
            borderColor: '#9146ff',
            borderRadius: 10,
            hideBorder: false,
            enableGlow: false,
            glowColor: '#9146ff',
            glowIntensity: 20,
            backgroundImage: '',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundOpacity: 100,
            backgroundColor: '#1a1a2e',
            backgroundGradient: 'linear',
            gradientColor1: '#1a1a2e',
            gradientColor2: '#16213e',
            gradientDirection: 'to right',
            hideBackground: false,
            fadeMessages: false,
        messageAlignment: 'left',
        borderMode: 'fit-content',
        borderAlignment: 'left',
        chatDirection: 'bottom-to-top',
            appearAnimation: 'none',
            disappearAnimation: 'fade-out',
            // Старый параметр animationDuration удален
            // Новые настройки анимаций
            appearDuration: 1000,
            appearDelay: 0,
            disappearDuration: 500,
            messageDisplayTime: 10,
            staggerAnimations: false,
            staggerDelay: 100,
            messageBackgroundColor: '#1a1a1a',
            messageBackgroundOpacity: 80,
            messageBackgroundGradient: 'linear',
            messageGradientColor1: '#1a1a1a',
            messageGradientColor2: '#2a2a2a',
            messageGradientDirection: 'to right',
            messageBackgroundImage1: '',
            messageBackgroundImage2: '',
            messageBgSize1: 'cover',
            messageBgPosition1: 'center',
            messageBgSize2: 'cover',
            messageBgPosition2: 'center',
            // Настройки значков
            showUserBadges: true,
            showChannelBadges: true,
            // Настройки шрифтов
            fontFamily: 'Arial, sans-serif',
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: 0,
            fontColor: '#ffffff',
            maxMessages: 100,
            messageSpeed: 300,
            chatWidth: 800,
            chatHeight: 600
        };
        
        this.initializeElements();
        
        // Проверяем, что элементы инициализированы
        if (!this.chatMessagesElement) {
            console.error('chatMessagesElement не найден! Проверьте HTML структуру.');
            return;
        }
        
        this.loadSettings().then(() => {
            this.loadChannelFromURL();
            this.showImageLoadStatus();
        });
        console.log('Chat settings after load:', {
            appearAnimation: this.settings.appearAnimation,
            appearDuration: this.settings.appearDuration
        });
        this.setupMessageListener();
    }
    
    initializeElements() {
        this.chatMessagesElement = document.getElementById('chat-messages');
        this.chatContainer = document.querySelector('.chat-container');
        this.channelNameElement = document.getElementById('channel-name');
        
        console.log('Elements initialized:', {
            chatMessagesElement: this.chatMessagesElement,
            chatContainer: this.chatContainer,
            channelNameElement: this.channelNameElement
        });
        
        // Если элемент channel-name не найден, создаем заглушку
        if (!this.channelNameElement) {
            this.channelNameElement = { textContent: '' };
        }
    }
    
    // Функция для безопасной загрузки изображений
    async loadImageSafely(imageUrl) {
        return new Promise((resolve) => {
            if (!imageUrl) {
                resolve('');
                return;
            }
            
            // Декодируем URL если он закодирован
            try {
                imageUrl = decodeURIComponent(imageUrl);
            } catch (e) {
                console.warn('Ошибка декодирования URL:', imageUrl);
            }
            
            // Если это локальный файл (file://), проверяем доступность изображения
            if (window.location.protocol === 'file:') {
                const img = new Image();
                img.onload = () => {
                    console.log('Изображение успешно загружено:', imageUrl);
                    resolve(imageUrl);
                };
                img.onerror = () => {
                    console.warn('Не удалось загрузить изображение из локального файла:', imageUrl);
                    console.warn('Это может быть связано с CORS ограничениями при открытии файлов локально');
                    resolve(''); // Возвращаем пустую строку при ошибке
                };
                img.src = imageUrl;
            } else {
                // Для веб-сайтов проверяем доступность изображения
                const img = new Image();
                img.onload = () => {
                    console.log('Изображение успешно загружено:', imageUrl);
                    resolve(imageUrl);
                };
                img.onerror = () => {
                    console.warn('Не удалось загрузить изображение:', imageUrl);
                    resolve(''); // Возвращаем пустую строку при ошибке
                };
                img.src = imageUrl;
            }
        });
    }
    
    // Показываем статус загрузки изображений
    showImageLoadStatus() {
        if (window.location.protocol === 'file:') {
            const hasBackgroundImage = this.settings.backgroundImage && this.settings.backgroundImage !== '';
            const hasMessageBg1 = this.settings.messageBackgroundImage1 && this.settings.messageBackgroundImage1 !== '';
            const hasMessageBg2 = this.settings.messageBackgroundImage2 && this.settings.messageBackgroundImage2 !== '';
            
            if (hasBackgroundImage || hasMessageBg1 || hasMessageBg2) {
                console.log('ℹ️ Информация о загрузке изображений:');
                console.log('📁 Файлы открыты локально (file://)');
                console.log('⚠️  Внешние изображения могут не загружаться из-за CORS ограничений');
                console.log('💡 Решения для работы с локальными файлами:');
                console.log('   1. Запустите локальный веб-сервер (например, Live Server в VS Code)');
                console.log('   2. Используйте браузер с отключенной CORS политикой');
                console.log('   3. Разместите файлы на веб-сервере');
                console.log('   4. Используйте локальные изображения (путь к файлам на компьютере)');
                
                if (hasBackgroundImage) {
                    console.log('🖼️  Фоновое изображение:', this.settings.backgroundImage ? 'загружено' : 'не загружено');
                }
                if (hasMessageBg1) {
                    console.log('🖼️  Фон сообщений 1:', this.settings.messageBackgroundImage1 ? 'загружен' : 'не загружен');
                }
                if (hasMessageBg2) {
                    console.log('🖼️  Фон сообщений 2:', this.settings.messageBackgroundImage2 ? 'загружен' : 'не загружен');
                }
                
                // Показываем уведомление пользователю
                this.showLocalFileWarning();
            }
        }
    }
    
    // Показываем предупреждение для локальных файлов
    showLocalFileWarning() {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 193, 7, 0.95);
            color: #000;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            max-width: 400px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        notification.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Локальные файлы</div>
            <div>Внешние изображения могут не загружаться из-за CORS ограничений.</div>
            <div style="margin-top: 8px; font-size: 12px;">
                💡 Используйте локальный веб-сервер для полной функциональности
            </div>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 8px;
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                color: #000;
            ">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Автоматически скрываем через 10 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }
    
    async loadSettings() {
        // Загружаем настройки из URL параметров
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL parameters:', Object.fromEntries(urlParams.entries()));
        
        // Применяем настройки из URL
        if (urlParams.get('borderWidth')) this.settings.borderWidth = parseInt(urlParams.get('borderWidth'));
        if (urlParams.get('borderColor')) this.settings.borderColor = urlParams.get('borderColor');
        if (urlParams.get('borderRadius')) this.settings.borderRadius = parseInt(urlParams.get('borderRadius'));
        if (urlParams.has('hideBorder')) this.settings.hideBorder = urlParams.get('hideBorder') === 'true';
        if (urlParams.has('enableGlow')) this.settings.enableGlow = urlParams.get('enableGlow') === 'true';
        if (urlParams.get('glowColor')) this.settings.glowColor = urlParams.get('glowColor');
        if (urlParams.get('glowIntensity')) this.settings.glowIntensity = parseInt(urlParams.get('glowIntensity'));
        
        // Настройки фона
        if (urlParams.get('backgroundImage')) {
            this.settings.backgroundImage = await this.loadImageSafely(urlParams.get('backgroundImage'));
        }
        if (urlParams.get('backgroundSize')) this.settings.backgroundSize = urlParams.get('backgroundSize');
        if (urlParams.get('backgroundPosition')) this.settings.backgroundPosition = urlParams.get('backgroundPosition');
        if (urlParams.get('backgroundOpacity')) this.settings.backgroundOpacity = parseInt(urlParams.get('backgroundOpacity'));
        if (urlParams.get('backgroundColor')) this.settings.backgroundColor = urlParams.get('backgroundColor');
        if (urlParams.get('backgroundGradient')) this.settings.backgroundGradient = urlParams.get('backgroundGradient');
        if (urlParams.get('gradientColor1')) this.settings.gradientColor1 = urlParams.get('gradientColor1');
        if (urlParams.get('gradientColor2')) this.settings.gradientColor2 = urlParams.get('gradientColor2');
        if (urlParams.get('gradientDirection')) this.settings.gradientDirection = urlParams.get('gradientDirection');
        
        // Отладочная информация для градиента фона
        console.log('Background gradient settings loaded:', {
            backgroundGradient: this.settings.backgroundGradient,
            gradientColor1: this.settings.gradientColor1,
            gradientColor2: this.settings.gradientColor2,
            gradientDirection: this.settings.gradientDirection
        });
        if (urlParams.has('hideBackground')) this.settings.hideBackground = urlParams.get('hideBackground') === 'true';
        
        // Настройки сообщений
        if (urlParams.get('fadeMessages')) this.settings.fadeMessages = urlParams.get('fadeMessages') === 'true';
        if (urlParams.get('messageAlignment')) this.settings.messageAlignment = urlParams.get('messageAlignment');
        if (urlParams.get('borderMode')) this.settings.borderMode = urlParams.get('borderMode');
        if (urlParams.get('borderAlignment')) this.settings.borderAlignment = urlParams.get('borderAlignment');
        if (urlParams.get('chatDirection')) this.settings.chatDirection = urlParams.get('chatDirection');
        
        // Настройки анимаций
        if (urlParams.get('appearAnimation')) this.settings.appearAnimation = urlParams.get('appearAnimation');
        if (urlParams.get('disappearAnimation')) this.settings.disappearAnimation = urlParams.get('disappearAnimation');
        if (urlParams.get('appearDuration')) this.settings.appearDuration = parseInt(urlParams.get('appearDuration'));
        if (urlParams.get('appearDelay')) this.settings.appearDelay = parseInt(urlParams.get('appearDelay'));
        if (urlParams.get('disappearDuration')) this.settings.disappearDuration = parseInt(urlParams.get('disappearDuration'));
        if (urlParams.get('messageDisplayTime')) this.settings.messageDisplayTime = parseFloat(urlParams.get('messageDisplayTime'));
        if (urlParams.get('staggerAnimations')) this.settings.staggerAnimations = urlParams.get('staggerAnimations') === 'true';
        if (urlParams.get('staggerDelay')) this.settings.staggerDelay = parseInt(urlParams.get('staggerDelay'));
        
        // Настройки фона сообщений
        if (urlParams.get('messageBackgroundColor')) this.settings.messageBackgroundColor = urlParams.get('messageBackgroundColor');
        if (urlParams.get('messageBackgroundOpacity')) this.settings.messageBackgroundOpacity = parseInt(urlParams.get('messageBackgroundOpacity'));
        if (urlParams.get('messageBackgroundGradient')) this.settings.messageBackgroundGradient = urlParams.get('messageBackgroundGradient');
        if (urlParams.get('messageGradientColor1')) this.settings.messageGradientColor1 = urlParams.get('messageGradientColor1');
        if (urlParams.get('messageGradientColor2')) this.settings.messageGradientColor2 = urlParams.get('messageGradientColor2');
        if (urlParams.get('messageGradientDirection')) this.settings.messageGradientDirection = urlParams.get('messageGradientDirection');
        
        // Отладочная информация для градиентов сообщений
        console.log('Message gradient settings loaded:', {
            messageBackgroundGradient: this.settings.messageBackgroundGradient,
            messageGradientColor1: this.settings.messageGradientColor1,
            messageGradientColor2: this.settings.messageGradientColor2,
            messageGradientDirection: this.settings.messageGradientDirection
        });
        if (urlParams.get('messageBackgroundImage1')) {
            this.settings.messageBackgroundImage1 = await this.loadImageSafely(urlParams.get('messageBackgroundImage1'));
        }
        if (urlParams.get('messageBackgroundImage2')) {
            this.settings.messageBackgroundImage2 = await this.loadImageSafely(urlParams.get('messageBackgroundImage2'));
        }
        if (urlParams.get('messageBgSize1')) this.settings.messageBgSize1 = urlParams.get('messageBgSize1');
        if (urlParams.get('messageBgPosition1')) this.settings.messageBgPosition1 = urlParams.get('messageBgPosition1');
        if (urlParams.get('messageBgSize2')) this.settings.messageBgSize2 = urlParams.get('messageBgSize2');
        if (urlParams.get('messageBgPosition2')) this.settings.messageBgPosition2 = urlParams.get('messageBgPosition2');
        
        // Настройки значков
        if (urlParams.get('showUserBadges')) {
            this.settings.showUserBadges = urlParams.get('showUserBadges') === 'true';
        }
        if (urlParams.get('showChannelBadges')) {
            this.settings.showChannelBadges = urlParams.get('showChannelBadges') === 'true';
        }
        
        // Настройки шрифтов
        if (urlParams.get('fontFamily')) this.settings.fontFamily = decodeURIComponent(urlParams.get('fontFamily'));
        if (urlParams.get('fontSize')) this.settings.fontSize = parseInt(urlParams.get('fontSize'));
        if (urlParams.get('fontWeight')) this.settings.fontWeight = parseInt(urlParams.get('fontWeight'));
        if (urlParams.get('lineHeight')) this.settings.lineHeight = parseFloat(urlParams.get('lineHeight'));
        if (urlParams.get('letterSpacing')) this.settings.letterSpacing = parseFloat(urlParams.get('letterSpacing'));
        if (urlParams.get('fontColor')) this.settings.fontColor = urlParams.get('fontColor');
        
        // Настройки чата
        if (urlParams.get('maxMessages')) this.settings.maxMessages = parseInt(urlParams.get('maxMessages'));
        if (urlParams.get('messageSpeed')) this.settings.messageSpeed = parseInt(urlParams.get('messageSpeed'));
        if (urlParams.get('chatWidth')) this.settings.chatWidth = parseInt(urlParams.get('chatWidth'));
        if (urlParams.get('chatHeight')) this.settings.chatHeight = parseInt(urlParams.get('chatHeight'));
        
        // Загружаем дополнительные настройки из localStorage
        const saved = localStorage.getItem('twitchChatSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Применяем только те настройки, которые не переопределены URL
                Object.keys(parsed).forEach(key => {
                    if (!urlParams.has(key)) {
                        this.settings[key] = parsed[key];
                    }
                });
                this.maxMessages = this.settings.maxMessages;
            } catch (error) {
                console.error('Ошибка при загрузке настроек:', error);
            }
        }
        
        
        this.applySettings();
    }
    
    applySettings() {
        // Отладочная информация
        console.log('applySettings called with settings:', {
            backgroundGradient: this.settings.backgroundGradient,
            gradientColor1: this.settings.gradientColor1,
            gradientColor2: this.settings.gradientColor2,
            gradientDirection: this.settings.gradientDirection,
            hideBackground: this.settings.hideBackground
        });
        
        // Рамка
        if (this.settings.hideBorder) {
            this.chatContainer.classList.add('no-border');
        } else {
            this.chatContainer.classList.remove('no-border');
            this.chatContainer.style.borderWidth = this.settings.borderWidth + 'px';
            this.chatContainer.style.borderColor = this.settings.borderColor;
        }
        
        this.chatContainer.style.borderRadius = this.settings.borderRadius + 'px';
        
        // Применяем свечение
        console.log('Glow settings:', {
            enableGlow: this.settings.enableGlow,
            glowColor: this.settings.glowColor,
            glowIntensity: this.settings.glowIntensity
        });
        if (this.settings.enableGlow) {
            const glowColor = this.settings.glowColor;
            const intensity = this.settings.glowIntensity;
            this.chatContainer.style.boxShadow = `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}`;
        } else {
            this.chatContainer.style.boxShadow = '';
        }
        
        // Фон
        console.log('chatContainer element:', this.chatContainer);
        if (this.settings.hideBackground) {
            this.chatContainer.classList.add('no-background');
        } else {
            this.chatContainer.classList.remove('no-background');
            
            if (this.settings.backgroundImage) {
                // Применяем фоновое изображение с прозрачностью
                const opacity = this.settings.backgroundOpacity / 100;
                
                // Создаем псевдоэлемент для прозрачности фонового изображения
                this.chatContainer.style.position = 'relative';
                this.chatContainer.style.backdropFilter = 'blur(10px)';
                
                // Если есть градиент, комбинируем его с фоновым изображением
                if (this.settings.backgroundGradient !== 'none') {
                    const gradient = this.createGradient(
                        this.settings.backgroundGradient,
                        this.settings.gradientColor1,
                        this.settings.gradientColor2,
                        this.settings.gradientDirection
                    );
                    this.chatContainer.style.background = `${gradient}, url(${this.settings.backgroundImage})`;
                } else {
                    this.chatContainer.style.background = 'rgba(255, 255, 255, 0.05)';
                    this.chatContainer.style.backgroundImage = `url(${this.settings.backgroundImage})`;
                }
                
                this.chatContainer.style.backgroundSize = this.settings.backgroundSize;
                this.chatContainer.style.backgroundPosition = this.settings.backgroundPosition;
                this.chatContainer.style.backgroundRepeat = 'no-repeat';
                
                // Удаляем старый псевдоэлемент если есть
                const oldOverlay = this.chatContainer.querySelector('.background-overlay');
                if (oldOverlay) {
                    oldOverlay.remove();
                }
                
                // Создаем новый псевдоэлемент для прозрачности
                const overlay = document.createElement('div');
                overlay.className = 'background-overlay';
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: url(${this.settings.backgroundImage});
                    background-size: ${this.settings.backgroundSize};
                    background-position: ${this.settings.backgroundPosition};
                    background-repeat: no-repeat;
                    opacity: ${opacity};
                    pointer-events: none;
                    z-index: -1;
                `;
                this.chatContainer.appendChild(overlay);
            } else {
                // Фон без изображения - применяем цвет или градиент
                this.chatContainer.style.backgroundImage = '';
                
                // Удаляем псевдоэлемент если есть
                const oldOverlay = this.chatContainer.querySelector('.background-overlay');
                if (oldOverlay) {
                    oldOverlay.remove();
                }
                
                // Применяем цвет или градиент
                if (this.settings.backgroundGradient !== 'none') {
                    const gradient = this.createGradient(
                        this.settings.backgroundGradient,
                        this.settings.gradientColor1,
                        this.settings.gradientColor2,
                        this.settings.gradientDirection
                    );
                    
                    // Отладочная информация
                    console.log('Applying background gradient:', {
                        type: this.settings.backgroundGradient,
                        color1: this.settings.gradientColor1,
                        color2: this.settings.gradientColor2,
                        direction: this.settings.gradientDirection,
                        gradient: gradient
                    });
                    
                    // Применяем градиент несколькими способами для лучшей совместимости
                    this.chatContainer.style.background = gradient;
                    this.chatContainer.style.backgroundImage = gradient;
                    
                    // Устанавливаем CSS переменные для fallback
                    this.chatContainer.style.setProperty('--gradient-color-1', this.settings.gradientColor1);
                    this.chatContainer.style.setProperty('--gradient-color-2', this.settings.gradientColor2);
                    this.chatContainer.style.setProperty('--gradient-direction', this.settings.gradientDirection);
                    this.chatContainer.style.setProperty('--gradient-image', gradient);
                    
                    // Дополнительный fallback для OBS
                    this.chatContainer.style.setProperty('--fallback-bg', this.settings.gradientColor1);
                    
                    // Отладочная информация после применения
                    console.log('Gradient applied to chatContainer:', {
                        background: this.chatContainer.style.background,
                        backgroundImage: this.chatContainer.style.backgroundImage,
                        computedStyle: window.getComputedStyle(this.chatContainer).background
                    });
                } else {
                    this.chatContainer.style.background = this.settings.backgroundColor;
                    this.chatContainer.style.backgroundImage = '';
                    this.chatContainer.style.setProperty('--fallback-bg', this.settings.backgroundColor);
                }
                
                this.chatContainer.style.backdropFilter = 'blur(10px)';
            }
        }
        
        // Размеры
        this.chatContainer.style.width = this.settings.chatWidth + 'px';
        this.chatContainer.style.height = this.settings.chatHeight + 'px';
        
        // Применяем настройки центрирования
        // Применяем настройки выравнивания
        this.chatMessagesElement.className = this.chatMessagesElement.className.replace(/align-\w+/g, '');
        this.chatMessagesElement.classList.add(`align-${this.settings.messageAlignment}`);
        
        // Применяем режим рамки к контейнеру
        this.chatMessagesElement.classList.remove('border-full-width', 'border-fit-content');
        this.chatMessagesElement.classList.add(`border-${this.settings.borderMode}`);
        
        // Применяем выравнивание рамки к контейнеру
        this.chatMessagesElement.className = this.chatMessagesElement.className.replace(/border-align-\w+/g, '');
        this.chatMessagesElement.classList.add(`border-align-${this.settings.borderAlignment}`);
        
        // Применяем направление чата
        this.chatMessagesElement.className = this.chatMessagesElement.className.replace(/direction-\w+-\w+/g, '');
        this.chatMessagesElement.classList.add(`direction-${this.settings.chatDirection}`);
        
        // Обновляем все существующие сообщения
        this.updateExistingMessages();
        
        
        // Применяем настройки шрифтов
        console.log('Font settings:', {
            fontFamily: this.settings.fontFamily,
            fontSize: this.settings.fontSize,
            fontWeight: this.settings.fontWeight,
            lineHeight: this.settings.lineHeight,
            letterSpacing: this.settings.letterSpacing,
            fontColor: this.settings.fontColor
        });
        this.chatMessagesElement.style.fontFamily = this.settings.fontFamily;
        this.chatMessagesElement.style.fontSize = this.settings.fontSize + 'px';
        this.chatMessagesElement.style.fontWeight = this.settings.fontWeight;
        this.chatMessagesElement.style.lineHeight = this.settings.lineHeight;
        this.chatMessagesElement.style.letterSpacing = this.settings.letterSpacing + 'px';
        this.chatMessagesElement.style.color = this.settings.fontColor;
        
        // Применяем настройки значков
        
        // Принудительное применение градиента в конце (на случай переопределения)
        if (this.settings.backgroundGradient !== 'none' && !this.settings.hideBackground) {
            const gradient = this.createGradient(
                this.settings.backgroundGradient,
                this.settings.gradientColor1,
                this.settings.gradientColor2,
                this.settings.gradientDirection
            );
            
            // Принудительно применяем градиент
            this.chatContainer.style.setProperty('background', gradient, 'important');
            this.chatContainer.style.setProperty('background-image', gradient, 'important');
            
            console.log('Force applied gradient at end of applySettings:', gradient);
        }
    }
    
    setupMessageListener() {
        // Слушаем сообщения от редактора
        window.addEventListener('message', (event) => {
            if (event.data.type === 'UPDATE_SETTINGS') {
                this.settings = { ...this.settings, ...event.data.settings };
                this.maxMessages = this.settings.maxMessages;
                this.applySettings();
            } else if (event.data.type === 'RECONNECT_CHAT') {
                this.reconnectToChat();
            }
        });
        
        // Уведомляем редактор о загрузке
        if (window.parent !== window) {
            window.parent.postMessage({ type: 'SETTINGS_LOADED' }, '*');
        }
    }
    
    reconnectToChat() {
        this.disconnect();
        setTimeout(() => {
            this.connectToChat();
        }, 1000);
    }
    
    loadChannelFromURL() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const channel = urlParams.get('channel');
            
            if (channel) {
                this.channel = channel.trim();
                this.channelNameElement.textContent = `Канал: ${this.channel}`;
                this.connectToChat();
                
                // Проверяем подключение через 3 секунды
                setTimeout(() => {
                    if (!this.isConnected) {
                        // Уведомления о подключении убраны
                    }
                }, 3000);
            } else {
                // Если канал не указан в URL, пробуем загрузить из localStorage
                const savedChannel = localStorage.getItem('twitchChatChannel');
                if (savedChannel) {
                    this.channel = savedChannel;
                    this.channelNameElement.textContent = `Канал: ${this.channel}`;
                    this.connectToChat();
                    
                    // Проверяем подключение через 3 секунды
                    setTimeout(() => {
                        if (!this.isConnected) {
                            // Уведомления о подключении убраны
                        }
                    }, 3000);
                } else {
                    this.showChannelSetup();
                }
            }
        } catch (error) {
            this.showError('Ошибка при загрузке канала: ' + error.message);
        }
    }
    
    showChannelSetup() {
        const messagesContainer = this.chatMessagesElement;
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = `
            <div class="channel-setup">
                <div class="setup-message">
                    <h3>🎮 Настройка чата</h3>
                    <p>Для отображения чата необходимо указать канал Twitch.</p>
                    <div class="setup-buttons">
                        <button onclick="window.open('index.html', '_blank')" class="setup-btn primary">
                            ⚙️ Открыть редактор
                        </button>
                        <button onclick="location.reload()" class="setup-btn secondary">
                            🔄 Обновить страницу
                        </button>
                    </div>
                    <div class="setup-info">
                        <p><strong>Инструкция:</strong></p>
                        <ol>
                            <li>Нажмите "Открыть редактор"</li>
                            <li>Укажите название канала в настройках</li>
                            <li>Скопируйте ссылку для OBS</li>
                            <li>Используйте ссылку в OBS или обновите эту страницу</li>
                        </ol>
                    </div>
                </div>
            </div>
        `;
    }
    
    async connectToChat() {
        if (!this.channel) {
            this.showError('Название канала не указано');
            return;
        }
        
        // Загружаем все данные для канала (как в jChat v2)
        try {
            // Получаем ID канала
            this.getChannelId().then(channelId => {
                this.channelId = channelId;
                
                // Загружаем эмодзи
                this.loadEmotes(channelId);
                
                // Загружаем бейджи
                this.loadBadges(channelId);
                
                // Загружаем cheers/bits
                this.loadCheers(channelId);
                
                // Загружаем дополнительные бейджи
                this.loadAdditionalBadges();
                
                // Принудительно загружаем глобальные бейджи
                console.log('🚀 Принудительно загружаем глобальные бейджи...');
                this.loadTwitchGlobalBadges();
                
                console.log('All data loaded for channel:', this.channel);
            });
        } catch (error) {
            console.error('Failed to load channel data:', error);
        }
        
        // Тестируем API глобальных бейджей
        this.testGlobalBadgesAPI();
        
        // Принудительно создаем тестовое сообщение через 5 секунд
        setTimeout(() => {
            console.log('⏰ Принудительно создаем тестовое сообщение с глобальными бейджами...');
            this.createTestMessageWithGlobalBadges();
            
            // Создаем тестовое сообщение с twitch-recap-2024
            setTimeout(() => {
                const testMessage = {
                    username: 'TestRecap2024',
                    displayName: 'TestRecap2024',
                    message: 'Тестовое сообщение с бейджем twitch-recap-2024!',
                    badges: 'twitch-recap-2024/1',
                    color: '#FF6B35',
                    timestamp: new Date().toISOString()
                };
                this.addMessage(testMessage);
                console.log('✅ Тестовое сообщение с twitch-recap-2024 добавлено');
            }, 1000);
        }, 5000);
        
        // Проверяем состояние кэша через 3 секунды
        setTimeout(() => {
            console.log('🔍 Проверяем состояние кэша бейджей...');
            this.checkBadgeCache();
        }, 3000);
        
        // Сначала пробуем подключиться через IRC
        this.connectViaIRC();
        
        // Если IRC не работает, пробуем альтернативный способ
        setTimeout(() => {
            if (!this.isConnected) {
                this.connectViaAPI();
            }
        }, 2000); // Уменьшили время ожидания до 2 секунд
        
        // Проверяем подключение через 4 секунды, если ничего не сработало
        setTimeout(() => {
            if (!this.isConnected) {
                // Уведомления о подключении убраны
            }
        }, 4000);
    }
    
    connectViaIRC() {
        try {
            // Подключаемся к Twitch IRC
            this.socket = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
            
            this.socket.onopen = () => {
                console.log('jChat: Connecting to IRC server...');
                // Анонимное подключение как в jChat v2
                this.socket.send('PASS blah\r\n');
                this.socket.send('NICK justinfan' + Math.floor(Math.random() * 99999) + '\r\n');
                this.socket.send('CAP REQ :twitch.tv/commands twitch.tv/tags\r\n');
                this.socket.send('JOIN #' + this.channel.toLowerCase() + '\r\n');
            };
            
            this.socket.onmessage = (event) => {
                console.log('IRC message received:', event.data);
                event.data.split('\r\n').forEach(line => {
                    if (!line) return;
                    console.log('Processing IRC line:', line);
                    this.parseChatMessage(line);
                });
            };
            
            this.socket.onclose = () => {
                this.isConnected = false;
                console.log('IRC соединение закрыто');
            };
            
            this.socket.onerror = (error) => {
                console.log('IRC ошибка:', error);
                this.isConnected = false;
            };
            
        } catch (error) {
            console.log('Ошибка IRC подключения:', error);
            this.isConnected = false;
        }
    }
    
    // Загружаем эмодзи через правильные API
    loadEmotes(channelID) {
        this.emotes = {};
        
        // BTTV Global emotes
        fetch('https://api.betterttv.net/3/cached/emotes/global')
                .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (Array.isArray(res)) {
                    res.forEach(emote => {
                        this.emotes[emote.code] = {
                            id: emote.id,
                            image: 'https://cdn.betterttv.net/emote/' + emote.id + '/3x',
                            zeroWidth: ["5e76d338d6581c3724c0f0b2", "5e76d399d6581c3724c0f0b8", "567b5b520e984428652809b6", "5849c9a4f52be01a7ee5f79d", "567b5c080e984428652809ba", "567b5dc00e984428652809bd", "58487cc6f52be01a7ee5f205", "5849c9c8f52be01a7ee5f79e"].includes(emote.id)
                        };
                    });
                }
                })
            .catch(err => console.warn('BTTV global emotes error:', err.message));

        // BTTV Channel emotes - используем новый API endpoint
        fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelID}`)
                .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.channelEmotes && Array.isArray(res.channelEmotes)) {
                    res.channelEmotes.forEach(emote => {
                        this.emotes[emote.code] = {
                            id: emote.id,
                            image: 'https://cdn.betterttv.net/emote/' + emote.id + '/3x',
                            zeroWidth: ["5e76d338d6581c3724c0f0b2", "5e76d399d6581c3724c0f0b8", "567b5b520e984428652809b6", "5849c9a4f52be01a7ee5f79d", "567b5c080e984428652809ba", "567b5dc00e984428652809bd", "58487cc6f52be01a7ee5f205", "5849c9c8f52be01a7ee5f79e"].includes(emote.id)
                        };
                    });
                }
                if (res.sharedEmotes && Array.isArray(res.sharedEmotes)) {
                    res.sharedEmotes.forEach(emote => {
                        this.emotes[emote.code] = {
                            id: emote.id,
                            image: 'https://cdn.betterttv.net/emote/' + emote.id + '/3x',
                            zeroWidth: ["5e76d338d6581c3724c0f0b2", "5e76d399d6581c3724c0f0b8", "567b5b520e984428652809b6", "5849c9a4f52be01a7ee5f79d", "567b5c080e984428652809ba", "567b5dc00e984428652809bd", "58487cc6f52be01a7ee5f205", "5849c9c8f52be01a7ee5f79e"].includes(emote.id)
                        };
                    });
                }
            })
            .catch(err => {
                console.warn('BTTV channel emotes error:', err.message);
                // Если канал не найден в BTTV, это нормально - не все каналы используют BTTV
            });

        // FFZ Global emotes
        fetch('https://api.betterttv.net/3/cached/frankerfacez/emotes/global')
                .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (Array.isArray(res)) {
                    res.forEach(emote => {
                        if (emote.images && emote.images['4x']) {
                            var imageUrl = emote.images['4x'];
                            var upscale = false;
                        } else if (emote.images) {
                            var imageUrl = emote.images['2x'] || emote.images['1x'];
                            var upscale = true;
                        } else {
                            return; // Пропускаем эмодзи без изображений
                        }
                        this.emotes[emote.code] = {
                            id: emote.id,
                            image: imageUrl,
                            upscale: upscale
                        };
                    });
                }
                })
            .catch(err => console.warn('FFZ global emotes error:', err.message));

        // FFZ Channel emotes - используем прямой API FrankerFaceZ
        fetch(`https://api.frankerfacez.com/v1/room/${channelID}`)
                .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                    }
                return res.json();
            })
            .then(res => {
                if (res.sets && res.sets[res.room.set]) {
                    const emotes = res.sets[res.room.set].emoticons;
                    if (Array.isArray(emotes)) {
                        emotes.forEach(emote => {
                            if (emote.urls && emote.urls['4']) {
                                var imageUrl = emote.urls['4'];
                                var upscale = false;
                            } else if (emote.urls) {
                                var imageUrl = emote.urls['2'] || emote.urls['1'];
                                var upscale = true;
                            } else {
                                return; // Пропускаем эмодзи без изображений
                            }
                            this.emotes[emote.name] = {
                                id: emote.id,
                                image: imageUrl,
                                upscale: upscale
                            };
                        });
                    }
                }
                })
            .catch(err => {
                console.warn('FFZ channel emotes error:', err.message);
                // Если канал не найден в FFZ, это нормально - не все каналы используют FFZ
            });

        // 7TV эмодзи - используем новый API v3
        // Глобальные эмодзи 7TV
        fetch('https://7tv.io/v3/emote-sets/global')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.emotes && Array.isArray(res.emotes)) {
                    res.emotes.forEach(emote => {
                        this.emotes[emote.name] = {
                            id: emote.id,
                            image: `https://cdn.7tv.app/emote/${emote.id}/4x.webp`,
                            animated: emote.animated
                        };
                    });
                }
            })
            .catch(err => {
                console.warn('7TV global emotes error:', err.message);
                // Fallback на старый API если новый не работает
                return fetch('https://api.7tv.app/v2/emotes/global')
                    .then(res => res.json())
                    .then(res => {
                        if (Array.isArray(res)) {
                            res.forEach(emote => {
                                if (emote.urls && emote.urls.length > 0) {
                                    this.emotes[emote.name] = {
                                        id: emote.id,
                                        image: emote.urls[emote.urls.length - 1][1],
                                        zeroWidth: emote.visibility_simple && emote.visibility_simple.includes("ZERO_WIDTH")
                                    };
                                }
                            });
                        }
                    })
                    .catch(err2 => console.warn('7TV fallback error:', err2.message));
            });

        // 7TV эмодзи канала
        fetch(`https://7tv.io/v3/users/twitch/${channelID}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.emote_set && res.emote_set.emotes && Array.isArray(res.emote_set.emotes)) {
                    res.emote_set.emotes.forEach(emote => {
                        this.emotes[emote.name] = {
                            id: emote.id,
                            image: `https://cdn.7tv.app/emote/${emote.id}/4x.webp`,
                            animated: emote.animated
                        };
                    });
                }
            })
            .catch(err => {
                console.warn('7TV channel emotes error:', err.message);
                // Fallback на старый API если новый не работает
                return fetch(`https://api.7tv.app/v2/users/${encodeURIComponent(channelID)}/emotes`)
                    .then(res => res.json())
                    .then(res => {
                        if (Array.isArray(res)) {
                            res.forEach(emote => {
                                if (emote.urls && emote.urls.length > 0) {
                                    this.emotes[emote.name] = {
                                        id: emote.id,
                                        image: emote.urls[emote.urls.length - 1][1],
                                        zeroWidth: emote.visibility_simple && emote.visibility_simple.includes("ZERO_WIDTH")
                                    };
                                }
                            });
                        }
                    })
                    .catch(err2 => console.warn('7TV channel fallback error:', err2.message));
            });
    }
    
    // Загружаем эмодзи из 7TV
    async load7TVEmotes() {
        try {
            // Загружаем глобальные эмодзи 7TV - используем правильные эндпоинты как в jChat
            const globalResponse = await fetch('https://api.7tv.app/v2/emotes/global');
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                this.sevenTVGlobalEmotes = globalData || [];
                console.log('7TV Global emotes loaded:', this.sevenTVGlobalEmotes.length);
            }
            
            // Загружаем эмодзи канала 7TV
            const channelResponse = await fetch(`https://api.7tv.app/v2/users/${this.channel}/emotes`);
            if (channelResponse.ok) {
                const channelData = await channelResponse.json();
                this.sevenTVChannelEmotes = channelData || [];
                console.log('7TV Channel emotes loaded:', this.sevenTVChannelEmotes.length);
            }
        } catch (error) {
            console.error('Failed to load 7TV emotes:', error);
            this.sevenTVGlobalEmotes = [];
            this.sevenTVChannelEmotes = [];
        }
    }
    
    // Загружаем эмодзи из BTTV
    async loadBTTVEmotes() {
        try {
            // Загружаем глобальные эмодзи BTTV
            const globalResponse = await fetch('https://api.betterttv.net/3/cached/emotes/global');
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                this.bttvGlobalEmotes = globalData || [];
                console.log('BTTV Global emotes loaded:', this.bttvGlobalEmotes.length);
            }
            
            // Загружаем эмодзи канала BTTV
            const channelResponse = await fetch(`https://api.betterttv.net/3/cached/users/twitch/${this.channel}`);
            if (channelResponse.ok) {
                const channelData = await channelResponse.json();
                this.bttvChannelEmotes = channelData.channelEmotes || [];
                this.bttvSharedEmotes = channelData.sharedEmotes || [];
                console.log('BTTV Channel emotes loaded:', this.bttvChannelEmotes.length);
                console.log('BTTV Shared emotes loaded:', this.bttvSharedEmotes.length);
            }
        } catch (error) {
            console.error('Failed to load BTTV emotes:', error);
        }
    }
    
    // Загружаем эмодзи из FFZ
    async loadFFZEmotes() {
        try {
            // Загружаем глобальные эмодзи FFZ
            const globalResponse = await fetch('https://api.frankerfacez.com/v1/set/global');
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                this.ffzGlobalEmotes = globalData.sets?.global?.emoticons || [];
                console.log('FFZ Global emotes loaded:', this.ffzGlobalEmotes.length);
            }
            
            // Загружаем эмодзи канала FFZ
            const channelResponse = await fetch(`https://api.frankerfacez.com/v1/room/${this.channel}`);
            if (channelResponse.ok) {
                const channelData = await channelResponse.json();
                this.ffzChannelEmotes = channelData.sets?.[Object.keys(channelData.sets)[0]]?.emoticons || [];
                console.log('FFZ Channel emotes loaded:', this.ffzChannelEmotes.length);
            }
        } catch (error) {
            console.error('Failed to load FFZ emotes:', error);
        }
    }
    
    async connectViaAPI() {
        try {
            // Twitch Helix API требует OAuth токен, поэтому пропускаем проверку
            this.isConnected = true;
            
        } catch (error) {
            console.log('API ошибка:', error);
            this.isConnected = true;
        }
    }
    
    startDemoMessages() {
        // Метод отключен - демо-сообщения только в редакторе
        return;
        // Добавляем демо-сообщения для тестирования с полными IRC тегами
        const demoMessages = [
            { 
                username: 'Viewer1', 
                text: 'Привет всем! Как дела? PogChamp', 
                userData: { 
                    color: '#ff6b6b', 
                    badges: 'subscriber/1',
                    'display-name': 'Viewer1',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'GamerPro', 
                text: 'Отличный стрим! Keep it up! Kappa', 
                userData: { 
                    color: '#4ecdc4', 
                    badges: 'moderator/1',
                    'display-name': 'GamerPro',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'ChatLover', 
                text: 'Когда следующий стрим? monkaS', 
                userData: { 
                    color: '#45b7d1', 
                    badges: 'vip/1',
                    'display-name': 'ChatLover',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'Fan123', 
                text: 'Спасибо за контент! 5Head', 
                userData: { 
                    color: '#96ceb4', 
                    badges: 'subscriber/1',
                    'display-name': 'Fan123',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'StreamerFan', 
                text: 'Можете показать настройки игры? OMEGALUL', 
                userData: { 
                    color: '#feca57', 
                    badges: '',
                    'display-name': 'StreamerFan',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'ModeratorBot', 
                text: 'Привет! Как настроение? PepeHands', 
                userData: { 
                    color: '#ff9ff3', 
                    badges: 'moderator/1',
                    'display-name': 'ModeratorBot',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'VIPUser', 
                text: 'Отличная игра! monkaW', 
                userData: { 
                    color: '#54a0ff', 
                    badges: 'vip/1,subscriber/1',
                    'display-name': 'VIPUser',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'NewViewer', 
                text: 'Первый раз здесь, очень круто! FeelsGoodMan', 
                userData: { 
                    color: '#5f27cd', 
                    badges: '',
                    'display-name': 'NewViewer',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'ChatMaster', 
                text: 'Какой крутой дизайн чата! POGGERS', 
                userData: { 
                    color: '#ff9f43', 
                    badges: 'subscriber/1',
                    'display-name': 'ChatMaster',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'StreamLover', 
                text: 'Сколько времени стримите? monkaS', 
                userData: { 
                    color: '#10ac84', 
                    badges: 'vip/1',
                    'display-name': 'StreamLover',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'GameFan', 
                text: 'Какая игра следующая? 5Head', 
                userData: { 
                    color: '#ee5a24', 
                    badges: '',
                    'display-name': 'GameFan',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'ModHelper', 
                text: 'Всем привет! Kappa', 
                userData: { 
                    color: '#0984e3', 
                    badges: 'moderator/1',
                    'display-name': 'ModHelper',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'Broadcaster', 
                text: 'Добро пожаловать на мой стрим! PogChamp', 
                userData: { 
                    color: '#9146ff', 
                    badges: 'broadcaster/1',
                    'display-name': 'Broadcaster',
                    emotes: null,
                    bits: '0'
                } 
            },
            { 
                username: 'CheerUser', 
                text: 'cheer100 Отличный стрим!', 
                userData: { 
                    color: '#9c3ee8', 
                    badges: 'subscriber/1',
                    'display-name': 'CheerUser',
                    emotes: null,
                    bits: '100'
                } 
            },
            { 
                username: 'BigCheer', 
                text: 'cheer1000 Спасибо за контент!', 
                userData: { 
                    color: '#1db2a5', 
                    badges: 'vip/1',
                    'display-name': 'BigCheer',
                    emotes: null,
                    bits: '1000'
                } 
            }
        ];
        
        // Добавляем сообщения с интервалом (быстрее)
        demoMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.addChatMessage(msg.username, msg.text, msg.userData);
            }, (index + 1) * 1000); // Каждую секунду
        });
        
        // Добавляем новые сообщения каждые 5 секунд (чаще)
        setInterval(() => {
            if (this.isConnected) {
                const randomMsg = demoMessages[Math.floor(Math.random() * demoMessages.length)];
                this.addChatMessage(randomMsg.username, randomMsg.text, randomMsg.userData);
            }
        }, 5000);
    }
    
    handleMessage(data) {
        const lines = data.split('\r\n');
        
        for (const line of lines) {
            if (line.includes('PRIVMSG')) {
                this.parseChatMessage(line);
            } else if (line.includes('001')) {
                // Успешное подключение
                this.isConnected = true;
                this.addSystemMessage(`Подключен к каналу ${this.channel}`);
            } else if (line.includes('PING')) {
                this.socket.send('PONG :tmi.twitch.tv');
            } else if (line.includes('NOTICE')) {
                // Обработка уведомлений от сервера
                if (line.includes('Login authentication failed')) {
                    this.showError('Ошибка аутентификации. Попробуйте другой канал.');
                } else if (line.includes('No such channel')) {
                    this.showError(`Канал ${this.channel} не найден или не существует.`);
                }
            } else if (line.includes('JOIN')) {
                // Успешное присоединение к каналу
                this.isConnected = true;
                this.showSuccess(`Подключен к каналу ${this.channel}`);
            } else if (line.includes('353')) {
                // Список пользователей в канале
                this.showInfo('Получен список пользователей канала');
            } else if (line.includes('366')) {
                // Конец списка пользователей
                this.showInfo('Список пользователей загружен');
            }
        }
    }
    
    parseChatMessage(line) {
        // Используем продвинутый парсер IRC из jChat v2
        const message = this.parseIRC(line);
        console.log('Parsed IRC message:', message);
        if (!message.command) return;

        switch (message.command) {
            case "PING":
                if (this.socket) {
                    this.socket.send('PONG ' + message.params[0]);
                }
                return;
            case "JOIN":
                console.log('jChat: Joined channel #' + this.channel);
                this.isConnected = true;
                return;
            case "CLEARMSG":
                if (message.tags) {
                    this.clearMessage(message.tags['target-msg-id']);
                }
                return;
            case "CLEARCHAT":
                if (message.params[1]) {
                    this.clearChat(message.params[1]);
                }
                return;
            case "PRIVMSG":
                console.log('PRIVMSG received:', message);
                if (message.params[0].toLowerCase() !== '#' + this.channel.toLowerCase() || !message.params[1]) {
                    console.log('PRIVMSG filtered out - wrong channel or no message');
                    return;
                }
                const nick = message.prefix.split('@')[0].split('!')[0];
                console.log('Processing message from:', nick, 'message:', message.params[1]);

                // Обработка команды обновления эмодзи
                if (message.params[1].toLowerCase() === "!refreshoverlay" && typeof(message.tags.badges) === 'string') {
                    let flag = false;
                    message.tags.badges.split(',').forEach(badge => {
                        badge = badge.split('/');
                        if (badge[0] === "moderator" || badge[0] === "broadcaster") {
                            flag = true;
                            return;
                        }
                    });
                    if (flag) {
                        this.loadEmotes(this.channelId);
                        console.log('jChat: Refreshing emotes...');
                        return;
                    }
                }

                // Скрытие команд
                if (this.settings.hideCommands) {
                    if (/^!.+/.test(message.params[1])) return;
                }

                // Скрытие ботов
                if (!this.settings.showBots) {
                    const bots = ['streamelements', 'streamlabs', 'nightbot', 'moobot', 'fossabot'];
                    if (bots.includes(nick)) return;
                }

                // Загрузка пользовательских бейджей
                if (!this.settings.hideBadges) {
                    if (!this.userBadges) this.userBadges = {};
                    if (!this.userBadges[nick]) {
                        this.loadUserBadges(nick, message.tags['user-id']);
                    }
                }

                this.addChatMessage(nick, message.params[1], message.tags);
                return;
        }
    }

    // Парсер IRC из jChat v2
    parseIRC(data) {
        const message = {
            raw: data,
            tags: {},
            prefix: null,
            command: null,
            params: []
        };

        let position = 0;
        let nextspace = 0;

        // Парсинг IRCv3.2 тегов
        if (data.charCodeAt(0) === 64) {
            nextspace = data.indexOf(' ');

            if (nextspace === -1) {
                return null;
            }

            const rawTags = data.slice(1, nextspace).split(';');

            for (let i = 0; i < rawTags.length; i++) {
                const tag = rawTags[i];
                const pair = tag.split('=');
                message.tags[pair[0]] = pair[1] || true;
            }

            position = nextspace + 1;
        }

        // Пропускаем пробелы
        while (data.charCodeAt(position) === 32) {
            position++;
        }

        // Извлекаем префикс
        if (data.charCodeAt(position) === 58) {
            nextspace = data.indexOf(' ', position);

            if (nextspace === -1) {
                return null;
            }

            message.prefix = data.slice(position + 1, nextspace);
            position = nextspace + 1;

            while (data.charCodeAt(position) === 32) {
                position++;
            }
        }

        nextspace = data.indexOf(' ', position);

        if (nextspace === -1) {
            if (data.length > position) {
                message.command = data.slice(position);
                return message;
            }
            return null;
        }

        message.command = data.slice(position, nextspace);
        position = nextspace + 1;

        while (data.charCodeAt(position) === 32) {
            position++;
        }

        while (position < data.length) {
            nextspace = data.indexOf(' ', position);

            if (data.charCodeAt(position) === 58) {
                message.params.push(data.slice(position + 1));
                break;
            }

            if (nextspace !== -1) {
                message.params.push(data.slice(position, nextspace));
                position = nextspace + 1;

                while (data.charCodeAt(position) === 32) {
                    position++;
                }
                continue;
            }

            if (nextspace === -1) {
                message.params.push(data.slice(position));
                break;
            }
        }
        return message;
    }
    
    parseUserTags(tags) {
        const userData = {};
        const tagPairs = tags.split(';');
        
        tagPairs.forEach(pair => {
            const [key, value] = pair.split('=');
            if (key && value !== undefined) {
                switch (key) {
                    case 'color':
                        // Цвет пользователя из IRC тегов
                        userData.color = value || this.getDefaultUserColor('default');
                        break;
                    case 'badges':
                        if (value) {
                            // Парсим значки в формате "broadcaster/1,moderator/1,subscriber/6"
                            userData.badges = value.split(',').map(badge => {
                                const [badgeType, badgeVersion] = badge.split('/');
                                return `${badgeType}/${badgeVersion || '1'}`;
                            });
                        } else {
                            userData.badges = [];
                        }
                        break;
                    case 'display-name':
                        userData.displayName = value;
                        break;
                    case 'mod':
                        userData.isMod = value === '1';
                        break;
                    case 'subscriber':
                        userData.isSubscriber = value === '1';
                        break;
                    case 'turbo':
                        userData.isTurbo = value === '1';
                        break;
                    case 'vip':
                        userData.isVip = value === '1';
                        break;
                    case 'broadcaster':
                        userData.isBroadcaster = value === '1';
                        break;
                    case 'user-type':
                        userData.userType = value;
                        break;
                    case 'room-id':
                        userData.roomId = value;
                        break;
                    case 'user-id':
                        userData.userId = value;
                        break;
                    case 'tmi-sent-ts':
                        userData.timestamp = value;
                        break;
                }
            }
        });
        
        return userData;
    }
    
    syncMessageCount() {
        const actualCount = this.chatMessagesElement.querySelectorAll('.message').length;
        this.messageCount = actualCount;
    }
    
    scrollChatToBottom() {
        if (this.chatMessagesElement) {
            // Используем requestAnimationFrame для более плавной прокрутки
            requestAnimationFrame(() => {
                this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
            });
        }
    }
    
    limitChatMessages() {
        if (!this.chatMessagesElement) return;
        
        const messages = this.chatMessagesElement.querySelectorAll('.message');
        const maxMessages = 10; // Максимальное количество видимых сообщений
        
        if (messages.length > maxMessages) {
            // Удаляем самые старые сообщения
            for (let i = 0; i < messages.length - maxMessages; i++) {
                messages[i].remove();
            }
            this.syncMessageCount();
        }
    }
    
    updateExistingMessages() {
        if (!this.chatMessagesElement) return;
        
        const messages = this.chatMessagesElement.querySelectorAll('.message');
        messages.forEach(message => {
            // Обновляем настройки шрифтов для каждого сообщения
            message.style.fontFamily = this.settings.fontFamily;
            message.style.fontSize = this.settings.fontSize + 'px';
            message.style.fontWeight = this.settings.fontWeight;
            message.style.lineHeight = this.settings.lineHeight;
            message.style.letterSpacing = this.settings.letterSpacing + 'px';
            message.style.color = this.settings.fontColor;
            
            // Обновляем выравнивание сообщения
            message.className = message.className.replace(/align-\w+/g, '');
            message.classList.add(`align-${this.settings.messageAlignment}`);
            
            // Обновляем режим рамки
            message.classList.remove('border-full-width', 'border-fit-content');
            if (this.settings.borderMode === 'full-width') {
                message.classList.add('border-full-width');
            } else {
                message.classList.add('border-fit-content');
            }
            
            // Обновляем фон сообщения
            this.applyMessageBackground(message);
        });
    }
    
    getAnimationName(animationType) {
        const animationMap = {
            'slide': 'slideIn',
            'slide-right': 'slideInRight',
            'slide-up': 'slideInUp',
            'slide-down': 'slideDown',
            'fade': 'fadeIn',
            'bounce': 'bounceIn',
            'scale': 'scaleIn',
            'rotate': 'rotate',
            'flip': 'flip',
            'zoom': 'zoom',
            'elastic': 'elastic',
            'back': 'back',
            // Анимации исчезновения
            'fade-out': 'fadeOut',
            'slide-out-left': 'slideOutLeft',
            'slide-out-right': 'slideOutRight',
            'slide-out-up': 'slideOutUp',
            'slide-out-down': 'slideOutDown',
            'scale-out': 'scaleOut',
            'rotate-out': 'rotateOut',
            'flip-out': 'flipOut',
            'zoom-out': 'zoomOut',
            'elastic-out': 'elasticOut',
            'back-out': 'backOut'
        };
        return animationMap[animationType] || 'slideIn';
    }
    
    getInitialTransform(animationType) {
        const transformMap = {
            'slide': 'translateX(-50px)',
            'slide-right': 'translateX(50px)',
            'slide-up': 'translateY(50px)',
            'slide-down': 'translateY(-100%)',
            'fade': 'translateX(0)',
            'bounce': 'scale(0.3)',
            'scale': 'scale(0.8)',
            'rotate': 'rotate(-180deg)',
            'flip': 'perspective(400px) rotateY(-90deg)',
            'zoom': 'scale(0.5)',
            'elastic': 'scale(0)',
            'back': 'translateX(-100px) scale(0.8)'
        };
        return transformMap[animationType] || 'translateX(-50px)';
    }
    
    // Метод fetchTwitchBadges удален - используем только SVG значки
    
    // Метод transformBadgeData удален - используем только SVG значки
    
    // Метод getChannelId удален - используем только SVG значки
    
    addChatMessage(username, text, userData = {}) {
        console.log('addChatMessage called:', username, text, userData);
        if (!this.chatMessagesElement) {
            console.error('chatMessagesElement is null!');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message';
        messageElement.setAttribute('data-nick', username);
        messageElement.setAttribute('data-time', Date.now());
        if (userData.id) {
            messageElement.setAttribute('data-id', userData.id);
        }
        
        // Применяем анимацию если выбрана
        if (this.settings.appearAnimation !== 'none') {
            const animationName = this.getAnimationName(this.settings.appearAnimation);
            const animationDuration = `${this.settings.appearDuration}ms`;
            const animationDelay = this.settings.appearDelay > 0 ? `${this.settings.appearDelay}ms` : '0ms';
            
            console.log('Applying animation:', this.settings.appearAnimation, '->', animationName);
            
            // Сбрасываем все стили анимации
            messageElement.style.animation = '';
            messageElement.style.animationName = '';
            messageElement.style.animationDuration = '';
            messageElement.style.animationDelay = '';
            messageElement.style.animationFillMode = '';
            messageElement.style.animationTimingFunction = '';
            
            // Устанавливаем начальное состояние для анимации
            messageElement.style.opacity = '0';
            messageElement.style.transform = this.getInitialTransform(this.settings.appearAnimation);
            
            // Применяем анимацию появления
            messageElement.style.animation = `${animationName} ${animationDuration} ease-out ${animationDelay} forwards`;
            
            // Fallback: если анимация не сработает, показываем элемент через некоторое время
            setTimeout(() => {
                if (messageElement.style.opacity === '0' || getComputedStyle(messageElement).opacity === '0') {
                    messageElement.style.opacity = '1';
                    messageElement.style.transform = 'translateX(0)';
                    messageElement.style.animation = '';
                }
            }, this.settings.appearDuration + this.settings.appearDelay + 100);
        } else {
            // Если анимация отключена или выбрана "Нет", просто показываем элемент
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateX(0)';
        }
        
        // Применяем настройки фона сообщения
        this.applyMessageBackground(messageElement);
        
        // Применяем выравнивание сообщений
        messageElement.classList.add(`align-${this.settings.messageAlignment}`);
        
        // Применяем режим рамки
        if (this.settings.borderMode === 'full-width') {
            messageElement.classList.add('border-full-width');
        } else {
            messageElement.classList.add('border-fit-content');
        }
        
        // Применяем выравнивание рамки
        messageElement.classList.add(`border-align-${this.settings.borderAlignment}`);
        
        // Применяем настройки шрифтов к сообщению
        messageElement.style.fontFamily = this.settings.fontFamily;
        messageElement.style.fontSize = this.settings.fontSize + 'px';
        messageElement.style.fontWeight = this.settings.fontWeight;
        messageElement.style.lineHeight = this.settings.lineHeight;
        messageElement.style.letterSpacing = this.settings.letterSpacing + 'px';
        messageElement.style.color = this.settings.fontColor;
        
        // Определяем цвет пользователя
        const userColor = userData.color || this.getDefaultUserColor(username);
        
        // Создаем бейджики
        const badges = this.createUserBadges(userData, username);
        
        // Используем display-name если есть, иначе username
        const displayName = userData['display-name'] || username;
        
        // Обрабатываем эмодзи в тексте сообщения
        const processedText = this.processEmotes(text, userData);
        
        // Обработка ACTION сообщений (/me)
        let messageHtml = '';
        if (/^\x01ACTION.*\x01$/.test(text)) {
            const actionText = text.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
            const processedActionText = this.processEmotes(actionText, userData);
            messageHtml = `<span class="username" style="color: ${userColor}">${badges}${this.escapeHtml(displayName)}</span><span class="text" style="color: ${userColor}">${processedActionText}</span>`;
        } else {
            messageHtml = `<span class="username" style="color: ${userColor}">${badges}${this.escapeHtml(displayName)}:</span> <span class="text">${processedText}</span>`;
        }
        
        messageElement.innerHTML = messageHtml;
        
        this.chatMessagesElement.appendChild(messageElement);
        this.messageCount++;
    
        
        // Синхронизируем счетчик с реальным количеством сообщений
        this.syncMessageCount();
        
        // Ограничиваем количество видимых сообщений в чате
        this.limitChatMessages();
        
        // Если включено исчезновение сообщений, удаляем их через некоторое время
        if (this.settings.fadeMessages) {
            const totalDisplayTime = this.settings.messageDisplayTime * 1000;
            setTimeout(() => {
                if (this.settings.disappearAnimation !== 'none') {
                    // Применяем анимацию исчезновения с правильной длительностью
                    const animationName = this.getAnimationName(this.settings.disappearAnimation);
                    // Сбрасываем все предыдущие анимации и стили
                    messageElement.style.animation = '';
                    messageElement.style.animationName = '';
                    messageElement.style.animationDuration = '';
                    messageElement.style.animationDelay = '';
                    messageElement.style.animationFillMode = '';
                    messageElement.style.animationTimingFunction = '';
                    // Убираем классы анимаций появления
                    messageElement.classList.remove('no-animation');
                    // Применяем новую анимацию исчезновения
                    messageElement.style.animation = `${animationName} ${this.settings.disappearDuration}ms ease-in forwards`;
                    setTimeout(() => {
                        if (messageElement.parentNode) {
                            messageElement.parentNode.removeChild(messageElement);
                            this.syncMessageCount(); // Синхронизируем после удаления
                        }
                    }, this.settings.disappearDuration);
                } else {
                    // Если анимация исчезновения отключена, просто удаляем элемент
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                        this.syncMessageCount(); // Синхронизируем после удаления
                    }
                }
            }, totalDisplayTime);
        }
        
        // Удаляем старые сообщения если их слишком много
        this.syncMessageCount(); // Синхронизируем счетчик перед проверкой
        if (this.messageCount > this.maxMessages) {
            const firstMessage = this.chatMessagesElement.querySelector('.message');
            if (firstMessage) {
                if (this.settings.fadeMessages && this.settings.disappearAnimation !== 'none') {
                    // Добавляем анимацию исчезновения с правильной длительностью
                    const animationName = this.getAnimationName(this.settings.disappearAnimation);
                    // Сбрасываем все предыдущие анимации и стили
                    firstMessage.style.animation = '';
                    firstMessage.style.animationName = '';
                    firstMessage.style.animationDuration = '';
                    firstMessage.style.animationDelay = '';
                    firstMessage.style.animationFillMode = '';
                    firstMessage.style.animationTimingFunction = '';
                    // Убираем классы анимаций появления
                    firstMessage.classList.remove('no-animation');
                    // Применяем новую анимацию исчезновения
                    firstMessage.style.animation = `${animationName} ${this.settings.disappearDuration}ms ease-in forwards`;
                    // Удаляем после анимации
                    setTimeout(() => {
                        if (firstMessage.parentNode) {
                            firstMessage.remove();
                            this.syncMessageCount(); // Синхронизируем после удаления
                        }
                    }, this.settings.disappearDuration);
                } else {
                    // Обычное удаление без анимации
                    firstMessage.remove();
                    this.syncMessageCount(); // Синхронизируем после удаления
                }
            }
        }
        
        // Прокручиваем вниз
        this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
    }
    
    getDefaultUserColor(username) {
        // Генерируем цвет на основе имени пользователя
        const colors = [
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
            '#FFA500', '#800080', '#FFC0CB', '#A52A2A', '#808080', '#000000'
        ];
        
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    createUserBadges(userData, username) {
        let badges = '';
        
        // Проверяем, нужно ли показывать значки пользователей
        if (!this.settings.showUserBadges) {
            return badges;
        }
        
        const badgeElements = [];
        
        // Обработка Twitch бейджей из IRC тегов
        if (typeof(userData.badges) === 'string') {
            console.log('🏷️ Обрабатываем бейджи пользователя:', userData.badges);
            
            // Определяем порядок отображения бейджей
            const channelRoleBadges = ['broadcaster', 'moderator', 'vip', 'subscriber'];
            
            const channelBadges = [];
            const globalBadgesList = [];
            const otherBadges = [];
            
            userData.badges.split(',').forEach(badge => {
                const [badgeType, badgeVersion] = badge.split('/');
                console.log('🏷️ Обрабатываем бейдж:', badgeType, badgeVersion);
                
                // Автоматически загружаем бейдж, если его нет в кэше
                if (!channelRoleBadges.includes(badgeType)) {
                    this.loadBadgeOnDemand(badgeType, badgeVersion);
                }
                
                const badgeUrl = this.getBadgeUrl(badgeType, badgeVersion);
                
                if (badgeUrl) {
                    const badgeObj = {
                        type: 'twitch',
                        description: badgeType,
                        url: badgeUrl,
                        badgeType: badgeType
                    };
                    
                    if (channelRoleBadges.includes(badgeType)) {
                        channelBadges.push(badgeObj);
                        console.log('🏠 Добавлен канальный бейдж:', badgeType);
                    } else {
                        // Все остальные бейджи (глобальные, пользовательские, специальные) идут в глобальные
                        globalBadgesList.push(badgeObj);
                        console.log('🌐 Добавлен глобальный/пользовательский бейдж:', badgeType);
                    }
                } else {
                    console.log('❌ Не найден URL для бейджа:', badgeType);
                    // Создаем fallback бейдж для немедленного отображения
                    this.addFallbackBadge(badgeType, badgeVersion);
                }
            });
            
            console.log('📊 Итого бейджей - канальные:', channelBadges.length, 'глобальные/пользовательские:', globalBadgesList.length);
            
            // Добавляем бейджи в правильном порядке: сначала роли канала, потом все остальные
            channelBadges.forEach(badge => {
                badgeElements.push(`<img class="badge" src="${badge.url}" alt="${badge.description}" title="${badge.description}" />`);
            });
            
            globalBadgesList.forEach(badge => {
                badgeElements.push(`<img class="badge" src="${badge.url}" alt="${badge.description}" title="${badge.description}" />`);
            });
        }
        
        // Добавляем пользовательские бейджи (FFZ, BTTV, 7TV, Chatterino)
        if (this.userBadges && this.userBadges[username]) {
            this.userBadges[username].forEach(badge => {
                let badgeHtml = `<img class="badge" src="${badge.url}" alt="${badge.description}" title="${badge.description}"`;
                if (badge.color) {
                    badgeHtml += ` style="background-color: ${badge.color};"`;
                }
                badgeHtml += ' />';
                badgeElements.push(badgeHtml);
            });
        }
        
        // Добавляем остальные Twitch бейджи (которые не были обработаны выше)
        if (typeof(userData.badges) === 'string') {
            const processedBadges = ['broadcaster', 'moderator', 'vip', 'subscriber', 'admin', 'global_mod', 'staff', 'twitchbot', 'predictions'];
            userData.badges.split(',').forEach(badge => {
                const [badgeType, badgeVersion] = badge.split('/');
                if (!processedBadges.includes(badgeType)) {
                    console.log('🔍 Обрабатываем дополнительный бейдж:', badgeType, badgeVersion);
                    
                    // Автоматически загружаем бейдж, если его нет в кэше
                    this.loadBadgeOnDemand(badgeType, badgeVersion);
                    
                    const badgeUrl = this.getBadgeUrl(badgeType, badgeVersion);
                    if (badgeUrl) {
                        badgeElements.push(`<img class="badge" src="${badgeUrl}" alt="${badgeType}" title="${badgeType}" />`);
                        console.log('✅ Добавлен дополнительный бейдж:', badgeType);
                    } else {
                        console.log('❌ Не найден URL для дополнительного бейджа:', badgeType);
                        // Создаем fallback бейдж для немедленного отображения
                        this.addFallbackBadge(badgeType, badgeVersion);
                    }
                }
            });
        }
        
        return badgeElements.join('');
    }
    
    getBadgeUrl(badgeType, badgeVersion) {
        console.log('🔍 Ищем значок:', badgeType, badgeVersion);
        
        // Определяем, глобальный это бейдж или канальный
        const channelRoleBadges = ['broadcaster', 'moderator', 'vip', 'subscriber'];
        const isChannelBadge = channelRoleBadges.includes(badgeType);
        
        // Ищем в правильном кэше
        let badges = null;
        if (isChannelBadge) {
            // Канальные бейджи ищем в кэше канала
            const channelId = this.channelId || 'global';
            badges = this.badgeCache.get(channelId);
            console.log('🏠 Ищем канальный бейдж в кэше:', channelId);
        } else {
            // ВСЕ остальные бейджи (включая глобальные) ищем в кэше 'global'
            badges = this.badgeCache.get('global');
            console.log('🌐 Ищем глобальный/пользовательский бейдж в кэше global');
        }
        
        if (badges) {
            // Ищем бейдж в глобальных или канальных бейджах
            let badgeSet = badges.global[badgeType] || badges.channel[badgeType];
            
            console.log('🔍 Ищем бейдж в кэше:', {
                badgeType: badgeType,
                badgeVersion: badgeVersion,
                hasGlobal: !!badges.global[badgeType],
                hasChannel: !!badges.channel[badgeType],
                globalKeys: Object.keys(badges.global || {}),
                channelKeys: Object.keys(badges.channel || {})
            });
            
            if (badgeSet && badgeSet.versions) {
                const version = badgeSet.versions[badgeVersion] || badgeSet.versions['1'];
                const url = version?.image_url_1x || version?.image_url_2x || version?.image_url_4x;
                if (url) {
                    console.log('✅ Найден значок в кэше:', url);
                    return url;
                } else {
                    console.log('❌ Версия бейджа не найдена:', badgeVersion, 'Доступные версии:', Object.keys(badgeSet.versions));
                }
            } else {
                console.log('❌ Бейдж не найден в кэше:', badgeType);
            }
        } else {
            console.log('❌ Кэш не найден');
        }
        
        // Если бейдж не найден, загружаем его по требованию
        if (!isChannelBadge) {
            console.log('🔄 Бейдж не найден, загружаем по требованию:', badgeType);
            this.loadBadgeOnDemand(badgeType, badgeVersion);
        }
        
        // Fallback на простые и надежные URL значков (включая глобальные)
        const knownBadgeUrls = {
            // Роли канала
            'broadcaster': 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
            'moderator': 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            'vip': 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
            'subscriber': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
            // Глобальные роли
            'admin': 'https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/1',
            'global_mod': 'https://static-cdn.jtvnw.net/badges/v1/9388c43e-4ce7-4e94-b2a1-b936d6e4824a/1',
            'staff': 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8d57-2856b5b7a1c2/1',
            'twitchbot': 'https://static-cdn.jtvnw.net/badges/v1/df09a657-6074-41a7-a59c-70c930a2c002/1',
            'predictions': 'https://static-cdn.jtvnw.net/badges/v1/bf7dacf3-8251-468e-81b1-eb7e8b5c4b6a/1',
            // Специальные бейджи 2024
            'twitch-recap-2024': 'https://static-cdn.jtvnw.net/badges/v1/bf7dacf3-8251-468e-81b1-eb7e8b5c4b6a/1',
            'silksong-2024': 'https://static-cdn.jtvnw.net/badges/v1/silksong-2024/1',
            'minecraft-2024': 'https://static-cdn.jtvnw.net/badges/v1/minecraft-2024/1',
            'game-awards-2024': 'https://static-cdn.jtvnw.net/badges/v1/game-awards-2024/1'
        };
        
        const fallbackUrl = knownBadgeUrls[badgeType];
        if (fallbackUrl) {
            console.log('Используем fallback URL для:', badgeType, fallbackUrl);
            return fallbackUrl;
        }
        
        console.log('Значок не найден:', badgeType, badgeVersion);
        return null;
    }
    
    // Загружаем пользовательские бейджи (FFZ, BTTV, 7TV, Chatterino)
    loadUserBadges(nick, userId) {
        if (!this.userBadges) this.userBadges = {};
        this.userBadges[nick] = [];
        
        // FFZ бейджи
        fetch('https://api.frankerfacez.com/v1/user/' + nick)
            .then(res => res.json())
            .then(res => {
                if (res.badges) {
                    Object.entries(res.badges).forEach(badge => {
                        const userBadge = {
                            description: badge[1].title,
                            url: 'https:' + badge[1].urls['4'],
                            color: badge[1].color
                        };
                        if (!this.userBadges[nick].includes(userBadge)) {
                            this.userBadges[nick].push(userBadge);
                        }
                    });
                }
            })
            .catch(err => console.error('FFZ badges error:', err));
        
        // FFZ:AP бейджи
        if (this.ffzapBadges) {
            this.ffzapBadges.forEach(user => {
                if (user.id.toString() === userId) {
                    let color = '#755000';
                    if (user.tier == 2) color = (user.badge_color || '#755000');
                    else if (user.tier == 3) {
                        if (user.badge_is_colored == 0) color = (user.badge_color || '#755000');
                        else color = false;
                    }
                    const userBadge = {
                        description: 'FFZ:AP Badge',
                        url: 'https://api.ffzap.com/v1/user/badge/' + userId + '/3',
                        color: color
                    };
                    if (!this.userBadges[nick].includes(userBadge)) {
                        this.userBadges[nick].push(userBadge);
                    }
                }
            });
        }
        
        // BTTV бейджи
        if (this.bttvBadges) {
            this.bttvBadges.forEach(user => {
                if (user.name === nick) {
                    const userBadge = {
                        description: user.badge.description,
                        url: user.badge.svg
                    };
                    if (!this.userBadges[nick].includes(userBadge)) {
                        this.userBadges[nick].push(userBadge);
                    }
                }
            });
        }
        
        // 7TV бейджи
        if (this.seventvBadges) {
            this.seventvBadges.forEach(badge => {
                badge.users.forEach(user => {
                    if (user === nick) {
                        const userBadge = {
                            description: badge.tooltip,
                            url: badge.urls[2][1]
                        };
                        if (!this.userBadges[nick].includes(userBadge)) {
                            this.userBadges[nick].push(userBadge);
                        }
                    }
                });
            });
        }
        
        // Chatterino бейджи
        if (this.chatterinoBadges) {
            this.chatterinoBadges.forEach(badge => {
                badge.users.forEach(user => {
                    if (user === userId) {
                        const userBadge = {
                            description: badge.tooltip,
                            url: badge.image3 || badge.image2 || badge.image1
                        };
                        if (!this.userBadges[nick].includes(userBadge)) {
                            this.userBadges[nick].push(userBadge);
                        }
                    }
                });
            });
        }
    }
    
        // Загружаем cheers/bits - используем API как в jChat
    loadCheers(channelId) {
        this.cheers = {};
        
        // Twitch API v5 больше не поддерживает CORS для браузеров
        // Используем fallback данные сразу
        console.log('Using fallback cheers for channel:', this.channel);
        this.cheers = {
                    'cheer': {
                        1: {
                            image: 'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/1/4.gif',
                            color: '#979797'
                        },
                        100: {
                            image: 'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/100/4.gif',
                            color: '#9c3ee8'
                        },
                        1000: {
                            image: 'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/1000/4.gif',
                            color: '#1db2a5'
                        },
                        5000: {
                            image: 'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/5000/4.gif',
                            color: '#0099fe'
                        },
                        10000: {
                            image: 'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/10000/4.gif',
                            color: '#f43021'
                        },
                        100000: {
                            image: 'https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/100000/4.gif',
                            color: '#ffd700'
                        }
                    }
                };
                console.log('Using fallback cheers for channel:', this.channel);
    }
    
    getBadgeTitle(badgeType, badgeVersion) {
        const titles = {
            'broadcaster': 'Стример',
            'moderator': 'Модератор',
            'vip': 'VIP',
            'subscriber': `Подписчик (${badgeVersion} мес.)`,
            'turbo': 'Turbo',
            'premium': 'Prime',
            'prime': 'Prime',
            'bits': `Bits (${badgeVersion})`,
            'sub-gift-leader': 'Лидер подарков',
            'sub-gifter': 'Даритель подписок'
        };
        
        return titles[badgeType] || badgeType;
    }
    
    getFallbackBadge(badgeType) {
        // Используем настоящие значки Twitch (только нужные)
        const badgeUrls = {
            'broadcaster': 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
            'moderator': 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            'vip': 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
            'subscriber': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1'
        };
        
        const badgeTitles = {
            'broadcaster': 'Стример',
            'moderator': 'Модератор',
            'vip': 'VIP',
            'subscriber': 'Подписчик'
        };
        
        const badgeUrl = badgeUrls[badgeType];
        if (badgeUrl) {
            return `<img src="${badgeUrl}" class="badge ${badgeType}" alt="${badgeType}" title="${badgeTitles[badgeType]}" style="width: 1em; height: 1em;" />`;
        }
        
        return ''; // Если значка нет - ничего не показываем
    }
    
    // Обрабатываем эмодзи по образцу jChat v2
    processEmotes(text, userData = {}) {
        if (!text) return text;
        
        let message = text;
        let replacements = {};
        
        // Обработка Twitch эмодзи из IRC тегов
        if (typeof(userData.emotes) === 'string') {
            userData.emotes.split('/').forEach(emoteData => {
                const twitchEmote = emoteData.split(':');
                const indexes = twitchEmote[1].split(',')[0].split('-');
                const emojis = new RegExp('[\u1000-\uFFFF]+', 'g');
                const aux = message.replace(emojis, ' ');
                const emoteCode = aux.substr(indexes[0], indexes[1] - indexes[0] + 1);
                replacements[emoteCode] = '<img class="emote" src="https://static-cdn.jtvnw.net/emoticons/v2/' + twitchEmote[0] + '/default/dark/3.0" />';
            });
        }
        
        // Обработка BTTV, FFZ, 7TV эмодзи
        if (this.emotes) {
        Object.entries(this.emotes).forEach(emote => {
                if (message.search(this.escapeRegExp(emote[0])) > -1) {
                if (emote[1].upscale) {
                    replacements[emote[0]] = '<img class="emote upscale" src="' + emote[1].image + '" />';
                } else if (emote[1].zeroWidth) {
                    replacements[emote[0]] = '<img class="emote" data-zw="true" src="' + emote[1].image + '" />';
                } else {
                    replacements[emote[0]] = '<img class="emote" src="' + emote[1].image + '" />';
                }
            }
        });
        }
        
        // Обработка Bits/Cheers
        if (userData.bits && parseInt(userData.bits) > 0) {
            const bits = parseInt(userData.bits);
            let parsed = false;
            
            if (this.cheers) {
                for (const cheerType of Object.entries(this.cheers)) {
                    const regex = new RegExp(cheerType[0] + "\\d+\\s*", 'ig');
                    if (message.search(regex) > -1) {
                        message = message.replace(regex, '');
                        
                        if (!parsed) {
                            let closest = 1;
                            for (const cheerTier of Object.keys(cheerType[1]).map(Number).sort((a, b) => a - b)) {
                                if (bits >= cheerTier) closest = cheerTier;
                                else break;
                            }
                            message = '<img class="cheer_emote" src="' + cheerType[1][closest].image + '" /><span class="cheer_bits" style="color: ' + cheerType[1][closest].color + ';">' + bits + '</span> ' + message;
                            parsed = true;
                        }
                    }
                }
            }
        }
        
        // Экранируем HTML
        message = this.escapeHtml(message);
        
        // Заменяем эмодзи
        const replacementKeys = Object.keys(replacements);
        replacementKeys.sort(function(a, b) {
            return b.length - a.length;
        });
        
        replacementKeys.forEach(replacementKey => {
            const regex = new RegExp("(?<!\\S)(" + this.escapeRegExp(replacementKey) + ")(?!\\S)", 'g');
            message = message.replace(regex, replacements[replacementKey]);
        });
        
        // Обработка эмодзи (если доступна библиотека twemoji)
        if (typeof twemoji !== 'undefined') {
            message = twemoji.parse(message);
        }
        
        return message;
    }
    
    // Создаем карту всех эмодзи
    createEmoteMap() {
        const emoteMap = new Map();
        
        // Добавляем 7TV эмодзи
        [...this.sevenTVGlobalEmotes, ...this.sevenTVChannelEmotes].forEach(emote => {
            if (emote && emote.name) {
                emoteMap.set(emote.name, {
                    type: '7tv',
                    id: emote.id,
                    name: emote.name,
                    url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`
                });
            }
        });
        
        // Добавляем BTTV эмодзи
        [...this.bttvGlobalEmotes, ...this.bttvChannelEmotes, ...this.bttvSharedEmotes].forEach(emote => {
            if (emote && emote.code) {
                emoteMap.set(emote.code, {
                    type: 'bttv',
                    id: emote.id,
                    name: emote.code,
                    url: `https://cdn.betterttv.net/emote/${emote.id}/1x`
                });
            }
        });
        
        // Добавляем FFZ эмодзи
        [...this.ffzGlobalEmotes, ...this.ffzChannelEmotes].forEach(emote => {
            if (emote && emote.name && emote.urls && emote.urls['1']) {
                emoteMap.set(emote.name, {
                    type: 'ffz',
                    id: emote.id,
                    name: emote.name,
                    url: `https:${emote.urls['1']}`
                });
            }
        });
        
        return emoteMap;
    }
    
    // Заменяем эмодзи в тексте
    replaceEmotes(text, emoteMap) {
        let processedText = text;
        
        // Сортируем эмодзи по длине (сначала длинные, чтобы избежать конфликтов)
        const sortedEmotes = Array.from(emoteMap.entries()).sort((a, b) => b[0].length - a[0].length);
        
        for (const [emoteName, emoteData] of sortedEmotes) {
            // Используем границы слов для точного совпадения
            const regex = new RegExp(`\\b${this.escapeRegExp(emoteName)}\\b`, 'g');
            if (regex.test(processedText)) {
                const emoteHtml = `<img src="${emoteData.url}" class="emote" alt="${emoteData.name}" title="${emoteData.name}" style="height: 1.2em; vertical-align: middle;" />`;
                processedText = processedText.replace(regex, emoteHtml);
            }
        }
        
        return processedText;
    }
    
    // Экранируем специальные символы для регулярных выражений
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Тестируем загрузку эмодзи
    testEmotes() {
        console.log('Testing emotes...');
        console.log('7TV Global:', this.sevenTVGlobalEmotes.length);
        console.log('7TV Channel:', this.sevenTVChannelEmotes.length);
        console.log('BTTV Global:', this.bttvGlobalEmotes.length);
        console.log('BTTV Channel:', this.bttvChannelEmotes.length);
        console.log('BTTV Shared:', this.bttvSharedEmotes.length);
        console.log('FFZ Global:', this.ffzGlobalEmotes.length);
        console.log('FFZ Channel:', this.ffzChannelEmotes.length);
        
        // Тестируем обработку эмодзи
        const testText = 'Hello PogChamp Kappa monkaS 5Head OMEGALUL';
        const processedText = this.processEmotes(testText);
        console.log('Original:', testText);
        console.log('Processed:', processedText);
    }
    
    
    
    addSystemMessage(text) {
        console.log('addSystemMessage called:', text);
        if (!this.chatMessagesElement) {
            console.error('chatMessagesElement is null in addSystemMessage!');
            return;
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message system-message';
        messageElement.innerHTML = `
            <span class="text" style="color: #ffd700; font-style: italic;">${this.escapeHtml(text)}</span>
        `;
        
        this.chatMessagesElement.appendChild(messageElement);
        this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
        console.log('System message added to DOM');
    }
    
    
    showError(message) {
        console.error(message);
        this.addSystemMessage(`❌ Ошибка: ${message}`);
    }
    
    showSuccess(message) {
        console.log(message);
        this.addSystemMessage(`✅ ${message}`);
    }
    
    applyMessageBackground(messageElement) {
        // Собираем фоновые изображения
        const backgrounds = [];
        
        if (this.settings.messageBackgroundImage1) {
            backgrounds.push(`url(${this.settings.messageBackgroundImage1})`);
        }
        
        if (this.settings.messageBackgroundImage2) {
            backgrounds.push(`url(${this.settings.messageBackgroundImage2})`);
        }
        
        // Применяем градиент или цвет фона
        if (this.settings.messageBackgroundGradient !== 'none') {
            const gradient = this.createGradient(
                this.settings.messageBackgroundGradient,
                this.settings.messageGradientColor1,
                this.settings.messageGradientColor2,
                this.settings.messageGradientDirection
            );
            
            // Отладочная информация
            console.log('Applying message gradient:', {
                type: this.settings.messageBackgroundGradient,
                color1: this.settings.messageGradientColor1,
                color2: this.settings.messageGradientColor2,
                direction: this.settings.messageGradientDirection,
                gradient: gradient
            });
            
            // Устанавливаем CSS переменные для fallback и OBS совместимости
            messageElement.style.setProperty('--message-gradient-color-1', this.settings.messageGradientColor1);
            messageElement.style.setProperty('--message-gradient-color-2', this.settings.messageGradientColor2);
            messageElement.style.setProperty('--message-gradient-direction', this.settings.messageGradientDirection);
            messageElement.style.setProperty('--message-fallback-bg', this.settings.messageGradientColor1);
            messageElement.style.setProperty('--message-gradient', gradient);
            
            // Применяем градиент как background
            if (backgrounds.length > 0) {
                // Если есть фоновые изображения, добавляем градиент к ним
                messageElement.style.background = `${gradient}, ${backgrounds.join(', ')}`;
            } else {
                // Если нет фоновых изображений, применяем только градиент
                messageElement.style.background = gradient;
            }
            
            // Дополнительный fallback для OBS
            messageElement.style.backgroundColor = this.settings.messageGradientColor1;
        } else {
            // Базовый цвет фона с прозрачностью
            const baseColor = this.hexToRgba(this.settings.messageBackgroundColor, this.settings.messageBackgroundOpacity / 100);
            messageElement.style.backgroundColor = baseColor;
            
            // Применяем фоновые изображения если есть
            if (backgrounds.length > 0) {
                messageElement.style.backgroundImage = backgrounds.join(', ');
                messageElement.style.backgroundSize = `${this.settings.messageBgSize1}, ${this.settings.messageBgSize2}`;
                messageElement.style.backgroundPosition = `${this.settings.messageBgPosition1}, ${this.settings.messageBgPosition2}`;
            }
        }
        
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // Метод для создания градиента
    createGradient(gradientType, color1, color2, direction) {
        console.log('Creating gradient:', { gradientType, color1, color2, direction });
        
        let result;
        switch (gradientType) {
            case 'linear':
                // Используем только градусы для лучшей совместимости с OBS
                let angle = 90; // по умолчанию
                if (direction === 'to right') angle = 90;
                else if (direction === 'to left') angle = 270;
                else if (direction === 'to bottom') angle = 180;
                else if (direction === 'to top') angle = 0;
                else if (direction === 'to bottom right') angle = 135;
                else if (direction === 'to bottom left') angle = 225;
                else if (direction === 'to top right') angle = 45;
                else if (direction === 'to top left') angle = 315;
                
                result = `linear-gradient(${angle}deg, ${color1}, ${color2})`;
                break;
            case 'radial':
                result = `radial-gradient(circle, ${color1}, ${color2})`;
                break;
            case 'conic':
                // Conic градиенты для современных браузеров
                result = `conic-gradient(from 0deg, ${color1}, ${color2})`;
                break;
            default:
                result = color1;
        }
        
        console.log('Gradient result:', result);
        return result;
    }
    
    showInfo(message) {
        console.log(message);
        this.addSystemMessage(`ℹ️ ${message}`);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Очистка сообщения по ID
    clearMessage(messageId) {
        setTimeout(() => {
            const messageElement = this.chatMessagesElement.querySelector(`[data-id="${messageId}"]`);
            if (messageElement) {
                messageElement.remove();
                this.syncMessageCount();
            }
        }, 200);
    }
    
    // Очистка чата пользователя
    clearChat(username) {
        setTimeout(() => {
            const userMessages = this.chatMessagesElement.querySelectorAll(`[data-nick="${username}"]`);
            userMessages.forEach(message => {
                message.remove();
            });
            this.syncMessageCount();
        }, 200);
    }
    
    // Экранирование регулярных выражений
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Получение ID канала - используем fallback из-за требований OAuth
    async getChannelId() {
        // Twitch Helix API требует OAuth токен, поэтому используем fallback
        // В большинстве случаев название канала работает как ID для других API
        console.log('Using channel name as ID (Helix API requires OAuth):', this.channel);
        console.log('ℹ️ Для полного доступа к Twitch API нужен OAuth токен. Используем fallback данные.');
        return this.channel;
    }
    
    // Проверка состояния кэша бейджей
    checkBadgeCache() {
        console.log('🔍 Состояние кэша бейджей:');
        console.log('📋 Размер кэша:', this.badgeCache.size);
        
        for (let [key, value] of this.badgeCache) {
            console.log(`📂 Кэш "${key}":`, {
                global: Object.keys(value.global || {}).length,
                channel: Object.keys(value.channel || {}).length
            });
            
            if (value.global && Object.keys(value.global).length > 0) {
                console.log(`🌐 Глобальные бейджи в "${key}":`, Object.keys(value.global));
            }
        }
        
        // Проверяем конкретные бейджи
        const testBadges = ['admin', 'global_mod', 'staff', 'twitchbot'];
        testBadges.forEach(badgeType => {
            const url = this.getBadgeUrl(badgeType, '1');
            console.log(`🧪 Тест бейджа ${badgeType}:`, url ? '✅ Работает' : '❌ Не работает');
        });
    }
    
    // Тестирование API глобальных бейджей
    testGlobalBadgesAPI() {
        console.log('🧪 Тестируем API глобальных бейджей...');
        
        // Простой тест fetch
        fetch('https://api.twitch.tv/helix/chat/badges/global', {
            headers: {
                'Client-ID': this.twitchClientId,
                'Accept': 'application/vnd.twitchtv.v5+json'
            }
        })
        .then(res => {
            console.log('🧪 Тест API - статус:', res.status, res.statusText);
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(`API тест не прошел: ${res.status} ${res.statusText}`);
            }
        })
        .then(data => {
            console.log('🧪 Тест API - данные получены:', data);
            console.log('🧪 Тест API - количество бейджей:', data.data?.length || 0);
        })
        .catch(err => {
            console.error('🧪 Тест API - ошибка:', err);
        });
    }
    
    // Загрузка ВСЕХ глобальных бейджей Twitch через API
    loadTwitchGlobalBadges() {
        console.log('🌐 Загружаем ВСЕ глобальные бейджи Twitch через API...');
        console.log('🔑 Client-ID:', this.twitchClientId);
        
        const headers = {
            'Client-ID': this.twitchClientId,
            'Accept': 'application/vnd.twitchtv.v5+json'
        };
        
        // Добавляем OAuth токен, если он есть
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
            console.log('🔐 Используем OAuth токен для авторизации');
        } else {
            console.log('⚠️ OAuth токен не установлен, используем только Client ID');
            console.log('💡 Для получения OAuth токена перейдите по ссылке:');
            console.log('   https://id.twitch.tv/oauth2/authorize?client_id=ixowm4lsi8n8c07c5q6o9wajawma2m&redirect_uri=https://amper24.github.io/AmperverserTwichChat/&response_type=token&scope=chat:read');
            console.log('   Затем добавьте токен в код: this.twitchOAuthToken = "ваш_токен"');
        }
        
        fetch('https://api.twitch.tv/helix/chat/badges/global', {
            headers: headers
        })
        .then(res => {
            console.log('📡 Ответ от API:', res.status, res.statusText);
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('✅ Twitch глобальные бейджи загружены:', data.data?.length || 0);
            console.log('📋 Полные данные API:', data);
            
            // Сохраняем глобальные бейджи в кэш согласно структуре API
            if (!this.badgeCache.has('global')) {
                this.badgeCache.set('global', { global: {}, channel: {} });
            }
            
            const globalBadges = {};
            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(badge => {
                    // Согласно документации, каждый бейдж имеет set_id и versions
                    if (badge.set_id && badge.versions) {
                        globalBadges[badge.set_id] = {
                            set_id: badge.set_id,
                            versions: badge.versions
                        };
                    }
                });
            }
            
            this.badgeCache.get('global').global = globalBadges;
            console.log('📋 Глобальные бейджи закэшированы:', Object.keys(globalBadges));
            
            // Анализируем все загруженные бейджи
            this.analyzeAllGlobalBadges(globalBadges);
            
            // Тестируем загрузку всех бейджей
            this.testAllGlobalBadges(globalBadges);
            
            // Создаем тестовые сообщения с реальными бейджами из API
            this.createTestMessageWithGlobalBadges();
        })
        .catch(err => {
            console.error('❌ Ошибка загрузки глобальных бейджей Twitch:', err);
            console.error('🔍 Детали ошибки:', {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            // В случае ошибки, используем fallback бейджи
            this.loadFallbackGlobalBadges();
        });
    }
    
    // Анализ всех глобальных бейджей
    analyzeAllGlobalBadges(globalBadges) {
        console.log('🔍 Анализируем все загруженные глобальные бейджи...');
        
        const allBadgeIds = Object.keys(globalBadges);
        console.log(`📊 Всего глобальных бейджей: ${allBadgeIds.length}`);
        
        // Ищем популярные категории бейджей
        const categories = {
            'admin': [],
            'staff': [],
            'moderator': [],
            'special': [],
            'game': [],
            'event': [],
            'year': [],
            'other': []
        };
        
        allBadgeIds.forEach(badgeId => {
            const lowerBadgeId = badgeId.toLowerCase();
            
            if (lowerBadgeId.includes('admin') || lowerBadgeId.includes('staff')) {
                categories.admin.push(badgeId);
            } else if (lowerBadgeId.includes('mod') || lowerBadgeId.includes('moderator')) {
                categories.moderator.push(badgeId);
            } else if (lowerBadgeId.includes('2024') || lowerBadgeId.includes('2023') || lowerBadgeId.includes('2022')) {
                categories.year.push(badgeId);
            } else if (lowerBadgeId.includes('silksong') || lowerBadgeId.includes('minecraft') || 
                      lowerBadgeId.includes('hollow') || lowerBadgeId.includes('game') ||
                      lowerBadgeId.includes('awards') || lowerBadgeId.includes('best')) {
                categories.game.push(badgeId);
            } else if (lowerBadgeId.includes('event') || lowerBadgeId.includes('special') ||
                      lowerBadgeId.includes('twitch') || lowerBadgeId.includes('con')) {
                categories.event.push(badgeId);
            } else {
                categories.other.push(badgeId);
            }
        });
        
        // Выводим статистику по категориям
        Object.keys(categories).forEach(category => {
            if (categories[category].length > 0) {
                console.log(`📂 ${category.toUpperCase()}: ${categories[category].length} бейджей`);
                if (categories[category].length <= 10) {
                    console.log(`   ${categories[category].join(', ')}`);
                } else {
                    console.log(`   ${categories[category].slice(0, 10).join(', ')}... и еще ${categories[category].length - 10}`);
                }
            }
        });
        
        // Ищем специальные бейджи 2024 года
        this.findSpecialBadges2024(globalBadges);
    }
    
    // Поиск специальных бейджей 2024 года
    findSpecialBadges2024(globalBadges) {
        console.log('🎮 Ищем специальные бейджи 2024 года...');
        
        const specialKeywords2024 = [
            'silksong', 'minecraft', 'hollow-knight', 'silksong-2024',
            'minecraft-2024', 'game-awards', 'twitch-awards', 'best-of-2024',
            'retro-2024', 'pixel-2024', 'indie-2024', 'platformer-2024',
            '2024', 'awards', 'best', 'special', 'event', 'con'
        ];
        
        const foundSpecialBadges = [];
        Object.keys(globalBadges).forEach(badgeId => {
            const lowerBadgeId = badgeId.toLowerCase();
            if (specialKeywords2024.some(keyword => lowerBadgeId.includes(keyword))) {
                foundSpecialBadges.push(badgeId);
                console.log(`🎉 Найден специальный бейдж: ${badgeId}`);
            }
        });
        
        if (foundSpecialBadges.length > 0) {
            console.log(`🎊 Найдено ${foundSpecialBadges.length} специальных бейджей:`, foundSpecialBadges);
        } else {
            console.log('ℹ️ Специальные бейджи не найдены, но все глобальные бейджи загружены');
        }
    }
    
    // Тестирование всех глобальных бейджей
    testAllGlobalBadges(globalBadges) {
        console.log('🧪 Тестируем все глобальные бейджи...');
        
        const allBadgeIds = Object.keys(globalBadges);
        const testCount = Math.min(20, allBadgeIds.length); // Тестируем до 20 бейджей
        const testBadges = allBadgeIds.slice(0, testCount);
        
        let workingCount = 0;
        testBadges.forEach(badgeType => {
            const url = this.getBadgeUrl(badgeType, '1');
            if (url) {
                workingCount++;
                console.log(`✅ ${badgeType}: работает`);
            } else {
                console.log(`❌ ${badgeType}: не работает`);
            }
        });
        
        console.log(`📊 Тест завершен: ${workingCount}/${testCount} бейджей работают`);
        console.log(`🎯 Всего глобальных бейджей доступно: ${allBadgeIds.length}`);
    }
    
    // Fallback глобальные бейджи на случай ошибки API
    loadFallbackGlobalBadges() {
        console.log('🔄 Загружаем fallback глобальные бейджи');
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
            console.log('✅ Создан кэш для глобальных бейджей');
        }
        
        // Базовые глобальные бейджи Twitch
        const fallbackGlobalBadges = {
            'admin': {
                set_id: 'admin',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/9ef7e029-4cdf-4d4d-a0d5-e2b3fb2583fe/3'
                    }
                }
            },
            'global_mod': {
                set_id: 'global_mod',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/9388c43e-4ce7-4e94-b2a1-b936d6e4824a/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/9388c43e-4ce7-4e94-b2a1-b936d6e4824a/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/9388c43e-4ce7-4e94-b2a1-b936d6e4824a/3'
                    }
                }
            },
            'staff': {
                set_id: 'staff',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8d57-2856b5b7a1c2/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8d57-2856b5b7a1c2/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/d97c37bd-a6f5-4c38-8d57-2856b5b7a1c2/3'
                    }
                }
            },
            'twitchbot': {
                set_id: 'twitchbot',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/df09a657-6074-41a7-a59c-70c930a2c002/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/df09a657-6074-41a7-a59c-70c930a2c002/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/df09a657-6074-41a7-a59c-70c930a2c002/3'
                    }
                }
            }
        };
        
        this.badgeCache.get('global').global = fallbackGlobalBadges;
        console.log('✅ Fallback глобальные бейджи загружены:', Object.keys(fallbackGlobalBadges));
        console.log('📋 Кэш глобальных бейджей:', this.badgeCache.get('global'));
        
        // Тестируем загрузку глобальных бейджей
        this.testGlobalBadges();
    }
    
    // Загрузка бейджей по требованию (когда видим их у пользователя)
    loadBadgeOnDemand(badgeType, badgeVersion) {
        console.log('🔄 Загружаем бейдж по требованию:', badgeType, badgeVersion);
        
        // Проверяем, есть ли уже этот бейдж в кэше
        const globalCache = this.badgeCache.get('global')?.global || {};
        if (globalCache[badgeType]) {
            console.log('✅ Бейдж уже есть в кэше:', badgeType);
            return;
        }
        
        // Пробуем загрузить бейдж через API
        this.loadSingleBadgeFromAPI(badgeType, badgeVersion);
    }
    
    // Загрузка одного бейджа через API
    loadSingleBadgeFromAPI(badgeType, badgeVersion) {
        console.log('🌐 Загружаем бейдж через API:', badgeType);
        
        const headers = {
            'Client-ID': this.twitchClientId,
            'Accept': 'application/vnd.twitchtv.v5+json'
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
        }
        
        // Пробуем загрузить через Helix API
        fetch('https://api.twitch.tv/helix/chat/badges/global', {
            headers: headers
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(`API недоступен: ${res.status}`);
            }
        })
        .then(data => {
            if (data.data) {
                const badge = data.data.find(b => b.set_id === badgeType);
                if (badge) {
                    this.addBadgeToCache(badgeType, badge);
                    console.log('✅ Бейдж загружен и добавлен в кэш:', badgeType);
                } else {
                    console.log('⚠️ Бейдж не найден в API:', badgeType);
                    this.addFallbackBadge(badgeType, badgeVersion);
                }
            }
        })
        .catch(err => {
            console.log('⚠️ Ошибка загрузки бейджа:', err.message);
            this.addFallbackBadge(badgeType, badgeVersion);
        });
    }
    
    // Добавление бейджа в кэш
    addBadgeToCache(badgeType, badgeData) {
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
        }
        
        const globalCache = this.badgeCache.get('global').global;
        globalCache[badgeType] = {
            set_id: badgeType,
            versions: badgeData.versions || {}
        };
    }
    
    // Добавление fallback бейджа
    addFallbackBadge(badgeType, badgeVersion) {
        console.log('🔄 Добавляем fallback бейдж:', badgeType);
        
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
        }
        
        const globalCache = this.badgeCache.get('global').global;
        
        // Создаем fallback бейдж с базовым URL
        globalCache[badgeType] = {
            set_id: badgeType,
            versions: {
                [badgeVersion || '1']: {
                    id: badgeVersion || '1',
                    image_url_1x: `https://static-cdn.jtvnw.net/badges/v1/${badgeType}/1`,
                    image_url_2x: `https://static-cdn.jtvnw.net/badges/v1/${badgeType}/2`,
                    image_url_4x: `https://static-cdn.jtvnw.net/badges/v1/${badgeType}/3`
                }
            }
        };
        
        console.log('✅ Fallback бейдж добавлен:', badgeType);
    }
    
    // Тестирование глобальных бейджей
    testGlobalBadges() {
        console.log('🧪 Тестируем глобальные бейджи...');
        const testBadges = ['admin', 'global_mod', 'staff', 'twitchbot'];
        
        testBadges.forEach(badgeType => {
            const url = this.getBadgeUrl(badgeType, '1');
            console.log(`Тест ${badgeType}:`, url ? '✅ Работает' : '❌ Не работает', url);
        });
    }
    
    // Создание тестовых сообщений с реальными бейджами из API
    createTestMessageWithGlobalBadges() {
        console.log('📝 Создаем тестовые сообщения с реальными бейджами из API...');
        
        // Получаем все доступные глобальные бейджи
        const globalBadges = this.badgeCache.get('global')?.global || {};
        const allBadgeIds = Object.keys(globalBadges);
        
        if (allBadgeIds.length === 0) {
            console.log('⚠️ Глобальные бейджи еще не загружены, пропускаем тестовые сообщения');
            return;
        }
        
        // Создаем тестовое сообщение с глобальными бейджами
        const testMessage = {
            username: 'TestAdmin',
            displayName: 'TestAdmin',
            message: 'Тестовое сообщение с глобальными бейджами!',
            badges: 'admin/1,global_mod/1,staff/1', // Базовые глобальные бейджи
            color: '#FF0000',
            timestamp: new Date().toISOString()
        };
        
        // Добавляем сообщение в чат
        setTimeout(() => {
            this.addMessage(testMessage);
            console.log('✅ Тестовое сообщение добавлено в чат');
            
            // Создаем второе тестовое сообщение с комбинацией бейджей
            const testMessage2 = {
                username: 'TestModerator',
                displayName: 'TestModerator',
                message: 'Тестовое сообщение с канальными и глобальными бейджами!',
                badges: 'moderator/1,admin/1,subscriber/12', // Канальные + глобальные
                color: '#00FF00',
                timestamp: new Date().toISOString()
            };
            
            setTimeout(() => {
                this.addMessage(testMessage2);
                console.log('✅ Второе тестовое сообщение добавлено в чат');
                
                // Создаем третье тестовое сообщение с пользовательскими бейджами 2024
                this.createTestMessageWithSpecialBadges(allBadgeIds);
            }, 2000);
        }, 1000);
    }
    
    // Создание тестового сообщения со специальными бейджами 2024
    createTestMessageWithSpecialBadges(allBadgeIds) {
        console.log('🎮 Создаем тестовое сообщение со специальными бейджами 2024...');
        
        // Ищем специальные бейджи 2024 года
        const specialKeywords2024 = [
            'silksong', 'minecraft', 'hollow-knight', '2024', 'awards', 
            'best', 'special', 'event', 'game', 'twitch'
        ];
        
        const specialBadges = allBadgeIds.filter(badgeId => {
            const lowerBadgeId = badgeId.toLowerCase();
            return specialKeywords2024.some(keyword => lowerBadgeId.includes(keyword));
        });
        
        if (specialBadges.length > 0) {
            // Берем первые 3 специальных бейджа
            const selectedBadges = specialBadges.slice(0, 3).map(badgeId => `${badgeId}/1`).join(',');
            
            const testMessage3 = {
                username: 'TestGamer2024',
                displayName: 'TestGamer2024',
                message: 'Тестовое сообщение со специальными бейджами 2024!',
                badges: selectedBadges,
                color: '#0000FF',
                timestamp: new Date().toISOString()
            };
            
            setTimeout(() => {
                this.addMessage(testMessage3);
                console.log('✅ Тестовое сообщение со специальными бейджами добавлено в чат');
                console.log('🎊 Использованы бейджи:', selectedBadges);
            }, 3000);
        } else {
            console.log('ℹ️ Специальные бейджи 2024 не найдены, пропускаем тестовое сообщение');
        }
    }
    
    // Загрузка дополнительных бейджей - используем API как в jChat
    loadAdditionalBadges() {
        // Сначала загружаем fallback глобальные бейджи для немедленного использования
        this.loadFallbackGlobalBadges();
        
        // Затем пытаемся загрузить актуальные глобальные бейджи Twitch
        this.loadTwitchGlobalBadges();
        
        // FFZ:AP бейджи - как в jChat
        fetch('https://api.ffzap.com/v1/supporters')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                this.ffzapBadges = res || [];
                console.log('FFZ:AP badges loaded:', this.ffzapBadges.length);
            })
            .catch(err => {
                console.warn('FFZ:AP badges error:', err.message);
                this.ffzapBadges = [];
            });
        
        // BTTV бейджи - как в jChat
        fetch('https://api.betterttv.net/3/cached/badges')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                this.bttvBadges = res || [];
                console.log('BTTV badges loaded:', this.bttvBadges.length);
            })
            .catch(err => {
                console.warn('BTTV badges error:', err.message);
                this.bttvBadges = [];
            });
        
        // 7TV бейджи - используем новый API v3
        fetch('https://7tv.io/v3/badges')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                this.seventvBadges = res || [];
                console.log('7TV badges loaded:', this.seventvBadges.length);
            })
            .catch(err => {
                console.warn('7TV badges error:', err.message);
                // Fallback на старый API
                return fetch('https://api.7tv.app/v2/badges?user_identifier=login')
                    .then(res => res.json())
                    .then(res => {
                        this.seventvBadges = res.badges || [];
                        console.log('7TV badges loaded (fallback):', this.seventvBadges.length);
                    })
                    .catch(err2 => {
                        console.warn('7TV badges fallback error:', err2.message);
                        this.seventvBadges = [];
                    });
            });
        
        // Chatterino бейджи - как в jChat
        fetch('https://api.chatterino.com/badges')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                this.chatterinoBadges = res.badges || [];
                console.log('Chatterino badges loaded:', this.chatterinoBadges.length);
            })
            .catch(err => {
                console.warn('Chatterino badges error:', err.message);
                this.chatterinoBadges = [];
            });
    }
    
    // Загрузка бейджей канала Twitch согласно официальной документации
    loadTwitchChannelBadges(channelId) {
        if (!channelId || channelId === 'global') {
            console.log('No channel ID for badges, skipping channel badges');
            return;
        }
        
        fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channelId}`, {
            headers: {
                'Client-ID': this.twitchClientId,
                'Accept': 'application/vnd.twitchtv.v5+json'
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            console.log('Twitch channel badges loaded:', data.data?.length || 0);
            
            // Сохраняем бейджи канала в кэш согласно структуре API
            if (!this.badgeCache.has(channelId)) {
                this.badgeCache.set(channelId, { global: {}, channel: {} });
            }
            
            const channelBadges = {};
            if (data.data && Array.isArray(data.data)) {
                data.data.forEach(badge => {
                    // Согласно документации, каждый бейдж имеет set_id и versions
                    if (badge.set_id && badge.versions) {
                        channelBadges[badge.set_id] = {
                            set_id: badge.set_id,
                            versions: badge.versions
                        };
                    }
                });
            }
            
            this.badgeCache.get(channelId).channel = channelBadges;
            console.log('Channel badges cached:', Object.keys(channelBadges));
            
            // Логируем детали для отладки
            Object.keys(channelBadges).forEach(badgeId => {
                const versions = Object.keys(channelBadges[badgeId].versions);
                console.log(`Channel badge ${badgeId}: ${versions.length} versions`);
            });
        })
        .catch(err => {
            console.warn('Twitch channel badges error:', err.message);
            // В случае ошибки, используем fallback бейджи канала
            this.loadFallbackChannelBadges(channelId);
        });
    }
    
    // Fallback бейджи канала на случай ошибки API
    loadFallbackChannelBadges(channelId) {
        console.log('Loading fallback channel badges for:', channelId);
        if (!this.badgeCache.has(channelId)) {
            this.badgeCache.set(channelId, { global: {}, channel: {} });
        }
        
        // Базовые бейджи канала Twitch
        const fallbackChannelBadges = {
            'broadcaster': {
                set_id: 'broadcaster',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/3'
                    }
                }
            },
            'moderator': {
                set_id: 'moderator',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3'
                    }
                }
            },
            'vip': {
                set_id: 'vip',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/3'
                    }
                }
            },
            'subscriber': {
                set_id: 'subscriber',
                versions: {
                    '0': {
                        id: '0',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3'
                    },
                    '3': {
                        id: '3',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3'
                    },
                    '6': {
                        id: '6',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3'
                    },
                    '12': {
                        id: '12',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3'
                    },
                    '24': {
                        id: '24',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3'
                    }
                }
            }
        };
        
        this.badgeCache.get(channelId).channel = fallbackChannelBadges;
        console.log('Fallback channel badges loaded:', Object.keys(fallbackChannelBadges));
    }
    
    // Загрузка бейджей Twitch через API - как в jChat
    loadBadges(channelId) {
        this.badges = {};
        
        // Сначала загружаем fallback бейджи канала для немедленного использования
        if (channelId && channelId !== 'global') {
            this.loadFallbackChannelBadges(channelId);
        }
        
        // Затем пытаемся загрузить актуальные бейджи канала через API
        this.loadTwitchChannelBadges(channelId);
        
        // Fallback данные на случай ошибки API
        console.log('Using fallback badges for channel:', this.channel);
        this.badges = {
            'broadcaster:1': 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
            'moderator:1': 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            'vip:1': 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
            'subscriber:1': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
            'subscriber:2': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
            'subscriber:3': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
            'subscriber:6': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/6',
            'subscriber:12': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/12',
            'subscriber:24': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/24',
            'subscriber:36': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/36',
            'subscriber:48': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/48',
            'subscriber:60': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/60',
            'subscriber:72': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/72',
            'subscriber:84': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/84',
            'subscriber:96': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/96',
            'subscriber:108': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/108',
            'subscriber:120': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/120',
            'premium:1': 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fd98d5f39d/1',
            'bits:1': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/1',
            'bits:100': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/100',
            'bits:1000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/1000',
            'bits:5000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/5000',
            'bits:10000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/10000',
            'bits:25000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/25000',
            'bits:50000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/50000',
            'bits:100000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/100000',
            'bits:200000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/200000',
            'bits:300000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/300000',
            'bits:400000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/400000',
            'bits:500000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/500000',
            'bits:600000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/600000',
            'bits:700000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/700000',
            'bits:800000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/800000',
            'bits:900000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/900000',
            'bits:1000000': 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-2d7a9d4e6d8d/1000000'
        };
        
        // Пробуем загрузить FFZ модераторские бейджи
        fetch(`https://api.frankerfacez.com/v1/room/${channelId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.room) {
                    if (res.room.moderator_badge) {
                        this.badges['moderator:1'] = `https://cdn.frankerfacez.com/room-badge/mod/${this.channel}/4/rounded`;
                    }
                    if (res.room.vip_badge) {
                        this.badges['vip:1'] = `https://cdn.frankerfacez.com/room-badge/vip/${this.channel}/4`;
                    }
                }
                console.log('FFZ badges loaded for channel:', this.channel);
            })
            .catch(err => {
                console.warn('FFZ badges loading error:', err.message);
                // Это нормально, не все каналы используют FFZ
            });
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
    }
}

// Инициализация чата при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.twitchChat = new TwitchChat();
});

// Обработка закрытия страницы
window.addEventListener('beforeunload', () => {
    if (window.twitchChat) {
        window.twitchChat.disconnect();
    }
});
