class TwitchChat {
    constructor() {
        this.socket = null;
        this.channel = '';
        this.channels = []; // Массив каналов для общего чата
        this.isConnected = false;
        this.messageCount = 0;
        this.maxMessages = 100; // Максимальное количество сообщений в чате
        
        // Кэш для бейджей
        this.badgeCache = new Map();
        this.twitchClientId = 'ixowm4lsi8n8c07c5q6o9wajawma2m'; // Ваш Client ID
        this.twitchOAuthToken = '3907ydvzaj8du83lv2fqvy6uk6151s'; // Ваш OAuth токен
        
        // Новая система бейджей по образцу эмодзи
        this.badges = {}; // Кэш бейджей как у эмодзи
        this.globalBadges = {}; // Глобальные бейджи
        this.channelBadges = {}; // Бейджи канала
        this.userStatsCache = new Map(); // Кэш статистики пользователей
        
        // Массивы для эмодзи (BTTV, 7TV, FFZ)
        this.bttvGlobalEmotes = [];
        this.bttvChannelEmotes = [];
        this.sevenTVGlobalEmotes = [];
        this.sevenTVChannelEmotes = [];
        this.ffzGlobalEmotes = [];
        this.ffzChannelEmotes = [];
        this.bttvSharedEmotes = [];
        
        // BTTV настройки пользователей
        this.bttvUserSettings = {};
        
        // FFZ настройки пользователей
        this.ffzUserSettings = {};
        this.ffzBadges = {};
        
        // 7TV настройки пользователей
        this.sevenTVUserSettings = {};
        
        // Поддержка общего чата
        this.sharedChatInfo = null; // Информация об общем чате
        this.channelAvatars = new Map(); // Кэш аватарок каналов
        this.sharedChannels = []; // Каналы-участники общего чата
        
        // Настройки по умолчанию
        this.settings = {
            borderWidth: 3,
            borderColor: '#9146ff',
            borderOpacity: 100,
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
        chatDirection: 'top-to-bottom-new-down',
        hideLinkOnlyMessages: false, // Скрывать сообщения только из ссылок
            messageSpacing: 3,
            messageVerticalOffset: 0,
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
            // Эффекты текста
            textShadowEnabled: false,
            textShadowX: 2,
            textShadowY: 2,
            textShadowBlur: 4,
            textShadowColor: '#000000',
            textGlowEnabled: false,
            textGlowSize: 5,
            textGlowColor: '#00ffff',
            textStrokeEnabled: false,
            textStrokeWidth: 2,
            textStrokeColor: '#000000',
            textStrokeType: 'outline',
            maxMessages: 100,
            messageSpeed: 300,
            chatWidth: 800,
            chatHeight: 600
        };
        
        this.initializeElements();
        
        // Проверяем, что элементы инициализированы
        if (!this.chatMessagesElement) {
            console.log('chatMessagesElement не найден, будет установлен позже');
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
        
        // Добавляем обработчик изменения размера окна
        window.addEventListener('resize', () => {
            // Небольшая задержка, чтобы изменения размера успели примениться
            setTimeout(() => {
                this.limitChatMessages();
            }, 100);
        });
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
        if (urlParams.get('borderOpacity')) this.settings.borderOpacity = parseInt(urlParams.get('borderOpacity'));
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
        if (urlParams.get('messageSpacing')) this.settings.messageSpacing = parseInt(urlParams.get('messageSpacing'));
        if (urlParams.get('messageVerticalOffset')) this.settings.messageVerticalOffset = parseInt(urlParams.get('messageVerticalOffset'));
        if (urlParams.get('hideLinkOnlyMessages')) this.settings.hideLinkOnlyMessages = urlParams.get('hideLinkOnlyMessages') === 'true';
        
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
        
        // Эффекты текста
        if (urlParams.get('textShadowEnabled')) this.settings.textShadowEnabled = urlParams.get('textShadowEnabled') === 'true';
        if (urlParams.get('textShadowX')) this.settings.textShadowX = parseInt(urlParams.get('textShadowX'));
        if (urlParams.get('textShadowY')) this.settings.textShadowY = parseInt(urlParams.get('textShadowY'));
        if (urlParams.get('textShadowBlur')) this.settings.textShadowBlur = parseInt(urlParams.get('textShadowBlur'));
        if (urlParams.get('textShadowColor')) this.settings.textShadowColor = urlParams.get('textShadowColor');
        if (urlParams.get('textGlowEnabled')) this.settings.textGlowEnabled = urlParams.get('textGlowEnabled') === 'true';
        if (urlParams.get('textGlowSize')) this.settings.textGlowSize = parseInt(urlParams.get('textGlowSize'));
        if (urlParams.get('textGlowColor')) this.settings.textGlowColor = urlParams.get('textGlowColor');
        if (urlParams.get('textStrokeEnabled')) this.settings.textStrokeEnabled = urlParams.get('textStrokeEnabled') === 'true';
        if (urlParams.get('textStrokeWidth')) this.settings.textStrokeWidth = parseInt(urlParams.get('textStrokeWidth'));
        if (urlParams.get('textStrokeColor')) this.settings.textStrokeColor = urlParams.get('textStrokeColor');
        if (urlParams.get('textStrokeType')) this.settings.textStrokeType = urlParams.get('textStrokeType');
        
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
        // Проверяем, что элементы инициализированы
        if (!this.chatContainer || !this.chatMessagesElement) {
            console.log('Элементы чата не инициализированы, пропускаем applySettings');
            return;
        }
        
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
            
            // Применяем прозрачность к цвету рамки
            const borderOpacity = this.settings.borderOpacity / 100;
            const borderColorWithOpacity = this.hexToRgba(this.settings.borderColor, borderOpacity);
            this.chatContainer.style.borderColor = borderColorWithOpacity;
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
                    // Применяем прозрачность к цветам градиента
                    const color1WithOpacity = this.hexToRgba(this.settings.gradientColor1, opacity);
                    const color2WithOpacity = this.hexToRgba(this.settings.gradientColor2, opacity);
                    
                    const gradient = this.createGradient(
                        this.settings.backgroundGradient,
                        color1WithOpacity,
                        color2WithOpacity,
                        this.settings.gradientDirection
                    );
                    this.chatContainer.style.background = `${gradient}, url(${this.settings.backgroundImage})`;
                } else {
                    this.chatContainer.style.background = `rgba(255, 255, 255, ${opacity * 0.05})`;
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
                    // Применяем прозрачность к цветам градиента
                    const opacity = this.settings.backgroundOpacity / 100;
                    const color1WithOpacity = this.hexToRgba(this.settings.gradientColor1, opacity);
                    const color2WithOpacity = this.hexToRgba(this.settings.gradientColor2, opacity);
                    
                    const gradient = this.createGradient(
                        this.settings.backgroundGradient,
                        color1WithOpacity,
                        color2WithOpacity,
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
                    // Применяем цвет фона с учетом прозрачности
                    const opacity = this.settings.backgroundOpacity / 100;
                    const color = this.hexToRgba(this.settings.backgroundColor, opacity);
                    this.chatContainer.style.background = color;
                    this.chatContainer.style.backgroundImage = '';
                    this.chatContainer.style.setProperty('--fallback-bg', color);
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
        
        // Проверяем, не переполняется ли чат после изменения настроек
        setTimeout(() => {
            this.limitChatMessages();
        }, 100);
        
        
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
        
        // Применяем эффекты текста
        this.applyTextEffects();
        
        // Применяем настройки значков
        
        // Принудительное применение градиента в конце (на случай переопределения)
        if (this.settings.backgroundGradient !== 'none' && !this.settings.hideBackground) {
            // Применяем прозрачность к цветам градиента
            const opacity = this.settings.backgroundOpacity / 100;
            const color1WithOpacity = this.hexToRgba(this.settings.gradientColor1, opacity);
            const color2WithOpacity = this.hexToRgba(this.settings.gradientColor2, opacity);
            
            const gradient = this.createGradient(
                this.settings.backgroundGradient,
                color1WithOpacity,
                color2WithOpacity,
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
        if (!this.channel && this.channels.length === 0) {
            console.log('⚠️ Канал не указан, подключение пропущено');
            return;
        }
        
        // Очищаем состояние коллаба перед подключением к новому каналу
        this.clearSharedChatState();
        
        // Если канал указан, добавляем его в список каналов
        if (this.channel && !this.channels.includes(this.channel)) {
            this.channels.push(this.channel);
        }
        
        // Проверяем общий чат перед подключением
        console.log('🔍 Проверяем общий чат для канала:', this.channel);
        await this.detectSharedChat(this.channel);
        
        // Загружаем все данные для канала (как в jChat v2)
        try {
            // Используем название канала как ID
            const channelId = this.channel;
                this.channelId = channelId;
                
                // Загружаем эмодзи
                this.loadEmotes(channelId);
                
            // Загружаем бейджи через новую систему
            // Загружаем бейджи (новая система)
            this.loadBadges(this.channelNumericId);
            
            // Загружаем старую систему для совместимости
            this.loadAllBadges();
                
                // Загружаем cheers/bits
                this.loadCheers(channelId);
                
                console.log('All data loaded for channel:', this.channel);
        } catch (error) {
            console.error('Failed to load channel data:', error);
        }
        
        
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
                
                // Подключаемся ко всем каналам
                this.channels.forEach(channel => {
                    this.socket.send('JOIN #' + channel.toLowerCase() + '\r\n');
                    console.log('Joining channel:', channel);
                });
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
        
        // Загружаем эмодзи из всех источников параллельно
        this.loadBTTVEmotes(channelID);
        this.load7TVEmotes(channelID);
        this.loadFFZEmotes(channelID);
    }
    
    // Загрузка BTTV эмодзи
    loadBTTVEmotes(channelID) {
        console.log('🎭 Загружаем BTTV эмодзи...');
        
        // BTTV Global emotes - используем актуальный API
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
                            image: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
                            source: 'bttv',
                            type: 'global',
                            animated: emote.animated || false,
                            zeroWidth: this.isBTTVZeroWidthEmote(emote.id)
                        };
                    });
                    console.log('✅ BTTV Global emotes loaded:', res.length);
                }
                })
            .catch(err => {
                console.warn('❌ BTTV global emotes error:', err.message);
            });

        // BTTV Channel emotes - используем актуальный API
        if (channelID && channelID !== 'global') {
        fetch(`https://api.betterttv.net/3/cached/users/twitch/${channelID}`)
                .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                    // Channel emotes
                if (res.channelEmotes && Array.isArray(res.channelEmotes)) {
                    res.channelEmotes.forEach(emote => {
                        this.emotes[emote.code] = {
                            id: emote.id,
                                image: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
                                source: 'bttv',
                                type: 'channel',
                                animated: emote.animated || false,
                                zeroWidth: this.isBTTVZeroWidthEmote(emote.id)
                        };
                    });
                        console.log('✅ BTTV Channel emotes loaded:', res.channelEmotes.length);
                }
                    
                    // Shared emotes
                if (res.sharedEmotes && Array.isArray(res.sharedEmotes)) {
                    res.sharedEmotes.forEach(emote => {
                        this.emotes[emote.code] = {
                            id: emote.id,
                                image: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
                                source: 'bttv',
                                type: 'shared',
                                animated: emote.animated || false,
                                zeroWidth: this.isBTTVZeroWidthEmote(emote.id)
                        };
                    });
                        console.log('✅ BTTV Shared emotes loaded:', res.sharedEmotes.length);
                }
            })
            .catch(err => {
                    console.warn('❌ BTTV channel emotes error:', err.message);
                });
        }
    }
    
    // Проверка на zero-width эмодзи BTTV
    isBTTVZeroWidthEmote(emoteId) {
        const zeroWidthEmotes = [
            "5e76d338d6581c3724c0f0b2", // SoSnowy
            "5e76d399d6581c3724c0f0b8", // IceCold
            "567b5b520e984428652809b6", // SoBayed
            "5849c9a4f52be01a7ee5f79d", // BegWan
            "567b5c080e984428652809ba", // SoBad
            "567b5dc00e984428652809bd", // SoGood
            "58487cc6f52be01a7ee5f205", // SoCute
            "5849c9c8f52be01a7ee5f79e"  // SoHappy
        ];
        return zeroWidthEmotes.includes(emoteId);
    }
    
    // Загрузка дополнительных BTTV данных пользователя
    loadBTTVUserData(nick, userId) {
        if (!userId || !nick) return;
        
        // Загружаем настройки пользователя BTTV через правильный эндпоинт
        fetch(`https://api.betterttv.net/3/cached/users/twitch/${userId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(userData => {
                if (userData && userData.id) {
                    console.log('🎭 BTTV данные пользователя загружены:', nick, userData);
                    
                    // Сохраняем настройки пользователя
                    if (!this.bttvUserSettings) this.bttvUserSettings = {};
                    this.bttvUserSettings[nick] = {
                        id: userData.id,
                        name: userData.name,
                        displayName: userData.displayName,
                        providerId: userData.providerId,
                        badges: userData.badges || [],
                        bio: userData.bio || '',
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt
                    };
                    
                    // Загружаем персональные эмодзи пользователя
                    if (userData.emotes && Array.isArray(userData.emotes)) {
                        userData.emotes.forEach(emote => {
                            this.emotes[emote.code] = {
                                id: emote.id,
                                image: `https://cdn.betterttv.net/emote/${emote.id}/3x`,
                                source: 'bttv',
                                type: 'user',
                                animated: emote.animated || false,
                                zeroWidth: this.isBTTVZeroWidthEmote(emote.id)
                            };
                        });
                        console.log('🎭 Персональные BTTV эмодзи пользователя загружены:', nick, userData.emotes.length);
                    }
                }
            })
            .catch(err => {
                // Игнорируем ошибки для пользователей без BTTV аккаунта
                console.log('ℹ️ BTTV данные пользователя недоступны:', nick, err.message);
            });
    }
    
    // Загрузка дополнительных FFZ данных пользователя (API v2)
    loadFFZUserData(nick, userId) {
        if (!userId || !nick) return;
        
        // Загружаем настройки пользователя FFZ через API v2
        fetch(`https://api.frankerfacez.com/v2/user/${userId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(userData => {
                if (userData && userData.user) {
                    console.log('🎨 FFZ данные пользователя загружены (API v2):', nick, userData.user);
                    
                    // Сохраняем настройки пользователя
                    this.ffzUserSettings[nick] = {
                        id: userData.user.id,
                        name: userData.user.name,
                        displayName: userData.user.display_name,
                        bio: userData.user.bio || '',
                        badges: userData.user.badges || [],
                        createdAt: userData.user.created_at,
                        updatedAt: userData.user.updated_at,
                        avatar: userData.user.avatar || null,
                        style: userData.user.style || {}
                    };
                    
                    // Загружаем персональные эмодзи пользователя
                    if (userData.sets && Object.keys(userData.sets).length > 0) {
                        Object.values(userData.sets).forEach(set => {
                            if (set.emoticons && Array.isArray(set.emoticons)) {
                                set.emoticons.forEach(emote => {
                                    this.emotes[emote.name] = {
                                        id: emote.id,
                                        name: emote.name,
                                        image: this.getFFZEmoteUrlV2(emote.urls),
                                        source: 'ffz',
                                        type: 'user',
                                        animated: emote.animated || false,
                                        modifier: emote.modifier || false,
                                        modifier_flags: emote.modifier_flags || 0,
                                        zeroWidth: false,
                                        usage_count: emote.usage_count || 0,
                                        created_at: emote.created_at,
                                        updated_at: emote.updated_at,
                                        owner: emote.owner ? {
                                            id: emote.owner.id,
                                            name: emote.owner.name,
                                            display_name: emote.owner.display_name
                                        } : null
                                    };
                                });
                                console.log('🎨 Персональные FFZ эмодзи пользователя загружены (API v2):', nick, set.emoticons.length);
                            }
                        });
                    }
                }
            })
            .catch(err => {
                console.log('ℹ️ FFZ данные пользователя недоступны (API v2):', nick, err.message);
                // Fallback к v1 API
                this.loadFFZUserDataV1Fallback(nick, userId);
            });
    }
    
    // Fallback к FFZ API v1 для данных пользователя
    loadFFZUserDataV1Fallback(nick, userId) {
        console.log('🔄 Используем FFZ API v1 fallback для данных пользователя:', nick);
        fetch(`https://api.frankerfacez.com/v1/user/${userId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(userData => {
                if (userData && userData.user) {
                    console.log('🎨 FFZ данные пользователя загружены (API v1 fallback):', nick, userData.user);
                    
                    // Сохраняем настройки пользователя
                    this.ffzUserSettings[nick] = {
                        id: userData.user.id,
                        name: userData.user.name,
                        displayName: userData.user.display_name,
                        bio: userData.user.bio || '',
                        badges: userData.user.badges || [],
                        createdAt: userData.user.created_at,
                        updatedAt: userData.user.updated_at
                    };
                    
                    // Загружаем персональные эмодзи пользователя
                    if (userData.sets && Object.keys(userData.sets).length > 0) {
                        Object.values(userData.sets).forEach(set => {
                            if (set.emoticons && Array.isArray(set.emoticons)) {
                                set.emoticons.forEach(emote => {
                                    this.emotes[emote.name] = {
                                        id: emote.id,
                                        name: emote.name,
                                        image: this.getFFZEmoteUrl(emote.urls),
                                        source: 'ffz',
                                        type: 'user',
                                        animated: emote.animated || false,
                                        modifier: emote.modifier || false,
                                        modifier_flags: emote.modifier_flags || 0,
                                        zeroWidth: false
                                    };
                                });
                                console.log('🎨 Персональные FFZ эмодзи пользователя загружены (API v1 fallback):', nick, set.emoticons.length);
                            }
                        });
                    }
                }
            })
            .catch(err => {
                // Игнорируем ошибки для пользователей без FFZ аккаунта
                console.log('ℹ️ FFZ данные пользователя недоступны (API v1 fallback):', nick, err.message);
            });
    }
    
    // Загрузка дополнительных 7TV данных пользователя
    load7TVUserData(nick, userId) {
        if (!userId || !nick) return;
        
        // Загружаем настройки пользователя 7TV
        fetch(`https://7tv.io/v3/users/twitch/${userId}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(userData => {
                if (userData && userData.id) {
                    console.log('🎬 7TV данные пользователя загружены:', nick, userData);
                    
                    // Сохраняем настройки пользователя
                    this.sevenTVUserSettings[nick] = {
                        id: userData.id,
                        username: userData.username,
                        displayName: userData.display_name,
                        avatarUrl: userData.avatar_url,
                        style: userData.style || {},
                        connections: userData.connections || [],
                        createdAt: userData.created_at,
                        updatedAt: userData.updated_at
                    };
                    
                    // Загружаем персональные эмодзи пользователя
                    if (userData.emote_set && userData.emote_set.emotes && Array.isArray(userData.emote_set.emotes)) {
                        userData.emote_set.emotes.forEach(emote => {
                            this.emotes[emote.name] = {
                                id: emote.id,
                                name: emote.name,
                                image: this.get7TVEmoteUrl(emote.id),
                                source: '7tv',
                                type: 'user',
                                animated: emote.animated || false,
                                flags: emote.flags || [],
                                zeroWidth: this.is7TVZeroWidthEmote(emote.flags),
                                owner: emote.owner ? {
                                    id: emote.owner.id,
                                    username: emote.owner.username,
                                    displayName: emote.owner.display_name
                                } : null
                            };
                        });
                        console.log('🎬 Персональные 7TV эмодзи пользователя загружены:', nick, userData.emote_set.emotes.length);
                    }
                }
            })
            .catch(err => {
                // Игнорируем ошибки для пользователей без 7TV аккаунта
                console.log('ℹ️ 7TV данные пользователя недоступны:', nick, err.message);
            });
    }
    
    // Загрузка 7TV эмодзи (обновленная интеграция)
    load7TVEmotes(channelID) {
        console.log('🎬 Загружаем 7TV эмодзи...');
        
        // 7TV Global emotes - используем правильный API
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
                            name: emote.name,
                            image: this.get7TVEmoteUrl(emote.id),
                            source: '7tv',
                            type: 'global',
                            animated: emote.animated || false,
                            flags: Array.isArray(emote.flags) ? emote.flags : [],
                            zeroWidth: this.is7TVZeroWidthEmote(emote.flags),
                            owner: emote.owner ? {
                                id: emote.owner.id,
                                username: emote.owner.username,
                                displayName: emote.owner.display_name
                            } : null
                        };
                    });
                    console.log('✅ 7TV Global emotes loaded:', res.emotes.length);
                }
            })
            .catch(err => {
                console.warn('❌ 7TV global emotes error:', err.message);
            });

        // 7TV Channel emotes - используем правильный API
        if (channelID && channelID !== 'global') {
            // Сначала получаем ID пользователя 7TV по Twitch ID
            fetch(`https://7tv.io/v3/users/twitch/${channelID}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }
                    return res.json();
                })
                .then(userData => {
                    if (userData && userData.emote_set && userData.emote_set.emotes && Array.isArray(userData.emote_set.emotes)) {
                        userData.emote_set.emotes.forEach(emote => {
                            this.emotes[emote.name] = {
                                id: emote.id,
                                name: emote.name,
                                image: this.get7TVEmoteUrl(emote.id),
                                source: '7tv',
                                type: 'channel',
                                animated: emote.animated || false,
                                flags: Array.isArray(emote.flags) ? emote.flags : [],
                                zeroWidth: this.is7TVZeroWidthEmote(emote.flags),
                                owner: emote.owner ? {
                                    id: emote.owner.id,
                                    username: emote.owner.username,
                                    displayName: emote.owner.display_name
                                } : null
                            };
                        });
                        console.log('✅ 7TV Channel emotes loaded:', userData.emote_set.emotes.length);
                    }
                })
                .catch(err => {
                    console.log('ℹ️ 7TV channel emotes not available for:', channelID, err.message);
                });
        }
        
        // Загружаем дополнительные 7TV данные
        this.load7TVAdditionalData();
    }
    
    // Получение URL эмодзи 7TV с приоритетом качества
    get7TVEmoteUrl(emoteId) {
        // Приоритет: 4x.webp > 2x.webp > 1x.webp > 4x.png
        return `https://cdn.7tv.app/emote/${emoteId}/4x.webp`;
    }
    
    // Проверка на zero-width эмодзи 7TV
    is7TVZeroWidthEmote(flags) {
        // 7TV использует флаги: 1 = ZERO_WIDTH, 2 = PRIVATE, 4 = ACTIVITY
        return flags && Array.isArray(flags) && flags.includes(1);
    }
    
    // Загрузка дополнительных данных 7TV
    load7TVAdditionalData() {
        // Загружаем информацию о популярных эмодзи через правильный эндпоинт
        fetch('https://7tv.io/v3/emotes?limit=100&page=0')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.items && Array.isArray(res.items)) {
                    console.log('✅ 7TV Additional emotes loaded:', res.items.length);
                    
                    // Обрабатываем дополнительные эмодзи
                    res.items.forEach(emote => {
                        if (!this.emotes[emote.name]) {
                            this.emotes[emote.name] = {
                                id: emote.id,
                                name: emote.name,
                                image: this.get7TVEmoteUrl(emote.id),
                                source: '7tv',
                                type: 'additional',
                                animated: emote.animated || false,
                                flags: Array.isArray(emote.flags) ? emote.flags : [],
                                zeroWidth: this.is7TVZeroWidthEmote(emote.flags),
                                owner: emote.owner ? {
                                    id: emote.owner.id,
                                    username: emote.owner.username,
                                    displayName: emote.owner.display_name
                                } : null
                            };
                        }
                    });
                }
            })
            .catch(err => {
                console.log('ℹ️ 7TV additional data not available:', err.message);
            });
    }
    
    // Загрузка FFZ эмодзи (обновленная интеграция до API v2)
    loadFFZEmotes(channelID) {
        console.log('🎨 Загружаем FrankerFaceZ эмодзи (API v2)...');
        
        // FFZ Global emotes - используем API v2
        fetch('https://api.frankerfacez.com/v2/emotes?sort=count-desc&per_page=200')
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
                            name: emote.name,
                            image: this.getFFZEmoteUrlV2(emote.urls),
                            source: 'ffz',
                            type: 'global',
                            animated: emote.animated || false,
                            modifier: emote.modifier || false,
                            modifier_flags: emote.modifier_flags || 0,
                            zeroWidth: false, // FFZ не поддерживает zero-width эмодзи
                            usage_count: emote.usage_count || 0,
                            created_at: emote.created_at,
                            updated_at: emote.updated_at,
                            owner: emote.owner ? {
                                id: emote.owner.id,
                                name: emote.owner.name,
                                display_name: emote.owner.display_name
                            } : null
                        };
                    });
                    console.log('✅ FFZ Global emotes loaded (API v2):', res.emotes.length);
                }
            })
            .catch(err => {
                console.warn('❌ FFZ global emotes error (API v2):', err.message);
                // Fallback к v1 API
                this.loadFFZEmotesV1Fallback();
            });

        // FFZ Channel emotes - используем API v2
        if (channelID && channelID !== 'global') {
            fetch(`https://api.frankerfacez.com/v2/room/${channelID}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP ${res.status}`);
                    }
                    return res.json();
                })
                .then(res => {
                    if (res.sets && Object.keys(res.sets).length > 0) {
                        let totalEmotes = 0;
                        Object.values(res.sets).forEach(set => {
                            if (set.emoticons && Array.isArray(set.emoticons)) {
                                set.emoticons.forEach(emote => {
                                    this.emotes[emote.name] = {
                                        id: emote.id,
                                        name: emote.name,
                                        image: this.getFFZEmoteUrlV2(emote.urls),
                                        source: 'ffz',
                                        type: 'channel',
                                        animated: emote.animated || false,
                                        modifier: emote.modifier || false,
                                        modifier_flags: emote.modifier_flags || 0,
                                        zeroWidth: false,
                                        usage_count: emote.usage_count || 0,
                                        created_at: emote.created_at,
                                        updated_at: emote.updated_at,
                                        owner: emote.owner ? {
                                            id: emote.owner.id,
                                            name: emote.owner.name,
                                            display_name: emote.owner.display_name
                                        } : null
                                    };
                                    totalEmotes++;
                                });
                            }
                        });
                        console.log('✅ FFZ Channel emotes loaded (API v2):', totalEmotes);
                    }
                })
                .catch(err => {
                    console.log('ℹ️ FFZ channel emotes not available (API v2):', channelID, err.message);
                });
        }
        
        // Загружаем дополнительные FFZ данные
        this.loadFFZAdditionalDataV2();
    }
    
    // Fallback к FFZ API v1 для глобальных эмодзи
    loadFFZEmotesV1Fallback() {
        console.log('🔄 Используем FFZ API v1 fallback для глобальных эмодзи...');
        fetch('https://api.frankerfacez.com/v1/set/global')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.sets && res.sets['3'] && res.sets['3'].emoticons) {
                    res.sets['3'].emoticons.forEach(emote => {
                        this.emotes[emote.name] = {
                            id: emote.id,
                            name: emote.name,
                            image: this.getFFZEmoteUrl(emote.urls),
                            source: 'ffz',
                            type: 'global',
                            animated: emote.animated || false,
                            modifier: emote.modifier || false,
                            modifier_flags: emote.modifier_flags || 0,
                            zeroWidth: false
                        };
                    });
                    console.log('✅ FFZ Global emotes loaded (API v1 fallback):', res.sets['3'].emoticons.length);
                }
            })
            .catch(err => {
                console.warn('❌ FFZ global emotes error (API v1 fallback):', err.message);
            });
    }
    
    // Получение URL эмодзи FFZ с приоритетом качества (API v1)
    getFFZEmoteUrl(urls) {
        // Приоритет: 4x > 2x > 1x
        if (urls['4']) return `https:${urls['4']}`;
        if (urls['2']) return `https:${urls['2']}`;
        if (urls['1']) return `https:${urls['1']}`;
        return null;
    }
    
    // Получение URL эмодзи FFZ с приоритетом качества (API v2)
    getFFZEmoteUrlV2(urls) {
        // API v2 использует другую структуру URLs
        if (urls && typeof urls === 'object') {
            // Приоритет: 4x > 2x > 1x
            if (urls['4']) return urls['4'];
            if (urls['2']) return urls['2'];
            if (urls['1']) return urls['1'];
        }
        return null;
    }
    
    // Загрузка дополнительных данных FFZ (API v2)
    loadFFZAdditionalDataV2() {
        // Загружаем информацию о популярных эмодзи через API v2
        fetch('https://api.frankerfacez.com/v2/emotes?sort=count-desc&per_page=100&page=1')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.emotes && Array.isArray(res.emotes)) {
                    console.log('✅ FFZ Additional emotes loaded (API v2):', res.emotes.length);
                    
                    // Обрабатываем дополнительные эмодзи
                    res.emotes.forEach(emote => {
                        if (!this.emotes[emote.name]) {
                            this.emotes[emote.name] = {
                                id: emote.id,
                                name: emote.name,
                                image: this.getFFZEmoteUrlV2(emote.urls),
                                source: 'ffz',
                                type: 'additional',
                                animated: emote.animated || false,
                                modifier: emote.modifier || false,
                                modifier_flags: emote.modifier_flags || 0,
                                zeroWidth: false,
                                usage_count: emote.usage_count || 0,
                                created_at: emote.created_at,
                                updated_at: emote.updated_at,
                                owner: emote.owner ? {
                                    id: emote.owner.id,
                                    name: emote.owner.name,
                                    display_name: emote.owner.display_name
                                } : null
                            };
                        }
                    });
                }
            })
            .catch(err => {
                console.log('ℹ️ FFZ additional data not available (API v2):', err.message);
                // Fallback к v1 API
                this.loadFFZAdditionalDataV1Fallback();
            });
    }
    
    // Fallback к FFZ API v1 для дополнительных данных
    loadFFZAdditionalDataV1Fallback() {
        console.log('🔄 Используем FFZ API v1 fallback для дополнительных данных...');
        fetch('https://api.frankerfacez.com/v1/emotes')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                if (res.emoticons && Array.isArray(res.emoticons)) {
                    console.log('✅ FFZ Additional emotes loaded (API v1 fallback):', res.emoticons.length);
                    
                    // Обрабатываем дополнительные эмодзи
                    res.emoticons.forEach(emote => {
                        if (!this.emotes[emote.name]) {
                            this.emotes[emote.name] = {
                                id: emote.id,
                                name: emote.name,
                                image: this.getFFZEmoteUrl(emote.urls),
                                source: 'ffz',
                                type: 'additional',
                                animated: emote.animated || false,
                                modifier: emote.modifier || false,
                                modifier_flags: emote.modifier_flags || 0,
                                zeroWidth: false
                            };
                        }
                    });
                }
            })
            .catch(err => {
                console.log('ℹ️ FFZ additional data not available (API v1 fallback):', err.message);
            });
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
                
                // Проверяем, что сообщение из одного из наших каналов
                const messageChannel = message.params[0].toLowerCase().substring(1); // убираем #
                const isFromOurChannel = this.channels.some(ch => ch.toLowerCase() === messageChannel);
                
                if (!isFromOurChannel || !message.params[1]) {
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

                // Сохраняем числовой ID канала при получении первого сообщения
                if (message.tags['room-id'] && !this.channelNumericId) {
                    this.channelNumericId = message.tags['room-id'];
                    console.log('🔢 Получен числовой ID канала из сообщения:', this.channelNumericId);
                    // Загружаем бейджи канала с правильным ID (включая значки сообщества)
                    this.loadChannelBadgesFromTwitch();
                }

                // Добавляем информацию о канале в userData
                const userDataWithChannel = { ...message.tags, sourceChannel: messageChannel };
                this.addChatMessage(nick, message.params[1], userDataWithChannel);
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
        if (messages.length === 0) return;
        
        // Обновляем maxMessages из настроек
        this.maxMessages = this.settings.maxMessages;
        
        // Простая логика: если сообщений больше лимита - удаляем самые старые
        if (messages.length > this.maxMessages) {
            console.log(`📏 Сообщений больше лимита (${messages.length}/${this.maxMessages}), удаляем самые старые...`);
            
            // Удаляем лишние сообщения (самые старые)
            const messagesToRemove = messages.length - this.maxMessages;
            for (let i = 0; i < messagesToRemove; i++) {
                messages[i].remove();
            }
            
            console.log(`🗑️ Удалено ${messagesToRemove} старых сообщений`);
            this.syncMessageCount();
        }
        
        // Проверяем, выходят ли сообщения за границы контейнера
        const chatContainer = this.chatMessagesElement;
        const containerHeight = chatContainer.clientHeight;
        
        // Проверяем, помещаются ли сообщения в контейнер
        let attempts = 0;
        const maxAttempts = 50; // Защита от бесконечного цикла
        
        while (attempts < maxAttempts) {
            const currentMessages = this.chatMessagesElement.querySelectorAll('.message');
            if (currentMessages.length === 0) break;
            
            // Проверяем высоту контейнера
        const containerScrollHeight = chatContainer.scrollHeight;
        
            if (containerScrollHeight <= containerHeight) {
                // Все сообщения помещаются
                break;
            }
            
            // Удаляем сообщение в зависимости от направления чата
            let messageToRemove = null;
            let removeReason = '';
            
            switch (this.settings.chatDirection) {
                case 'top-to-bottom-new-down':
                    // Сверху вниз, новые уходят вниз: удаляем самое старое (первое)
                    messageToRemove = currentMessages[0];
                    removeReason = 'самое старое (сверху вниз, новые вниз)';
                    break;
                case 'top-to-bottom-old-down':
                    // Сверху вниз, старые уходят вниз: удаляем самое новое (последнее)
                    messageToRemove = currentMessages[currentMessages.length - 1];
                    removeReason = 'самое новое (сверху вниз, старые вниз)';
                    break;
                case 'bottom-to-top-new-up':
                    // Снизу вверх, новые уходят наверх: удаляем самое старое (первое)
                    messageToRemove = currentMessages[0];
                    removeReason = 'самое старое (снизу вверх, новые наверх)';
                    break;
                case 'bottom-to-top-old-up':
                    // Снизу вверх, старые уходят наверх: удаляем самое новое (последнее)
                    messageToRemove = currentMessages[currentMessages.length - 1];
                    removeReason = 'самое новое (снизу вверх, старые наверх)';
                    break;
                default:
                    // По умолчанию: удаляем самое старое (первое) сообщение
                    messageToRemove = currentMessages[0];
                    removeReason = 'самое старое (по умолчанию)';
                    break;
            }
            
            if (messageToRemove) {
                this.removeMessageWithAnimation(messageToRemove, `${removeReason} сообщение для освобождения места (попытка ${attempts + 1})`);
                attempts++;
            } else {
                break;
            }
        }
            
        if (attempts > 0) {
            console.log(`🗑️ Удалено ${attempts} сообщений, которые не помещались в контейнер`);
            this.syncMessageCount();
        }
        
        // Разрешаем сообщениям выходить за рамки
        chatContainer.style.overflow = 'visible';
        
        // Проверяем и удаляем сообщения, которые выходят за рамки на 10-20%
        this.removeMessagesOutsideBounds();
    }
    
    removeMessagesOutsideBounds() {
        if (!this.chatMessagesElement) return;
        
        const chatContainer = this.chatMessagesElement;
        const containerRect = chatContainer.getBoundingClientRect();
        const containerTop = containerRect.top;
        const containerBottom = containerRect.bottom;
        
        const messages = this.chatMessagesElement.querySelectorAll('.message');
            let removedCount = 0;
        
        // Определяем направление чата
        const direction = this.settings.chatDirection;
        
        messages.forEach((message, index) => {
                const messageRect = message.getBoundingClientRect();
            const messageTop = messageRect.top;
            const messageBottom = messageRect.bottom;
            
            let shouldRemove = false;
            let reason = '';
            
            switch (direction) {
                case 'top-to-bottom-new-down':
                    // Сверху вниз, новые уходят вниз: удаляем сообщения, которые выходят за нижнюю границу
                    if (messageBottom > containerBottom) {
                        shouldRemove = true;
                        reason = 'выходит за нижнюю границу (новые вниз)';
                    }
                    break;
                case 'top-to-bottom-old-down':
                    // Сверху вниз, старые уходят вниз: удаляем сообщения, которые выходят за нижнюю границу
                    if (messageBottom > containerBottom) {
                        shouldRemove = true;
                        reason = 'выходит за нижнюю границу (старые вниз)';
                    }
                    break;
                case 'bottom-to-top-new-up':
                    // Снизу вверх, новые уходят наверх: удаляем сообщения, которые выходят за верхнюю границу
                    if (messageTop < containerTop) {
                        shouldRemove = true;
                        reason = 'выходит за верхнюю границу (новые наверх)';
                    }
                    break;
                case 'bottom-to-top-old-up':
                    // Снизу вверх, старые уходят наверх: удаляем сообщения, которые выходят за верхнюю границу
                    if (messageTop < containerTop) {
                        shouldRemove = true;
                        reason = 'выходит за верхнюю границу (старые наверх)';
                    }
                    break;
                default:
                    // По умолчанию: удаляем сообщения, которые касаются любой границы
                    if (messageTop < containerTop || messageBottom > containerBottom) {
                        shouldRemove = true;
                        reason = 'касается границы';
                    }
                    break;
            }
            
            if (shouldRemove) {
                this.removeMessageWithAnimation(message, `сообщение ${index + 1}, которое ${reason}`);
                removedCount++;
            }
        });
            
            if (removedCount > 0) {
            console.log(`🗑️ Удалено ${removedCount} сообщений (направление: ${this.settings.chatDirection})`);
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
            
            // Применяем эффекты текста к сообщению
            this.applyTextEffectsToMessage(message);
            
            // Применяем расстояние между сообщениями и смещение по вертикали
            message.style.marginBottom = this.settings.messageSpacing + 'px';
            message.style.transform = `translateY(${this.settings.messageVerticalOffset}px)`;
            
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
            'slide': 'translate3d(-30px, 0, 0)',
            'slide-right': 'translate3d(30px, 0, 0)',
            'slide-up': 'translate3d(0, 30px, 0)',
            'slide-down': 'translate3d(0, -20px, 0)',
            'fade': 'translate3d(0, 0, 0)',
            'bounce': 'scale3d(0.3, 0.3, 0.3)',
            'scale': 'scale3d(0.8, 0.8, 0.8)',
            'rotate': 'rotate3d(0, 0, 1, -90deg)',
            'flip': 'perspective(400px) rotateY(-45deg)',
            'zoom': 'scale3d(0.8, 0.8, 0.8)',
            'elastic': 'scale3d(0.3, 0.3, 0.3)',
            'back': 'translate3d(-20px, 0, 0) scale3d(0.8, 0.8, 0.8)'
        };
        return transformMap[animationType] || 'translate3d(-30px, 0, 0)';
    }
    
    // Универсальная функция для удаления сообщений с анимацией
    removeMessageWithAnimation(messageElement, reason = 'неизвестно') {
        if (!messageElement || !messageElement.parentNode) return;
        
        if (this.settings.disappearAnimation !== 'none') {
            // Применяем анимацию исчезновения
            const animationName = this.getAnimationName(this.settings.disappearAnimation);
            
            console.log(`🎭 Применяем анимацию исчезновения: ${this.settings.disappearAnimation} -> ${animationName}`);
            
            // Сбрасываем только анимации, но сохраняем текущий transform
            messageElement.style.animation = '';
            messageElement.style.animationName = '';
            messageElement.style.animationDuration = '';
            messageElement.style.animationDelay = '';
            messageElement.style.animationFillMode = '';
            messageElement.style.animationTimingFunction = '';
            
            // Убираем классы анимаций появления
            messageElement.classList.remove('no-animation');
            
            // Устанавливаем will-change для оптимизации
            messageElement.style.willChange = 'transform, opacity';
            
            // Применяем новую анимацию исчезновения с плавным easing
            messageElement.style.animation = `${animationName} ${this.settings.disappearDuration}ms cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards`;
            
            console.log(`🗑️ Удаление сообщения с анимацией: ${reason}`);
            
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.style.willChange = 'auto';
                    messageElement.parentNode.removeChild(messageElement);
                    this.syncMessageCount();
                }
            }, this.settings.disappearDuration);
        } else {
            // Если анимация исчезновения отключена, просто удаляем элемент
            console.log(`🗑️ Удаление сообщения без анимации: ${reason}`);
            messageElement.parentNode.removeChild(messageElement);
            this.syncMessageCount();
        }
    }
    
    // Метод fetchTwitchBadges удален - используем только SVG значки
    
    // Метод transformBadgeData удален - используем только SVG значки
    
    // Метод getChannelId удален - используем только SVG значки
    
    // Функция для определения, является ли текст ссылкой
    isLink(text) {
        const linkRegex = /^https?:\/\/[^\s]+$/i;
        return linkRegex.test(text.trim());
    }
    
    // Функция для определения, состоит ли сообщение только из ссылок
    isOnlyLinks(text) {
        const words = text.trim().split(/\s+/);
        return words.length > 0 && words.every(word => this.isLink(word));
    }
    
    
    
    // Метод для добавления сообщений в зависимости от направления чата
    addMessageByDirection(messageElement) {
        switch (this.settings.chatDirection) {
            case 'top-to-bottom-new-down':
                // Сверху вниз, новые уходят вниз: добавляем в конец
                this.chatMessagesElement.appendChild(messageElement);
                break;
            case 'top-to-bottom-old-down':
                // Сверху вниз, старые уходят вниз: добавляем в начало
                this.chatMessagesElement.insertBefore(messageElement, this.chatMessagesElement.firstChild);
                break;
            case 'bottom-to-top-new-up':
                // Снизу вверх, новые уходят наверх: добавляем в начало
                this.chatMessagesElement.insertBefore(messageElement, this.chatMessagesElement.firstChild);
                break;
            case 'bottom-to-top-old-up':
                // Снизу вверх, старые уходят наверх: добавляем в конец
                this.chatMessagesElement.appendChild(messageElement);
                break;
            default:
                // По умолчанию добавляем в конец
                this.chatMessagesElement.appendChild(messageElement);
                break;
        }
    }
    
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
        if (userData.sourceChannel) {
            messageElement.setAttribute('data-source-channel', userData.sourceChannel);
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
            
            // Применяем анимацию появления с плавным easing
            messageElement.style.animation = `${animationName} ${animationDuration} cubic-bezier(0.25, 0.46, 0.45, 0.94) ${animationDelay} forwards`;
            
            // Fallback: если анимация не сработает, показываем элемент через некоторое время
            setTimeout(() => {
                if (messageElement.style.opacity === '0' || getComputedStyle(messageElement).opacity === '0') {
                    messageElement.style.opacity = '1';
                    messageElement.style.transform = 'translate3d(0, 0, 0)';
                    messageElement.style.animation = '';
                    messageElement.style.willChange = 'auto';
                }
            }, this.settings.appearDuration + this.settings.appearDelay + 50);
        } else {
            // Если анимация отключена или выбрана "Нет", просто показываем элемент
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translate3d(0, 0, 0)';
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
        
        // Применяем эффекты текста к сообщению
        this.applyTextEffectsToMessage(messageElement);
        
        // Применяем расстояние между сообщениями и смещение по вертикали
        messageElement.style.marginBottom = this.settings.messageSpacing + 'px';
        messageElement.style.transform = `translateY(${this.settings.messageVerticalOffset}px)`;
        
        // Определяем цвет пользователя
        const userColor = userData.color || this.getDefaultUserColor(username);
        
        // Создаем бейджики
        const badges = this.createUserBadges(userData, username);
        
        // Используем display-name если есть, иначе username
        const displayName = userData['display-name'] || username;
        
        // Добавляем значок канала для общего чата
        let channelBadge = '';
        if (this.sharedChatInfo && this.sharedChatInfo.isShared && userData.sourceChannel) {
            // Проверяем, что сообщение пришло не из основного канала
            if (userData.sourceChannel.toLowerCase() !== this.channel.toLowerCase()) {
                // Получаем аватарку канала
                const channelAvatar = this.getChannelAvatar(userData.sourceChannel);
                channelBadge = `<span class="channel-badge" title="Канал: ${userData.sourceChannel}">${channelAvatar}</span>`;
                console.log('🎯 Добавляем аватарку канала для общего чата:', userData.sourceChannel);
            }
        }
        
        // Модерация ссылок
        // Скрываем сообщения только из ссылок (если включено)
        if (this.settings.hideLinkOnlyMessages && this.isOnlyLinks(text)) {
            console.log('🚫 Сообщение с одними ссылками заблокировано:', text);
            return;
        }
        
        // Обрабатываем эмодзи в тексте сообщения
        let processedText = this.processEmotes(text, userData);
        
        // Обработка ACTION сообщений (/me)
        let messageHtml = '';
        if (/^\x01ACTION.*\x01$/.test(text)) {
            const actionText = text.replace(/^\x01ACTION/, '').replace(/\x01$/, '').trim();
            const processedActionText = this.processEmotes(actionText, userData);
            messageHtml = `<span class="username" style="color: ${userColor}">${channelBadge}${badges}${this.escapeHtml(displayName)}</span><span class="text" style="color: ${userColor}">${processedActionText}</span>`;
        } else {
            messageHtml = `<span class="username" style="color: ${userColor}">${channelBadge}${badges}${this.escapeHtml(displayName)}:</span> <span class="text">${processedText}</span>`;
        }
        
        messageElement.innerHTML = messageHtml;
        
        // Добавляем сообщение в зависимости от направления чата
        this.addMessageByDirection(messageElement);
        this.messageCount++;
    
        
        // Синхронизируем счетчик с реальным количеством сообщений
        this.syncMessageCount();
        
        // Ограничиваем количество видимых сообщений в чате с небольшой задержкой
        setTimeout(() => {
        this.limitChatMessages();
        }, 50);
        
        // Если включено исчезновение сообщений, удаляем их через некоторое время
        if (this.settings.fadeMessages) {
            const totalDisplayTime = this.settings.messageDisplayTime * 1000;
            setTimeout(() => {
                this.removeMessageWithAnimation(messageElement, 'автоматическое удаление по таймеру');
            }, totalDisplayTime);
        }
        
        // Синхронизируем счетчик и ограничиваем количество сообщений
        this.syncMessageCount();
        this.limitChatMessages();
        
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
        
        // Обработка Twitch бейджей из IRC тегов (новая система)
        if (typeof(userData.badges) === 'string') {
            console.log('🏷️ Обрабатываем бейджи пользователя:', userData.badges);
            
            userData.badges.split(',').forEach(badge => {
                const [badgeType, badgeVersion] = badge.split('/');
                console.log('🏷️ Обрабатываем бейдж:', badgeType, badgeVersion);
                
                // Используем новую систему бейджей
                const badgeKey = `${badgeType}/${badgeVersion}`;
                if (this.badges[badgeKey]) {
                    const badgeData = this.badges[badgeKey];
                    badgeElements.push(`<img class="badge" src="${badgeData.image}" alt="${badgeData.title}" title="${badgeData.description}" />`);
                    console.log('✅ Бейдж найден в кэше:', badgeKey);
                    } else {
                    // Fallback на базовые ролевые значки для канала
                    const fallbackBadge = this.getFallbackBadge(badgeType);
                    if (fallbackBadge) {
                        badgeElements.push(fallbackBadge);
                        console.log('🔄 Используем fallback бейдж для роли:', badgeType);
                    } else {
                        // Fallback на старую систему
                        this.loadBadgeDirectly(badgeType, badgeVersion, badgeElements);
                    }
                }
            });
        }
        
        // Добавляем пользовательские бейджи (BTTV, Chatterino)
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
        
        return badgeElements.join('');
    }
    
    getBadgeUrl(badgeType, badgeVersion) {
        // Используем новую систему бейджей
        return this.getBadgeUrlNew(badgeType, badgeVersion);
    }
    
    // Загружаем пользовательские бейджи (BTTV, Chatterino)
    loadUserBadges(nick, userId) {
        if (!this.userBadges) this.userBadges = {};
        this.userBadges[nick] = [];
        
        
        
        // BTTV бейджи - используем актуальный API
        if (this.bttvBadges && this.bttvBadges.length > 0) {
            this.bttvBadges.forEach(user => {
                if (user.name === nick) {
                    const userBadge = {
                        description: user.badge.description,
                        url: user.badge.svg,
                        source: 'bttv',
                        type: 'user'
                    };
                    if (!this.userBadges[nick].includes(userBadge)) {
                        this.userBadges[nick].push(userBadge);
                        console.log('🎭 BTTV бейдж загружен для пользователя:', nick, userBadge.description);
                    }
                }
            });
        }
        
        // Загружаем дополнительные BTTV данные пользователя
        this.loadBTTVUserData(nick, userId);
        
        // Загружаем дополнительные FFZ данные пользователя
        this.loadFFZUserData(nick, userId);
        
        // Загружаем дополнительные 7TV данные пользователя
        this.load7TVUserData(nick, userId);
        
        
        // Chatterino бейджи
        if (this.chatterinoBadges) {
            this.chatterinoBadges.forEach(badge => {
                badge.users.forEach(user => {
                    if (user === userId) {
                        const userBadge = {
                            description: badge.tooltip,
                            url: badge.image3 || badge.image2 || badge.image1,
                            source: 'chatterino',
                            type: 'user'
                        };
                        if (!this.userBadges[nick].includes(userBadge)) {
                            this.userBadges[nick].push(userBadge);
                            console.log('💬 Chatterino бейдж загружен для пользователя:', nick, userBadge.description);
                        }
                    }
                });
            });
        }
        
        // FFZ бейджи - используем актуальный API
        if (this.ffzBadges && Object.keys(this.ffzBadges).length > 0) {
            Object.entries(this.ffzBadges).forEach(([badgeId, badge]) => {
                if (badge.users && badge.users.includes(userId)) {
                    const userBadge = {
                        description: badge.description || `FFZ Badge ${badgeId}`,
                        url: badge.image,
                        source: 'ffz',
                        type: 'user',
                        id: badgeId
                    };
                    if (!this.userBadges[nick].includes(userBadge)) {
                        this.userBadges[nick].push(userBadge);
                        console.log('🎨 FFZ бейдж загружен для пользователя:', nick, userBadge.description);
                    }
                }
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
    
    getBadgeTitle(badgeType, badgeVersion) {
        const titles = {
            'broadcaster': 'Стример',
            'moderator': 'Модератор',
            'vip': 'VIP',
            'subscriber': `Подписчик (${badgeVersion} мес.)`
        };
        
        return titles[badgeType] || badgeType;
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
        
        // Обработка эмодзи из всех источников (BTTV, 7TV, FFZ)
        if (this.emotes) {
        Object.entries(this.emotes).forEach(emote => {
                if (message.search(this.escapeRegExp(emote[0])) > -1) {
                    let emoteClass = 'emote';
                    let emoteAttributes = '';
                    
                    // Добавляем класс источника эмодзи
                    if (emote[1].source) {
                        emoteClass += ` emote-${emote[1].source}`;
                    }
                    
                    // Обработка zero-width эмодзи
                    if (emote[1].zeroWidth) {
                        emoteAttributes += ' data-zw="true"';
                    }
                    
                    // Обработка upscale эмодзи (для BTTV)
                if (emote[1].upscale) {
                        emoteClass += ' upscale';
                    }
                    
                    replacements[emote[0]] = `<img class="${emoteClass}" src="${emote[1].image}"${emoteAttributes} />`;
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
                const emoteHtml = `<img src="${emoteData.url}" class="emote" alt="${emoteData.name}" title="${emoteData.name}" />`;
                processedText = processedText.replace(regex, emoteHtml);
            }
        }
        
        return processedText;
    }
    
    // Экранируем специальные символы для регулярных выражений
    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        
        this.addMessageByDirection(messageElement);
        this.chatMessagesElement.scrollTop = this.chatMessagesElement.scrollHeight;
        console.log('System message added to DOM');
    }
    
    
    showError(message) {
        console.error(message);
        // Показываем ошибку в чате только для критичных ошибок
        if (message.includes('аутентификации') || message.includes('не найден') || message.includes('загрузке канала')) {
        this.addSystemMessage(`❌ Ошибка: ${message}`);
        }
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
    
    
    // Fallback глобальные бейджи на случай ошибки API
    loadFallbackGlobalBadges() {
        console.log('🔄 Загружаем fallback глобальные бейджи');
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
            console.log('✅ Создан кэш для глобальных бейджей');
        }
        
        // Актуальные глобальные бейджи Twitch (2024)
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
            },
            'premium': {
                set_id: 'premium',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fd0c0fd214/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fd0c0fd214/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/bbbe0db0-a598-423e-86d0-f9fd0c0fd214/3'
                    }
                }
            },
            'bits': {
                set_id: 'bits',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-5f0e5b5b5b5b/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-5f0e5b5b5b5b/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/73b5c3fb-24f9-4a82-a852-5f0e5b5b5b5b/3'
                    }
                }
            }
        };
        
        this.badgeCache.get('global').global = fallbackGlobalBadges;
        console.log('✅ Fallback глобальные бейджи загружены:', Object.keys(fallbackGlobalBadges));
        console.log('📋 Кэш глобальных бейджей:', this.badgeCache.get('global'));
        
    }
    
    // Упрощенная загрузка бейджа напрямую через Twitch API
    loadBadgeDirectly(badgeType, badgeVersion, badgeElements) {
        console.log('🔄 Загружаем бейдж напрямую:', badgeType, badgeVersion);
        
        // Сначала проверяем кэш
        const badgeUrl = this.getBadgeUrlFromCache(badgeType, badgeVersion);
        if (badgeUrl) {
            badgeElements.push(`<img class="badge" src="${badgeUrl}" alt="${badgeType}" title="${badgeType}" />`);
            console.log('✅ Бейдж найден в кэше:', badgeType);
            return;
        }
        
        // Если нет в кэше, загружаем через API
        this.loadBadgeFromTwitchAPI(badgeType, badgeVersion, badgeElements);
    }
    
    // Получение URL бейджа из кэша
    getBadgeUrlFromCache(badgeType, badgeVersion) {
        // Проверяем глобальный кэш
        const globalCache = this.badgeCache.get('global');
        if (globalCache && globalCache.global[badgeType]) {
            const badgeData = globalCache.global[badgeType];
            if (badgeData.versions && badgeData.versions[badgeVersion]) {
                return badgeData.versions[badgeVersion].image_url_1x;
            }
        }
        
        // Проверяем кэш канала
        const channelId = this.channelId || 'global';
        const channelCache = this.badgeCache.get(channelId);
        if (channelCache && channelCache.channel[badgeType]) {
            const badgeData = channelCache.channel[badgeType];
            if (badgeData.versions && badgeData.versions[badgeVersion]) {
                return badgeData.versions[badgeVersion].image_url_1x;
            }
        }
        
        return null;
    }
    
    // Получение числового ID канала
    getChannelNumericId() {
        // Если уже сохранен числовой ID канала
        if (this.channelNumericId) {
            return this.channelNumericId;
        }
        
        // Ищем ID канала в последних сообщениях
        if (this.chatMessages && this.chatMessages.length > 0) {
            for (let i = this.chatMessages.length - 1; i >= 0; i--) {
                const message = this.chatMessages[i];
                if (message.roomId) {
                    this.channelNumericId = message.roomId;
                    console.log('✅ Сохранен числовой ID канала:', this.channelNumericId);
                    return this.channelNumericId;
                }
            }
        }
        return null;
    }
    
    // Загрузка бейджа через Twitch API
    loadBadgeFromTwitchAPI(badgeType, badgeVersion, badgeElements) {
        console.log('🌐 Загружаем бейдж через Twitch API:', badgeType);
        
        const headers = {
            'Client-ID': this.twitchClientId
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
            console.log('🔐 Используем OAuth токен для авторизации');
        } else {
            console.log('⚠️ OAuth токен не установлен, используем только Client-ID');
        }
        
        // Определяем, глобальный это бейдж или канальный
        const channelRoleBadges = ['broadcaster', 'moderator', 'vip', 'subscriber'];
        const isChannelBadge = channelRoleBadges.includes(badgeType);
        
        let apiUrl;
        if (isChannelBadge) {
            // Канальные бейджи - используем числовой ID канала
            const channelNumericId = this.getChannelNumericId();
            if (channelNumericId) {
                apiUrl = `https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channelNumericId}`;
            } else {
                // Если нет числового ID, используем fallback
                console.log('⚠️ Нет числового ID канала, используем fallback для канального бейджа');
                this.addFallbackBadge(badgeType, badgeVersion, badgeElements);
                return;
            }
        } else {
            // Глобальные бейджи
            apiUrl = 'https://api.twitch.tv/helix/chat/badges/global';
        }
        
        fetch(apiUrl, { headers })
            .then(response => {
                console.log('📡 Ответ от API:', response.status, response.statusText);
                if (!response.ok) {
                    if (response.status === 401) {
                        console.error('❌ Ошибка авторизации (401). Проверьте OAuth токен.');
                    } else if (response.status === 400) {
                        console.error('❌ Ошибка запроса (400). Проверьте параметры запроса.');
                    }
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('✅ Получены данные бейджей от Twitch API:', data);
                
                if (data.data && data.data.length > 0) {
                    // Ищем нужный бейдж
                    const badgeSet = data.data.find(set => set.set_id === badgeType);
                    if (badgeSet && badgeSet.versions) {
                        const version = badgeSet.versions.find(v => v.id === badgeVersion);
                        if (version) {
                            const badgeUrl = version.image_url_1x;
                            console.log('✅ Найден URL бейджа:', badgeUrl);
                            
                            // Добавляем в кэш
                            this.addBadgeToCache(badgeType, badgeSet);
                            
                            // Добавляем в DOM
                            badgeElements.push(`<img class="badge" src="${badgeUrl}" alt="${badgeType}" title="${badgeType}" />`);
                            return;
                        }
                    }
                }
                
                // Если не найден, используем fallback
                console.log('⚠️ Бейдж не найден в API, используем fallback');
                this.addFallbackBadge(badgeType, badgeVersion, badgeElements);
            })
            .catch(error => {
                console.error('❌ Ошибка загрузки бейджа через API:', error);
                this.addFallbackBadge(badgeType, badgeVersion, badgeElements);
            });
    }
    
    
    // Добавление бейджа в кэш
    addBadgeToCache(badgeType, badgeData) {
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
        }
        
        const globalCache = this.badgeCache.get('global').global;
        globalCache[badgeType] = badgeData;
        console.log('✅ Бейдж добавлен в кэш:', badgeType, badgeData);
    }
    
    // Добавление fallback бейджа
    addFallbackBadge(badgeType, badgeVersion, badgeElements) {
        console.log('🔄 Добавляем fallback бейдж:', badgeType);
        
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
        }
        
        const globalCache = this.badgeCache.get('global').global;
        
        // Создаем fallback бейдж с базовым URL
        const fallbackUrl = `https://static-cdn.jtvnw.net/badges/v1/${badgeType}/1`;
        globalCache[badgeType] = {
            set_id: badgeType,
            versions: {
                [badgeVersion || '1']: {
                    id: badgeVersion || '1',
                    image_url_1x: fallbackUrl,
                    image_url_2x: fallbackUrl,
                    image_url_4x: fallbackUrl
                }
            }
        };
        
        // Добавляем в DOM
        if (badgeElements) {
            badgeElements.push(`<img class="badge" src="${fallbackUrl}" alt="${badgeType}" title="${badgeType}" />`);
        }
        
        console.log('✅ Fallback бейдж добавлен:', badgeType);
    }
    
    
    
    
    // Загрузка дополнительных бейджей - используем API как в jChat
    loadAdditionalBadges() {
        // Сначала загружаем fallback глобальные бейджи для немедленного использования
        this.loadFallbackGlobalBadges();
        
        // Затем пытаемся загрузить актуальные глобальные бейджи Twitch
        this.loadTwitchGlobalBadges();
        
        
        // BTTV бейджи - используем актуальный API
        fetch('https://api.betterttv.net/3/cached/badges')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                this.bttvBadges = res || [];
                console.log('✅ BTTV badges loaded:', this.bttvBadges.length);
                
                // Анализируем загруженные BTTV бейджи
                if (this.bttvBadges.length > 0) {
                    console.log('🎭 BTTV бейджи доступны для пользователей:', this.bttvBadges.map(b => b.name).join(', '));
                }
            })
            .catch(err => {
                console.warn('❌ BTTV badges error:', err.message);
                this.bttvBadges = [];
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
                console.log('✅ Chatterino badges loaded:', this.chatterinoBadges.length);
            })
            .catch(err => {
                console.warn('❌ Chatterino badges error:', err.message);
                this.chatterinoBadges = [];
            });
        
        // FFZ бейджи - используем актуальный API
        fetch('https://api.frankerfacez.com/v1/badges')
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(res => {
                this.ffzBadges = res.badges || {};
                console.log('✅ FFZ badges loaded:', Object.keys(this.ffzBadges).length);
                
                // Анализируем загруженные FFZ бейджи
                if (Object.keys(this.ffzBadges).length > 0) {
                    console.log('🎨 FFZ бейджи доступны:', Object.keys(this.ffzBadges).join(', '));
                }
            })
            .catch(err => {
                console.warn('❌ FFZ badges error:', err.message);
                this.ffzBadges = {};
            });
    }
    
    // Загрузка бейджей канала Twitch согласно официальной документации
    loadTwitchChannelBadges(channelId) {
        if (!channelId || channelId === 'global') {
            console.log('No channel ID for badges, skipping channel badges');
            return;
        }
        
        // Получаем числовой ID канала
        const numericChannelId = this.getChannelNumericId();
        if (!numericChannelId) {
            console.log('⚠️ Числовой ID канала не найден, используем fallback бейджи');
            return;
        }
        
        console.log('🔢 Используем числовой ID канала для API:', numericChannelId);
        
        const headers = {
            'Client-ID': this.twitchClientId,
            'Accept': 'application/vnd.twitchtv.v5+json'
        };
        
        // Добавляем OAuth токен если есть
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
            console.log('🔐 Используем OAuth токен для загрузки бейджей канала');
        } else {
            console.log('⚠️ OAuth токен не установлен, используем только Client-ID');
        }
        
        // Используем новый Helix API v5
        fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${numericChannelId}`, {
            headers: headers
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
        
    }
    
    // Функции для управления каналами
    addChannel(channelName) {
        if (!this.channels.includes(channelName)) {
            this.channels.push(channelName);
            console.log('Added channel:', channelName);
            
            // Если подключены, присоединяемся к новому каналу
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send('JOIN #' + channelName.toLowerCase() + '\r\n');
            }
        }
    }
    
    removeChannel(channelName) {
        const index = this.channels.indexOf(channelName);
        if (index > -1) {
            this.channels.splice(index, 1);
            console.log('Removed channel:', channelName);
            
            // Если подключены, покидаем канал
            if (this.socket && this.socket.readyState === WebSocket.OPEN) {
                this.socket.send('PART #' + channelName.toLowerCase() + '\r\n');
            }
        }
    }
    
    getChannels() {
        return [...this.channels];
    }
    
    // Получение аватарки канала
    getChannelAvatar(channelName) {
        // Кэш аватарок каналов
        if (!this.channelAvatars) {
            this.channelAvatars = new Map();
        }
        
        // Если аватарка уже загружена, возвращаем её
        if (this.channelAvatars.has(channelName)) {
            return this.channelAvatars.get(channelName);
        }
        
        // Загружаем аватарку канала
        this.loadChannelAvatar(channelName);
        
        // Возвращаем временную иконку
        return `<img class="channel-avatar" src="https://static-cdn.jtvnw.net/jtv_user_pictures/${channelName}-profile_image-70x70.png" alt="${channelName}" title="${channelName}" style="width: 1.3em; height: 1.3em; border-radius: 50%; vertical-align: middle; margin-right: 2px; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';" /><span style="display: none;">📺</span>`;
    }
    
    // Функция для определения общего чата и получения информации о каналах-участниках
    async detectSharedChat(channelName) {
        try {
            console.log('🔍 Проверяем общий чат для канала:', channelName);
            
            // Получаем информацию о канале через Twitch API
            const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${channelName}`, {
                headers: {
                    'Client-ID': this.twitchClientId,
                    'Authorization': `Bearer ${this.twitchOAuthToken}`
                }
            });
            
            if (!response.ok) {
                console.log('❌ Ошибка получения информации о канале:', response.status);
                return null;
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const stream = data.data[0];
                console.log('📺 Информация о стриме:', stream);
                
                // Проверяем, есть ли информация об общем чате в тегах или названии
                if (stream.tags && stream.tags.some(tag => tag.toLowerCase().includes('shared') || tag.toLowerCase().includes('collab'))) {
                    console.log('🎯 Обнаружен общий чат!');
                    
                    // Пытаемся извлечь информацию о каналах-участниках из названия или тегов
                    const sharedChannels = this.extractSharedChannels(stream.title, stream.tags);
                    
                    if (sharedChannels.length > 1) {
                        this.sharedChatInfo = {
                            isShared: true,
                            channels: sharedChannels,
                            mainChannel: channelName,
                            streamTitle: stream.title
                        };
                        
                        console.log('✅ Общий чат обнаружен:', this.sharedChatInfo);
                        
                        // Загружаем аватарки всех каналов-участников
                        await this.loadChannelAvatars(sharedChannels);
                        
                        return this.sharedChatInfo;
                    }
                }
            }
            
            console.log('ℹ️ Обычный чат, не общий');
            this.sharedChatInfo = { isShared: false, mainChannel: channelName };
            return this.sharedChatInfo;
            
        } catch (error) {
            console.error('❌ Ошибка при определении общего чата:', error);
            this.sharedChatInfo = { isShared: false, mainChannel: channelName };
            return this.sharedChatInfo;
        }
    }

    // Извлечение каналов-участников из названия стрима или тегов
    extractSharedChannels(title, tags) {
        const channels = [];
        
        // Ищем упоминания каналов в названии (например: "Collab with @channel1 @channel2 @channel3")
        const titleMatches = title.match(/@(\w+)/g);
        if (titleMatches) {
            titleMatches.forEach(match => {
                const channel = match.substring(1); // убираем @
                if (!channels.includes(channel.toLowerCase())) {
                    channels.push(channel.toLowerCase());
                }
            });
        }
        
        // Ищем в тегах
        if (tags) {
            tags.forEach(tag => {
                if (tag.toLowerCase().includes('collab') || tag.toLowerCase().includes('shared') || tag.toLowerCase().includes('multi')) {
                    // Пытаемся извлечь каналы из тега
                    const tagMatches = tag.match(/(\w+)/g);
                    if (tagMatches) {
                        tagMatches.forEach(match => {
                            if (match.length > 2 && !channels.includes(match.toLowerCase())) {
                                channels.push(match.toLowerCase());
                            }
                        });
                    }
                }
            });
        }
        
        // Дополнительные паттерны для множественных каналов
        const multiChannelPatterns = [
            /collab with ([\w\s,]+)/gi,
            /streaming with ([\w\s,]+)/gi,
            /multi-stream ([\w\s,]+)/gi,
            /shared stream ([\w\s,]+)/gi
        ];
        
        multiChannelPatterns.forEach(pattern => {
            const matches = title.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    // Извлекаем каналы из найденного текста
                    const channelText = match.replace(/^(collab with|streaming with|multi-stream|shared stream)\s+/gi, '');
                    const foundChannels = channelText.split(/[,\s]+/).filter(ch => ch.length > 2);
                    foundChannels.forEach(channel => {
                        if (!channels.includes(channel.toLowerCase())) {
                            channels.push(channel.toLowerCase());
                        }
                    });
                });
            }
        });
        
        return channels;
    }

    // Загрузка аватарок каналов-участников
    async loadChannelAvatars(channels) {
        console.log('🖼️ Загружаем аватарки каналов:', channels);
        
        for (const channel of channels) {
            try {
                const avatarUrl = `https://static-cdn.jtvnw.net/jtv_user_pictures/${channel}-profile_image-70x70.png`;
                this.channelAvatars.set(channel.toLowerCase(), avatarUrl);
                console.log(`✅ Аватарка загружена для ${channel}:`, avatarUrl);
            } catch (error) {
                console.error(`❌ Ошибка загрузки аватарки для ${channel}:`, error);
            }
        }
    }

    // Создание тестового общего чата с каналами CriLeaf и Moonaticks
    createTestSharedChat() {
        console.log('🧪 Создаем тестовый общий чат с каналами CriLeaf и Moonaticks');
        
        this.sharedChatInfo = {
            isShared: true,
            channels: ['crileaf', 'moonaticks'],
            mainChannel: this.channel,
            streamTitle: 'Collab with @crileaf @moonaticks'
        };
        
        // Загружаем аватарки тестовых каналов
        this.loadChannelAvatars(['crileaf', 'moonaticks']);
        
        console.log('✅ Тестовый общий чат создан:', this.sharedChatInfo);
    }

    // Создание тестового общего чата с произвольными каналами
    createTestSharedChatWithChannels(channel1, channel2) {
        console.log('🧪 Создаем тестовый общий чат с каналами:', channel1, 'и', channel2);
        
        this.sharedChatInfo = {
            isShared: true,
            channels: [channel1.toLowerCase(), channel2.toLowerCase()],
            mainChannel: this.channel,
            streamTitle: `Collab with @${channel1} @${channel2}`
        };
        
        // Загружаем аватарки указанных каналов
        this.loadChannelAvatars([channel1.toLowerCase(), channel2.toLowerCase()]);
        
        console.log('✅ Тестовый общий чат создан:', this.sharedChatInfo);
    }

    // Создание тестового общего чата с множественными каналами
    createTestSharedChatWithMultipleChannels(channels) {
        console.log('🧪 Создаем тестовый общий чат с каналами:', channels);
        
        const lowerChannels = channels.map(ch => ch.toLowerCase());
        const channelMentions = channels.map(ch => `@${ch}`).join(' ');
        
        this.sharedChatInfo = {
            isShared: true,
            channels: lowerChannels,
            mainChannel: this.channel,
            streamTitle: `Collab with ${channelMentions}`
        };
        
        // Загружаем аватарки всех указанных каналов
        this.loadChannelAvatars(lowerChannels);
        
        console.log('✅ Тестовый общий чат создан:', this.sharedChatInfo);
    }

    // Добавление тестовых сообщений для общего чата
    addTestSharedChatMessages() {
        console.log('📝 Добавляем тестовые сообщения для общего чата');
        
        // Сообщения от пользователей канала CriLeaf
        this.addChatMessage('CriLeafUser1', 'Привет из чата CriLeaf! 👋', {
            'display-name': 'CriLeafUser1',
            'color': '#ff6b6b',
            'badges': 'subscriber/12',
            'sourceChannel': 'crileaf'
        });
        
        this.addChatMessage('CriLeafUser2', 'Как дела у всех? 😊', {
            'display-name': 'CriLeafUser2',
            'color': '#4CAF50',
            'badges': 'moderator/1',
            'sourceChannel': 'crileaf'
        });
        
        // Сообщения от пользователей канала Moonaticks
        this.addChatMessage('MoonaticksUser1', 'Привет из чата Moonaticks! 🌙', {
            'display-name': 'MoonaticksUser1',
            'color': '#9C27B0',
            'badges': 'subscriber/6',
            'sourceChannel': 'moonaticks'
        });
        
        this.addChatMessage('MoonaticksUser2', 'Отличный коллаб! 🎉', {
            'display-name': 'MoonaticksUser2',
            'color': '#FF9800',
            'badges': 'vip/1',
            'sourceChannel': 'moonaticks'
        });
        
        // Сообщения от пользователей основного канала
        this.addChatMessage('MainChannelUser', 'Круто видеть общий чат! 🚀', {
            'display-name': 'MainChannelUser',
            'color': '#00BCD4',
            'badges': 'broadcaster/1',
            'sourceChannel': this.channel
        });
    }

    // Добавление тестовых сообщений для общего чата с произвольными каналами
    addTestSharedChatMessagesWithChannels(channel1, channel2) {
        console.log('📝 Добавляем тестовые сообщения для общего чата с каналами:', channel1, 'и', channel2);
        
        // Сообщения от пользователей первого канала
        this.addChatMessage(`${channel1}User1`, `Привет из чата ${channel1}! 👋`, {
            'display-name': `${channel1}User1`,
            'color': '#ff6b6b',
            'badges': 'subscriber/12',
            'sourceChannel': channel1.toLowerCase()
        });
        
        this.addChatMessage(`${channel1}User2`, 'Как дела у всех? 😊', {
            'display-name': `${channel1}User2`,
            'color': '#4CAF50',
            'badges': 'moderator/1',
            'sourceChannel': channel1.toLowerCase()
        });
        
        // Сообщения от пользователей второго канала
        this.addChatMessage(`${channel2}User1`, `Привет из чата ${channel2}! 🌟`, {
            'display-name': `${channel2}User1`,
            'color': '#9C27B0',
            'badges': 'subscriber/6',
            'sourceChannel': channel2.toLowerCase()
        });
        
        this.addChatMessage(`${channel2}User2`, 'Отличный коллаб! 🎉', {
            'display-name': `${channel2}User2`,
            'color': '#FF9800',
            'badges': 'vip/1',
            'sourceChannel': channel2.toLowerCase()
        });
        
        // Сообщения от пользователей основного канала
        this.addChatMessage('MainChannelUser', 'Круто видеть общий чат! 🚀', {
            'display-name': 'MainChannelUser',
            'color': '#00BCD4',
            'badges': 'broadcaster/1',
            'sourceChannel': this.channel
        });
        
        // Дополнительные сообщения для демонстрации
        this.addChatMessage(`${channel1}User3`, 'Это работает отлично! 👍', {
            'display-name': `${channel1}User3`,
            'color': '#E91E63',
            'badges': 'subscriber/3',
            'sourceChannel': channel1.toLowerCase()
        });
        
        this.addChatMessage(`${channel2}User3`, 'Аватарки каналов выглядят круто! 🔥', {
            'display-name': `${channel2}User3`,
            'color': '#795548',
            'badges': 'subscriber/9',
            'sourceChannel': channel2.toLowerCase()
        });
    }

    // Добавление тестовых сообщений для общего чата с множественными каналами
    addTestSharedChatMessagesWithMultipleChannels(channels) {
        console.log('📝 Добавляем тестовые сообщения для общего чата с каналами:', channels);
        
        const colors = ['#ff6b6b', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63', '#795548', '#607D8B'];
        const badges = ['subscriber/12', 'moderator/1', 'subscriber/6', 'vip/1', 'subscriber/3', 'subscriber/9', 'subscriber/15', 'subscriber/24'];
        
        // Добавляем сообщения от каждого канала
        channels.forEach((channel, index) => {
            const color = colors[index % colors.length];
            const badge = badges[index % badges.length];
            
            // Первое сообщение от канала
            this.addChatMessage(`${channel}User1`, `Привет из чата ${channel}! 👋`, {
                'display-name': `${channel}User1`,
                'color': color,
                'badges': badge,
                'sourceChannel': channel.toLowerCase()
            });
            
            // Второе сообщение от канала
            this.addChatMessage(`${channel}User2`, `Крутой коллаб с ${channels.length} каналами! 🎉`, {
                'display-name': `${channel}User2`,
                'color': colors[(index + 1) % colors.length],
                'badges': badges[(index + 1) % badges.length],
                'sourceChannel': channel.toLowerCase()
            });
        });
        
        // Сообщения от пользователей основного канала
        this.addChatMessage('MainChannelUser', `Общий чат с ${channels.length} каналами работает отлично! 🚀`, {
            'display-name': 'MainChannelUser',
            'color': '#00BCD4',
            'badges': 'broadcaster/1',
            'sourceChannel': this.channel
        });
        
        // Дополнительные сообщения для демонстрации
        channels.forEach((channel, index) => {
            if (index < 3) { // Ограничиваем количество дополнительных сообщений
                this.addChatMessage(`${channel}User3`, `Аватарки всех ${channels.length} каналов выглядят круто! 🔥`, {
                    'display-name': `${channel}User3`,
                    'color': colors[(index + 2) % colors.length],
                    'badges': badges[(index + 2) % badges.length],
                    'sourceChannel': channel.toLowerCase()
                });
            }
        });
    }

    // Загрузка аватарки канала
    async loadChannelAvatar(channelName) {
        try {
            const response = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
                headers: {
                    'Client-ID': this.twitchClientId
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.length > 0) {
                    const user = data.data[0];
                    const avatarUrl = user.profile_image_url;
                    
                    // Сохраняем аватарку в кэш
                    this.channelAvatars.set(channelName, 
                        `<img class="channel-avatar" src="${avatarUrl}" alt="${channelName}" title="${channelName}" style="width: 1.3em; height: 1.3em; border-radius: 50%; vertical-align: middle; margin-right: 2px; object-fit: cover;" />`
                    );
                    
                    // Обновляем все сообщения с этим каналом
                    this.updateChannelAvatars(channelName);
                }
            }
        } catch (error) {
            console.warn('Ошибка загрузки аватарки канала:', channelName, error);
        }
    }
    
    // Обновление аватарок канала в существующих сообщениях
    updateChannelAvatars(channelName) {
        const messages = this.chatMessagesElement.querySelectorAll(`[data-source-channel="${channelName}"]`);
        messages.forEach(message => {
            const channelBadge = message.querySelector('.channel-badge');
            if (channelBadge) {
                channelBadge.innerHTML = this.channelAvatars.get(channelName);
            }
        });
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        this.isConnected = false;
        
        // Очищаем состояние коллаба при отключении
        this.clearSharedChatState();
    }
    
    // Функция для очистки состояния коллаба
    clearSharedChatState() {
        console.log('🧹 Очищаем состояние коллаба...');
        
        // Сбрасываем информацию о коллабе
        this.sharedChatInfo = null;
        
        // Очищаем кэш аватарок каналов
        this.channelAvatars.clear();
        
        // Очищаем список каналов-участников
        this.sharedChannels = [];
        
        console.log('✅ Состояние коллаба очищено');
    }
    
    // НОВАЯ СИСТЕМА БЕЙДЖЕЙ - Загрузка всех бейджей с Twitch API
    loadAllBadges() {
        console.log('🚀 Загружаем все бейджи с Twitch API...');
        
        // Инициализируем кэш бейджей
        if (!this.badgeCache.has('global')) {
            this.badgeCache.set('global', { global: {}, channel: {} });
        }
        
        // Загружаем fallback бейджи для немедленного использования
        this.loadFallbackBadges();
        
        // Загружаем глобальные бейджи
        this.loadGlobalBadgesFromTwitch();
        
        // Получаем числовой ID канала и загружаем его бейджи
        this.getChannelIdAndLoadBadges();
    }
    
    // Загрузка бейджей по образцу эмодзи
    loadBadges(channelID) {
        console.log('🏷️ Загружаем бейджи для канала:', channelID);
        
        // Инициализируем кэш бейджей
        this.badges = {};
        
        // Загружаем глобальные бейджи
        this.loadGlobalBadges();
        
        // Загружаем бейджи канала
        this.loadChannelBadges(channelID);
    }
    
    // Загрузка глобальных бейджей (по образцу BTTV)
    loadGlobalBadges() {
        console.log('🌐 Загружаем глобальные бейджи...');
        
        const headers = {
            'Client-ID': this.twitchClientId
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
        }
        
        fetch('https://api.twitch.tv/helix/chat/badges/global', { headers })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.data && Array.isArray(data.data)) {
                    data.data.forEach(badge => {
                        this.globalBadges[badge.set_id] = badge;
                        
                        // Добавляем в общий кэш бейджей
                        if (badge.versions) {
                            Object.entries(badge.versions).forEach(([version, versionData]) => {
                                const badgeKey = `${badge.set_id}/${version}`;
                                this.badges[badgeKey] = {
                                    id: badge.set_id,
                                    version: version,
                                    image: versionData.image_url_1x,
                                    title: versionData.title || badge.set_id,
                                    description: versionData.description || ''
                                };
                            });
                        }
                    });
                    console.log('✅ Глобальные бейджи загружены:', Object.keys(this.globalBadges).length);
                }
            })
            .catch(err => {
                console.warn('❌ Ошибка загрузки глобальных бейджей:', err.message);
            });
    }
    
    // Загрузка бейджей канала (по образцу BTTV)
    loadChannelBadges(channelID) {
        if (!channelID) {
            console.log('⚠️ ID канала не указан для загрузки бейджей');
            return;
        }
        
        console.log('🏠 Загружаем бейджи канала:', channelID);
        
        const headers = {
            'Client-ID': this.twitchClientId
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
        }
        
        fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channelID}`, { headers })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.data && Array.isArray(data.data)) {
                    data.data.forEach(badge => {
                        this.channelBadges[badge.set_id] = badge;
                        
                        // Добавляем в общий кэш бейджей
                        if (badge.versions) {
                            Object.entries(badge.versions).forEach(([version, versionData]) => {
                                const badgeKey = `${badge.set_id}/${version}`;
                                this.badges[badgeKey] = {
                                    id: badge.set_id,
                                    version: version,
                                    image: versionData.image_url_1x,
                                    title: versionData.title || badge.set_id,
                                    description: versionData.description || ''
                                };
                            });
                        }
                    });
                    console.log('✅ Бейджи канала загружены:', Object.keys(this.channelBadges).length);
                }
            })
            .catch(err => {
                console.warn('❌ Ошибка загрузки бейджей канала:', err.message);
            });
    }
    
    // Получение числового ID канала через Twitch API
    async getChannelIdAndLoadBadges() {
        if (!this.channel) {
            console.log('⚠️ Название канала не указано');
            return;
        }
        
        console.log('🔍 Получаем числовой ID канала:', this.channel);
        
        const headers = {
            'Client-ID': this.twitchClientId
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
        }
        
        try {
            const response = await fetch(`https://api.twitch.tv/helix/users?login=${this.channel}`, { headers });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                const channelId = data.data[0].id;
                this.channelNumericId = channelId;
                console.log('✅ Получен числовой ID канала:', channelId);
                
                // Загружаем бейджи канала (включая значки сообщества)
                this.loadChannelBadgesFromTwitch();
            } else {
                console.log('❌ Канал не найден:', this.channel);
            }
        } catch (error) {
            console.error('❌ Ошибка получения ID канала:', error);
        }
    }
    
    // Получение полной статистики пользователя для загрузки всех бейджей
    async getUserStatsAndBadges(username) {
        if (!username) return null;
        
        console.log('👤 Получаем статистику пользователя:', username);
        
        const headers = {
            'Client-ID': this.twitchClientId
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
        }
        
        try {
            // Получаем информацию о пользователе
            const userResponse = await fetch(`https://api.twitch.tv/helix/users?login=${username}`, { headers });
            
            if (!userResponse.ok) {
                throw new Error(`HTTP ${userResponse.status}: ${userResponse.statusText}`);
            }
            
            const userData = await userResponse.json();
            
            if (userData.data && userData.data.length > 0) {
                const user = userData.data[0];
                console.log('✅ Получена информация о пользователе:', user);
                
                // Получаем подписки пользователя
                const subsResponse = await fetch(`https://api.twitch.tv/helix/subscriptions?broadcaster_id=${this.channelNumericId}&user_id=${user.id}`, { headers });
                let subscriptionData = null;
                
                if (subsResponse.ok) {
                    subscriptionData = await subsResponse.json();
                    console.log('📺 Данные подписки:', subscriptionData);
                }
                
                // Получаем информацию о модерации
                const modsResponse = await fetch(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${this.channelNumericId}&user_id=${user.id}`, { headers });
                let modData = null;
                
                if (modsResponse.ok) {
                    modData = await modsResponse.json();
                    console.log('🛡️ Данные модерации:', modData);
                }
                
                // Получаем информацию о VIP
                const vipResponse = await fetch(`https://api.twitch.tv/helix/channels/vips?broadcaster_id=${this.channelNumericId}&user_id=${user.id}`, { headers });
                let vipData = null;
                
                if (vipResponse.ok) {
                    vipData = await vipResponse.json();
                    console.log('⭐ Данные VIP:', vipData);
                }
                
                return {
                    user,
                    subscription: subscriptionData?.data?.[0] || null,
                    moderator: modData?.data?.[0] || null,
                    vip: vipData?.data?.[0] || null
                };
            }
        } catch (error) {
            console.error('❌ Ошибка получения статистики пользователя:', error);
        }
        
        return null;
    }
    
    // Загрузка глобальных бейджей с Twitch API
    loadGlobalBadgesFromTwitch() {
        console.log('🌐 Загружаем глобальные бейджи с Twitch API...');
        
        const headers = {
            'Client-ID': this.twitchClientId,
            'Accept': 'application/vnd.twitchtv.v5+json'
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
            console.log('🔐 Используем OAuth токен для глобальных бейджей');
        } else {
            console.log('⚠️ OAuth токен не установлен, используем только Client-ID');
        }
        
        // Используем новый Helix API v5 для глобальных бейджей
        fetch('https://api.twitch.tv/helix/chat/badges/global', { headers })
            .then(res => {
                console.log('📡 Глобальные бейджи - статус:', res.status, res.statusText);
                if (!res.ok) {
                    if (res.status === 401) {
                        console.error('❌ Ошибка авторизации (401). Проверьте OAuth токен.');
                    } else if (res.status === 400) {
                        console.error('❌ Ошибка запроса (400). Проверьте параметры запроса.');
                    }
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('✅ Глобальные бейджи загружены:', data.data?.length || 0);
                console.log('📋 Данные API:', data);
                
                if (data.data && Array.isArray(data.data)) {
                    const globalBadges = {};
                    data.data.forEach(badge => {
                        globalBadges[badge.set_id] = badge;
                    });
                    
                    this.badgeCache.get('global').global = globalBadges;
                    console.log('📋 Глобальные бейджи сохранены в кэш:', Object.keys(globalBadges));
                }
            })
            .catch(err => {
                console.error('❌ Ошибка загрузки глобальных бейджей:', err);
            });
    }
    
    
    // Анализ значков сообщества
    analyzeCommunityBadges(communityBadges) {
        console.log('🔍 Анализируем значки сообщества...');
        
        const badgeTypes = Object.keys(communityBadges);
        console.log(`📊 Всего значков сообщества: ${badgeTypes.length}`);
        
        badgeTypes.forEach(badgeType => {
            const badge = communityBadges[badgeType];
            const versions = Object.keys(badge.versions);
            console.log(`🏷️ ${badgeType}: ${versions.length} версий`);
            
            // Специальная обработка для subscriber бейджей
            if (badgeType === 'subscriber') {
                console.log('💎 Найдены subscriber бейджи сообщества');
                versions.forEach(version => {
                    const versionData = badge.versions[version];
                    console.log(`  📅 ${version} месяцев: ${versionData.title || 'Подписчик'}`);
                });
            }
        });
    }
    
    // Fallback значки сообщества
    loadFallbackCommunityBadges() {
        console.log('🔄 Загружаем fallback значки сообщества');
        
        if (!this.badgeCache.has(this.channelNumericId)) {
            this.badgeCache.set(this.channelNumericId, { global: {}, channel: {} });
        }
        
        // Базовые значки сообщества (subscriber бейджи)
        const fallbackCommunityBadges = {
            'subscriber': {
                set_id: 'subscriber',
                title: 'Подписчик',
                description: 'Значки подписчиков канала',
                versions: {
                    '1': {
                        id: '1',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/2',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
                        title: 'Подписчик (1 месяц)',
                        description: 'Подписчик канала на 1 месяц'
                    },
                    '3': {
                        id: '3',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/3',
                        title: 'Подписчик (3 месяца)',
                        description: 'Подписчик канала на 3 месяца'
                    },
                    '6': {
                        id: '6',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/6',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/6',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/6',
                        title: 'Подписчик (6 месяцев)',
                        description: 'Подписчик канала на 6 месяцев'
                    },
                    '12': {
                        id: '12',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/12',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/12',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/12',
                        title: 'Подписчик (12 месяцев)',
                        description: 'Подписчик канала на 12 месяцев'
                    },
                    '24': {
                        id: '24',
                        image_url_1x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/24',
                        image_url_2x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/24',
                        image_url_4x: 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/24',
                        title: 'Подписчик (24 месяца)',
                        description: 'Подписчик канала на 24 месяца'
                    }
                }
            }
        };
        
        this.badgeCache.get(this.channelNumericId).channel = fallbackCommunityBadges;
        console.log('✅ Fallback значки сообщества загружены:', Object.keys(fallbackCommunityBadges));
    }
    
    // Загрузка бейджей канала с Twitch API
    loadChannelBadgesFromTwitch() {
        if (!this.channelNumericId) {
            console.log('⚠️ Числовой ID канала не найден');
            return;
        }
        
        console.log('🏠 Загружаем бейджи канала с Twitch API...', this.channelNumericId);
        
        const headers = {
            'Client-ID': this.twitchClientId
        };
        
        if (this.twitchOAuthToken) {
            headers['Authorization'] = `Bearer ${this.twitchOAuthToken}`;
            console.log('🔐 Используем OAuth токен для бейджей канала');
        } else {
            console.log('⚠️ OAuth токен не установлен, используем только Client-ID');
        }
        
        fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${this.channelNumericId}`, { headers })
            .then(res => {
                console.log('📡 Бейджи канала - статус:', res.status, res.statusText);
                if (!res.ok) {
                    if (res.status === 401) {
                        console.error('❌ Ошибка авторизации (401). Проверьте OAuth токен.');
                    } else if (res.status === 400) {
                        console.error('❌ Ошибка запроса (400). Проверьте параметры запроса.');
                    }
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log('✅ Бейджи канала загружены:', data.data?.length || 0);
                console.log('📋 Данные API канала:', data);
                
                if (data.data && Array.isArray(data.data)) {
                    const channelBadges = {};
                    data.data.forEach(badge => {
                        if (badge.set_id && badge.versions) {
                            channelBadges[badge.set_id] = {
                                set_id: badge.set_id,
                                versions: badge.versions,
                                title: badge.title || badge.set_id,
                                description: badge.description || ''
                            };
                            
                            // Обрабатываем версии бейджа и добавляем в основной кэш
                            Object.entries(badge.versions).forEach(([version, versionData]) => {
                                const badgeKey = `${badge.set_id}/${version}`;
                                this.badges[badgeKey] = {
                                    id: badge.set_id,
                                    version: version,
                                    image: versionData.image_url_1x,
                                    title: versionData.title || badge.set_id,
                                    description: versionData.description || ''
                                };
                                console.log('✅ Бейдж канала добавлен:', badgeKey, versionData.image_url_1x);
                            });
                        }
                    });
                    
                    // Сохраняем в кэш
                    if (!this.badgeCache.has(this.channelNumericId)) {
                        this.badgeCache.set(this.channelNumericId, { global: {}, channel: {} });
                    }
                    this.badgeCache.get(this.channelNumericId).channel = channelBadges;
                    console.log('📋 Бейджи канала сохранены в кэш:', Object.keys(channelBadges));
                    
                    // Анализируем значки сообщества
                    this.analyzeCommunityBadges(channelBadges);
                }
            })
            .catch(err => {
                console.error('❌ Ошибка загрузки бейджей канала:', err);
            });
    }
    
    // Загрузка fallback бейджей для немедленного использования
    loadFallbackBadges() {
        console.log('🔄 Загружаем fallback бейджи...');
        
        // Fallback глобальные бейджи
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
        
        // Fallback бейджи канала
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
                    }
                }
            }
        };
        
        // Сохраняем fallback бейджи в кэш
        this.badgeCache.get('global').global = fallbackGlobalBadges;
        this.badgeCache.get('global').channel = fallbackChannelBadges;
        
        console.log('✅ Fallback бейджи загружены');
    }
    
    // Получение URL бейджа из новой системы
    getBadgeUrlNew(badgeType, badgeVersion) {
        console.log('🔍 Ищем бейдж в новой системе:', badgeType, badgeVersion);
        
        // Сначала ищем в глобальных бейджах
        const globalCache = this.badgeCache.get('global');
        if (globalCache && globalCache.global[badgeType]) {
            const badge = globalCache.global[badgeType];
            if (badge.versions && badge.versions[badgeVersion]) {
                // Поддерживаем новые форматы URL
                const version = badge.versions[badgeVersion];
                const url = version.image_url_1x || version.image_url_2x || version.image_url_4x;
                if (url) {
                console.log('✅ Найден глобальный бейдж:', url);
                return url;
                }
            }
        }
        
        // Затем ищем в бейджах канала
        const channelId = this.channelId || this.channelNumericId || 'global';
        const channelCache = this.badgeCache.get(channelId);
        if (channelCache && channelCache.channel[badgeType]) {
            const badge = channelCache.channel[badgeType];
            if (badge.versions && badge.versions[badgeVersion]) {
                const version = badge.versions[badgeVersion];
                const url = version.image_url_1x || version.image_url_2x || version.image_url_4x;
                if (url) {
                console.log('✅ Найден канальный бейдж:', url);
                return url;
                }
            }
        }
        
        // Если есть числовой ID канала, ищем в его кэше
        if (this.channelNumericId) {
            const channelCache = this.badgeCache.get(this.channelNumericId);
            if (channelCache && channelCache.channel[badgeType]) {
                const badge = channelCache.channel[badgeType];
                if (badge.versions && badge.versions[badgeVersion]) {
                    const version = badge.versions[badgeVersion];
                    const url = version.image_url_1x || version.image_url_2x || version.image_url_4x;
                    if (url) {
                    console.log('✅ Найден бейдж канала по ID:', url);
                    return url;
                    }
                }
            }
        }
        
        console.log('❌ Бейдж не найден:', badgeType, badgeVersion);
        return null;
    }
    
    
    // Применение эффектов текста
    applyTextEffects() {
        if (!this.chatMessagesElement) return;
        
        // Сбрасываем все эффекты
        this.chatMessagesElement.style.textShadow = '';
        this.chatMessagesElement.style.textStroke = '';
        this.chatMessagesElement.style.webkitTextStroke = '';
        
        // Применяем тень текста
        if (this.settings.textShadowEnabled) {
            const shadow = `${this.settings.textShadowX}px ${this.settings.textShadowY}px ${this.settings.textShadowBlur}px ${this.settings.textShadowColor}`;
            this.chatMessagesElement.style.textShadow = shadow;
        }
        
        // Применяем свечение текста
        if (this.settings.textGlowEnabled) {
            const glow = `0 0 ${this.settings.textGlowSize}px ${this.settings.textGlowColor}`;
            if (this.settings.textShadowEnabled) {
                // Комбинируем с тенью
                this.chatMessagesElement.style.textShadow += `, ${glow}`;
            } else {
                this.chatMessagesElement.style.textShadow = glow;
            }
        }
        
        // Применяем обводку текста
        if (this.settings.textStrokeEnabled) {
            if (this.settings.textStrokeType === 'inset') {
                // Внешняя обводка через text-stroke
                const stroke = `${this.settings.textStrokeWidth}px ${this.settings.textStrokeColor}`;
                this.chatMessagesElement.style.webkitTextStroke = stroke;
                this.chatMessagesElement.style.textStroke = stroke;
            } else if (this.settings.textStrokeType === 'outline') {
                // Внутренняя обводка через text-shadow с множественными тенями
                const strokeWidth = this.settings.textStrokeWidth;
                const strokeColor = this.settings.textStrokeColor;
                
                // Создаем внутреннюю обводку через множественные text-shadow
                let insetShadows = [];
                for (let i = 0; i < strokeWidth; i++) {
                    insetShadows.push(`-${i}px -${i}px 0 ${strokeColor}`);
                    insetShadows.push(`${i}px -${i}px 0 ${strokeColor}`);
                    insetShadows.push(`-${i}px ${i}px 0 ${strokeColor}`);
                    insetShadows.push(`${i}px ${i}px 0 ${strokeColor}`);
                }
                
                // Добавляем к существующей тени или создаем новую
                if (this.settings.textShadowEnabled) {
                    const existingShadow = `${this.settings.textShadowX}px ${this.settings.textShadowY}px ${this.settings.textShadowBlur}px ${this.settings.textShadowColor}`;
                    this.chatMessagesElement.style.textShadow = `${existingShadow}, ${insetShadows.join(', ')}`;
                } else {
                    this.chatMessagesElement.style.textShadow = insetShadows.join(', ');
                }
            }
        }
    }
    
    // Применение эффектов текста к отдельному сообщению
    applyTextEffectsToMessage(messageElement) {
        if (!messageElement) return;
        
        // Сбрасываем все эффекты
        messageElement.style.textShadow = '';
        messageElement.style.textStroke = '';
        messageElement.style.webkitTextStroke = '';
        
        // Применяем тень текста
        if (this.settings.textShadowEnabled) {
            const shadow = `${this.settings.textShadowX}px ${this.settings.textShadowY}px ${this.settings.textShadowBlur}px ${this.settings.textShadowColor}`;
            messageElement.style.textShadow = shadow;
        }
        
        // Применяем свечение текста
        if (this.settings.textGlowEnabled) {
            const glow = `0 0 ${this.settings.textGlowSize}px ${this.settings.textGlowColor}`;
            if (this.settings.textShadowEnabled) {
                // Комбинируем с тенью
                messageElement.style.textShadow += `, ${glow}`;
            } else {
                messageElement.style.textShadow = glow;
            }
        }
        
        // Применяем обводку текста
        if (this.settings.textStrokeEnabled) {
            if (this.settings.textStrokeType === 'inset') {
                // Внешняя обводка через text-stroke
                const stroke = `${this.settings.textStrokeWidth}px ${this.settings.textStrokeColor}`;
                messageElement.style.webkitTextStroke = stroke;
                messageElement.style.textStroke = stroke;
            } else if (this.settings.textStrokeType === 'outline') {
                // Внутренняя обводка через text-shadow с множественными тенями
                const strokeWidth = this.settings.textStrokeWidth;
                const strokeColor = this.settings.textStrokeColor;
                
                // Создаем внутреннюю обводку через множественные text-shadow
                let insetShadows = [];
                for (let i = 0; i < strokeWidth; i++) {
                    insetShadows.push(`-${i}px -${i}px 0 ${strokeColor}`);
                    insetShadows.push(`${i}px -${i}px 0 ${strokeColor}`);
                    insetShadows.push(`-${i}px ${i}px 0 ${strokeColor}`);
                    insetShadows.push(`${i}px ${i}px 0 ${strokeColor}`);
                }
                
                // Добавляем к существующей тени или создаем новую
                if (this.settings.textShadowEnabled) {
                    const existingShadow = `${this.settings.textShadowX}px ${this.settings.textShadowY}px ${this.settings.textShadowBlur}px ${this.settings.textShadowColor}`;
                    messageElement.style.textShadow = `${existingShadow}, ${insetShadows.join(', ')}`;
                } else {
                    messageElement.style.textShadow = insetShadows.join(', ');
                }
            }
        }
    }
}

// Инициализация чата происходит в редакторе
// Автоматическая инициализация удалена для предотвращения дублирования

// Обработка закрытия страницы
window.addEventListener('beforeunload', () => {
    if (window.twitchChat) {
        window.twitchChat.disconnect();
    }
});

// Version: 20250127120007 - Auto-hide overflow messages based on visible area
