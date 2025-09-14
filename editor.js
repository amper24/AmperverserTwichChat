class ChatEditor {
    constructor() {
        // Массивы для эмодзи (7TV, BTTV, FFZ)
        this.sevenTVGlobalEmotes = [];
        this.sevenTVChannelEmotes = [];
        this.bttvGlobalEmotes = [];
        this.bttvChannelEmotes = [];
        this.bttvSharedEmotes = [];
        this.ffzGlobalEmotes = [];
        this.ffzChannelEmotes = [];
        
        this.settings = {
            channel: '',
            baseURL: 'https://amper24.github.io/AmperverserTwichChat/',
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
            backgroundGradient: 'none',
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
            messageBackgroundGradient: 'none',
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
        this.loadSettings();
        this.setupEventListeners();
        this.setupNavigation();
        this.initializeGoogleFonts();
        this.updatePreview();
    }
    
    initializeElements() {
        this.demoMessagesAdded = false; // Флаг для отслеживания демо-сообщений
        this.previewMessageCount = 0;
        this.previewMaxMessages = 100;
        
        // Переменные для подключения к реальному чату
        this.previewConnected = false;
        this.previewSocket = null;
        this.previewChatInstance = null;
        
        // Кэш для бейджей
        this.badgeCache = new Map();
        this.twitchClientId = 'kimne78kx3ncx6brgo4mv6wki5h1ko'; // Публичный Client ID
        
        this.elements = {
            channelInput: document.getElementById('channel-input'),
            saveChannelBtn: document.getElementById('save-channel'),
            reconnectBtn: document.getElementById('reconnect-btn'),
            baseURL: document.getElementById('base-url'),
            borderWidth: document.getElementById('border-width'),
            borderWidthNumber: document.getElementById('border-width-number'),
            borderWidthValue: document.getElementById('border-width-value'),
            borderColor: document.getElementById('border-color'),
            borderRadius: document.getElementById('border-radius'),
            borderRadiusNumber: document.getElementById('border-radius-number'),
            borderRadiusValue: document.getElementById('border-radius-value'),
            hideBorder: document.getElementById('hide-border'),
            enableGlow: document.getElementById('enable-glow'),
            glowColor: document.getElementById('glow-color'),
            glowIntensity: document.getElementById('glow-intensity'),
            glowIntensityNumber: document.getElementById('glow-intensity-number'),
            glowIntensityValue: document.getElementById('glow-intensity-value'),
            glowSettings: document.getElementById('glow-settings'),
            glowIntensitySettings: document.getElementById('glow-intensity-settings'),
            backgroundImage: document.getElementById('background-image'),
            backgroundSize: document.getElementById('background-size'),
            backgroundPosition: document.getElementById('background-position'),
            backgroundOpacity: document.getElementById('background-opacity'),
            backgroundOpacityNumber: document.getElementById('background-opacity-number'),
            backgroundOpacityValue: document.getElementById('background-opacity-value'),
            backgroundColor: document.getElementById('background-color'),
            backgroundColorText: document.getElementById('background-color-text'),
            backgroundColorPreset: document.getElementById('background-color-preset'),
            backgroundGradient: document.getElementById('background-gradient'),
            gradientColor1: document.getElementById('gradient-color-1'),
            gradientColor1Text: document.getElementById('gradient-color-1-text'),
            gradientColor2: document.getElementById('gradient-color-2'),
            gradientColor2Text: document.getElementById('gradient-color-2-text'),
            gradientDirection: document.getElementById('gradient-direction'),
            gradientSettings: document.getElementById('gradient-settings'),
            hideBackground: document.getElementById('hide-background'),
            fadeMessages: document.getElementById('fade-messages'),
            messageAlignment: document.getElementById('message-alignment'),
            borderMode: document.getElementById('border-mode'),
            borderAlignment: document.getElementById('border-alignment'),
            chatDirection: document.getElementById('chat-direction'),
            appearAnimation: document.getElementById('appear-animation'),
            disappearAnimation: document.getElementById('disappear-animation'),
            // Старый элемент animation-duration удален, используем appearDuration
            // Новые элементы анимаций
            appearDuration: document.getElementById('appear-duration'),
            appearDurationNumber: document.getElementById('appear-duration-number'),
            appearDurationValue: document.getElementById('appear-duration-value'),
            appearDelay: document.getElementById('appear-delay'),
            appearDelayNumber: document.getElementById('appear-delay-number'),
            appearDelayValue: document.getElementById('appear-delay-value'),
            disappearDuration: document.getElementById('disappear-duration'),
            disappearDurationNumber: document.getElementById('disappear-duration-number'),
            disappearDurationValue: document.getElementById('disappear-duration-value'),
            messageDisplayTime: document.getElementById('message-display-time'),
            messageDisplayTimeNumber: document.getElementById('message-display-time-number'),
            messageDisplayTimeValue: document.getElementById('message-display-time-value'),
            staggerAnimations: document.getElementById('stagger-animations'),
            staggerDelay: document.getElementById('stagger-delay'),
            staggerDelayNumber: document.getElementById('stagger-delay-number'),
            staggerDelayValue: document.getElementById('stagger-delay-value'),
            messageBackgroundColor: document.getElementById('message-background-color'),
            messageBackgroundColorText: document.getElementById('message-background-color-text'),
            messageBackgroundColorPreset: document.getElementById('message-background-color-preset'),
            messageBackgroundOpacity: document.getElementById('message-background-opacity'),
            messageBackgroundOpacityNumber: document.getElementById('message-background-opacity-number'),
            messageBackgroundOpacityValue: document.getElementById('message-background-opacity-value'),
            messageBackgroundGradient: document.getElementById('message-background-gradient'),
            messageGradientColor1: document.getElementById('message-gradient-color-1'),
            messageGradientColor1Text: document.getElementById('message-gradient-color-1-text'),
            messageGradientColor2: document.getElementById('message-gradient-color-2'),
            messageGradientColor2Text: document.getElementById('message-gradient-color-2-text'),
            messageGradientDirection: document.getElementById('message-gradient-direction'),
            messageGradientSettings: document.getElementById('message-gradient-settings'),
            messageBackgroundImage1: document.getElementById('message-background-image-1'),
            messageBackgroundImage2: document.getElementById('message-background-image-2'),
            messageBgSize1: document.getElementById('message-bg-size-1'),
            messageBgPosition1: document.getElementById('message-bg-position-1'),
            messageBgSize2: document.getElementById('message-bg-size-2'),
            messageBgPosition2: document.getElementById('message-bg-position-2'),
            // Элементы значков
            showUserBadges: document.getElementById('show-user-badges'),
            showChannelBadges: document.getElementById('show-channel-badges'),
            // Элементы шрифтов
            fontFamily: document.getElementById('font-family'),
            fontSearch: document.getElementById('font-search'),
            clearFontSearch: document.getElementById('clear-font-search'),
            fontSize: document.getElementById('font-size'),
            fontSizeNumber: document.getElementById('font-size-number'),
            fontSizeValue: document.getElementById('font-size-value'),
            fontWeight: document.getElementById('font-weight'),
            lineHeight: document.getElementById('line-height'),
            lineHeightNumber: document.getElementById('line-height-number'),
            lineHeightValue: document.getElementById('line-height-value'),
            letterSpacing: document.getElementById('letter-spacing'),
            letterSpacingNumber: document.getElementById('letter-spacing-number'),
            letterSpacingValue: document.getElementById('letter-spacing-value'),
            fontColor: document.getElementById('font-color'),
            fontColorText: document.getElementById('font-color-text'),
            fontColorPreset: document.getElementById('font-color-preset'),
            testMessageBg1: document.getElementById('test-message-bg-1'),
            testMessageBg2: document.getElementById('test-message-bg-2'),
            clearMessageBg1: document.getElementById('clear-message-bg-1'),
            clearMessageBg2: document.getElementById('clear-message-bg-2'),
            clearBackground: document.getElementById('clear-background'),
            testBackground: document.getElementById('test-background'),
            backgroundPreview: document.getElementById('background-preview'),
            backgroundPreviewImg: document.getElementById('background-preview-img'),
            maxMessages: document.getElementById('max-messages'),
            maxMessagesNumber: document.getElementById('max-messages-number'),
            maxMessagesValue: document.getElementById('max-messages-value'),
            messageSpeed: document.getElementById('message-speed'),
            messageSpeedNumber: document.getElementById('message-speed-number'),
            messageSpeedValue: document.getElementById('message-speed-value'),
            chatWidth: document.getElementById('chat-width'),
            chatWidthNumber: document.getElementById('chat-width-number'),
            chatWidthValue: document.getElementById('chat-width-value'),
            chatHeight: document.getElementById('chat-height'),
            chatHeightNumber: document.getElementById('chat-height-number'),
            chatHeightValue: document.getElementById('chat-height-value'),
            chatPreview: document.getElementById('chat-preview'),
            previewChatContainer: document.querySelector('.preview-chat-container'),
            previewChannelName: document.getElementById('preview-channel-name'),
            // previewConnectionStatus удален
            previewChatMessages: document.getElementById('preview-chat-messages'),
            obsSize: document.getElementById('obs-size'),
            obsUrl: document.getElementById('obs-url'),
            copyUrlBtn: document.getElementById('copy-url-btn'),
            openChatBtn: document.getElementById('open-chat-btn'),
            refreshPreviewBtn: document.getElementById('refresh-preview-btn'),
            connectPreviewBtn: document.getElementById('connect-preview-btn'),
            disconnectPreviewBtn: document.getElementById('disconnect-preview-btn'),
            previewStatus: document.getElementById('preview-status'),
            statusMessage: document.getElementById('status-message'),
            resetBtn: document.getElementById('reset-settings'),
            exportBtn: document.getElementById('export-settings'),
            importBtn: document.getElementById('import-settings'),
            importFile: document.getElementById('import-file')
        };
    }
    
    setupNavigation() {
        // Показываем только основной раздел при загрузке
        this.showSection('basic');
        
        // Добавляем обработчики для кнопок навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
                
                // Обновляем активную кнопку
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    showSection(sectionName) {
        // Скрываем все секции
        document.querySelectorAll('.setting-group').forEach(group => {
            if (group.dataset.section) {
                group.classList.add('hidden');
            }
        });
        
        // Показываем выбранную секцию
        document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(group => {
            group.classList.remove('hidden');
        });
    }
    
    setupEventListeners() {
        // Сохранение канала
        this.elements.saveChannelBtn.addEventListener('click', () => {
            this.saveChannel();
        });
        
        // Переподключение
        this.elements.reconnectBtn.addEventListener('click', () => {
            this.reconnectChat();
        });
        
        // Базовый URL
        this.elements.baseURL.addEventListener('input', (e) => {
            this.settings.baseURL = e.target.value;
            this.updatePreview();
        });
        
        // Настройки рамки
        this.elements.borderWidth.addEventListener('input', (e) => {
            this.settings.borderWidth = parseInt(e.target.value);
            this.elements.borderWidthNumber.value = e.target.value;
            this.elements.borderWidthValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.borderWidthNumber.addEventListener('input', (e) => {
            this.settings.borderWidth = parseInt(e.target.value);
            this.elements.borderWidth.value = e.target.value;
            this.elements.borderWidthValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.borderColor.addEventListener('input', (e) => {
            this.settings.borderColor = e.target.value;
            this.updatePreview();
        });
        
        this.elements.borderRadius.addEventListener('input', (e) => {
            this.settings.borderRadius = parseInt(e.target.value);
            this.elements.borderRadiusNumber.value = e.target.value;
            this.elements.borderRadiusValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.borderRadiusNumber.addEventListener('input', (e) => {
            this.settings.borderRadius = parseInt(e.target.value);
            this.elements.borderRadius.value = e.target.value;
            this.elements.borderRadiusValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.hideBorder.addEventListener('change', (e) => {
            this.settings.hideBorder = e.target.checked;
            this.updatePreview();
        });
        
        // Настройки свечения
        this.elements.enableGlow.addEventListener('change', (e) => {
            this.settings.enableGlow = e.target.checked;
            this.toggleGlowSettings();
            this.updatePreview();
        });
        
        this.elements.glowColor.addEventListener('input', (e) => {
            this.settings.glowColor = e.target.value;
            this.updatePreview();
        });
        
        this.elements.glowIntensity.addEventListener('input', (e) => {
            this.settings.glowIntensity = parseInt(e.target.value);
            this.elements.glowIntensityNumber.value = e.target.value;
            this.elements.glowIntensityValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.glowIntensityNumber.addEventListener('input', (e) => {
            this.settings.glowIntensity = parseInt(e.target.value);
            this.elements.glowIntensity.value = e.target.value;
            this.elements.glowIntensityValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        // Настройки фона
        this.elements.backgroundImage.addEventListener('input', (e) => {
            this.settings.backgroundImage = e.target.value;
            this.updatePreview();
        });
        
        this.elements.backgroundSize.addEventListener('change', (e) => {
            this.settings.backgroundSize = e.target.value;
            this.updatePreview();
        });
        
        this.elements.backgroundPosition.addEventListener('change', (e) => {
            this.settings.backgroundPosition = e.target.value;
            this.updatePreview();
        });
        
        this.elements.backgroundOpacity.addEventListener('input', (e) => {
            this.settings.backgroundOpacity = parseInt(e.target.value);
            this.elements.backgroundOpacityNumber.value = this.settings.backgroundOpacity;
            this.elements.backgroundOpacityValue.textContent = this.settings.backgroundOpacity + '%';
            this.updatePreview();
        });
        
        this.elements.backgroundOpacityNumber.addEventListener('input', (e) => {
            this.settings.backgroundOpacity = parseInt(e.target.value);
            this.elements.backgroundOpacity.value = this.settings.backgroundOpacity;
            this.elements.backgroundOpacityValue.textContent = this.settings.backgroundOpacity + '%';
            this.updatePreview();
        });
        
        // Обработчики для цвета фона
        this.elements.backgroundColor.addEventListener('input', (e) => {
            this.settings.backgroundColor = e.target.value;
            this.elements.backgroundColorText.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.backgroundColorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.backgroundColor = color;
                this.elements.backgroundColor.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.backgroundColorPreset.addEventListener('click', () => {
            this.showColorPresets('background');
        });
        
        // Обработчики для градиента фона
        this.elements.backgroundGradient.addEventListener('change', (e) => {
            this.settings.backgroundGradient = e.target.value;
            this.toggleGradientSettings();
            this.updatePreview();
        });
        
        this.elements.gradientColor1.addEventListener('input', (e) => {
            this.settings.gradientColor1 = e.target.value;
            this.elements.gradientColor1Text.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.gradientColor1Text.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.gradientColor1 = color;
                this.elements.gradientColor1.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.gradientColor2.addEventListener('input', (e) => {
            this.settings.gradientColor2 = e.target.value;
            this.elements.gradientColor2Text.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.gradientColor2Text.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.gradientColor2 = color;
                this.elements.gradientColor2.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.gradientDirection.addEventListener('change', (e) => {
            this.settings.gradientDirection = e.target.value;
            this.updatePreview();
        });
        
        this.elements.hideBackground.addEventListener('change', (e) => {
            this.settings.hideBackground = e.target.checked;
            this.updatePreview();
        });
        
        
        this.elements.fadeMessages.addEventListener('change', (e) => {
            this.settings.fadeMessages = e.target.checked;
            this.updatePreview();
        });
        
        this.elements.messageAlignment.addEventListener('change', (e) => {
            this.settings.messageAlignment = e.target.value;
            this.updatePreview();
        });
        
        this.elements.borderMode.addEventListener('change', (e) => {
            this.settings.borderMode = e.target.value;
            this.updatePreview();
        });
        
        this.elements.borderAlignment.addEventListener('change', (e) => {
            this.settings.borderAlignment = e.target.value;
            this.updatePreview();
        });
        
        this.elements.chatDirection.addEventListener('change', (e) => {
            this.settings.chatDirection = e.target.value;
            this.updatePreview();
        });
        
        
        this.elements.appearAnimation.addEventListener('change', (e) => {
            this.settings.appearAnimation = e.target.value;
            this.updatePreview();
        });
        
        this.elements.disappearAnimation.addEventListener('change', (e) => {
            this.settings.disappearAnimation = e.target.value;
            this.updatePreview();
        });
        
        // Старые обработчики animationDuration удалены
        
        // Новые обработчики анимаций
        if (this.elements.appearDuration) {
            this.elements.appearDuration.addEventListener('input', (e) => {
                this.settings.appearDuration = parseInt(e.target.value);
                if (this.elements.appearDurationNumber) this.elements.appearDurationNumber.value = this.settings.appearDuration;
                if (this.elements.appearDurationValue) this.elements.appearDurationValue.textContent = this.settings.appearDuration + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.appearDurationNumber) {
            this.elements.appearDurationNumber.addEventListener('input', (e) => {
                this.settings.appearDuration = parseInt(e.target.value);
                if (this.elements.appearDuration) this.elements.appearDuration.value = this.settings.appearDuration;
                if (this.elements.appearDurationValue) this.elements.appearDurationValue.textContent = this.settings.appearDuration + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.appearDelay) {
            this.elements.appearDelay.addEventListener('input', (e) => {
                this.settings.appearDelay = parseInt(e.target.value);
                if (this.elements.appearDelayNumber) this.elements.appearDelayNumber.value = this.settings.appearDelay;
                if (this.elements.appearDelayValue) this.elements.appearDelayValue.textContent = this.settings.appearDelay + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.appearDelayNumber) {
            this.elements.appearDelayNumber.addEventListener('input', (e) => {
                this.settings.appearDelay = parseInt(e.target.value);
                if (this.elements.appearDelay) this.elements.appearDelay.value = this.settings.appearDelay;
                if (this.elements.appearDelayValue) this.elements.appearDelayValue.textContent = this.settings.appearDelay + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.disappearDuration) {
            this.elements.disappearDuration.addEventListener('input', (e) => {
                this.settings.disappearDuration = parseInt(e.target.value);
                if (this.elements.disappearDurationNumber) this.elements.disappearDurationNumber.value = this.settings.disappearDuration;
                if (this.elements.disappearDurationValue) this.elements.disappearDurationValue.textContent = this.settings.disappearDuration + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.disappearDurationNumber) {
            this.elements.disappearDurationNumber.addEventListener('input', (e) => {
                this.settings.disappearDuration = parseInt(e.target.value);
                if (this.elements.disappearDuration) this.elements.disappearDuration.value = this.settings.disappearDuration;
                if (this.elements.disappearDurationValue) this.elements.disappearDurationValue.textContent = this.settings.disappearDuration + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.messageDisplayTime) {
            this.elements.messageDisplayTime.addEventListener('input', (e) => {
                this.settings.messageDisplayTime = parseFloat(e.target.value);
                if (this.elements.messageDisplayTimeNumber) this.elements.messageDisplayTimeNumber.value = this.settings.messageDisplayTime;
                if (this.elements.messageDisplayTimeValue) this.elements.messageDisplayTimeValue.textContent = this.settings.messageDisplayTime + 'сек';
                this.updatePreview();
            });
        }
        
        if (this.elements.messageDisplayTimeNumber) {
            this.elements.messageDisplayTimeNumber.addEventListener('input', (e) => {
                this.settings.messageDisplayTime = parseFloat(e.target.value);
                if (this.elements.messageDisplayTime) this.elements.messageDisplayTime.value = this.settings.messageDisplayTime;
                if (this.elements.messageDisplayTimeValue) this.elements.messageDisplayTimeValue.textContent = this.settings.messageDisplayTime + 'сек';
                this.updatePreview();
            });
        }
        
        
        if (this.elements.staggerAnimations) {
            this.elements.staggerAnimations.addEventListener('change', (e) => {
                this.settings.staggerAnimations = e.target.checked;
                this.updatePreview();
            });
        }
        
        if (this.elements.staggerDelay) {
            this.elements.staggerDelay.addEventListener('input', (e) => {
                this.settings.staggerDelay = parseInt(e.target.value);
                if (this.elements.staggerDelayNumber) this.elements.staggerDelayNumber.value = this.settings.staggerDelay;
                if (this.elements.staggerDelayValue) this.elements.staggerDelayValue.textContent = this.settings.staggerDelay + 'ms';
                this.updatePreview();
            });
        }
        
        if (this.elements.staggerDelayNumber) {
            this.elements.staggerDelayNumber.addEventListener('input', (e) => {
                this.settings.staggerDelay = parseInt(e.target.value);
                if (this.elements.staggerDelay) this.elements.staggerDelay.value = this.settings.staggerDelay;
                if (this.elements.staggerDelayValue) this.elements.staggerDelayValue.textContent = this.settings.staggerDelay + 'ms';
                this.updatePreview();
            });
        }
        
        // Настройки фона сообщений
        this.elements.messageBackgroundColor.addEventListener('input', (e) => {
            this.settings.messageBackgroundColor = e.target.value;
            this.elements.messageBackgroundColorText.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageBackgroundColorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.messageBackgroundColor = color;
                this.elements.messageBackgroundColor.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.messageBackgroundColorPreset.addEventListener('click', () => {
            this.showColorPresets('message');
        });
        
        this.elements.messageBackgroundOpacity.addEventListener('input', (e) => {
            this.settings.messageBackgroundOpacity = parseInt(e.target.value);
            this.elements.messageBackgroundOpacityNumber.value = this.settings.messageBackgroundOpacity;
            this.elements.messageBackgroundOpacityValue.textContent = this.settings.messageBackgroundOpacity + '%';
            this.updatePreview();
        });
        
        this.elements.messageBackgroundOpacityNumber.addEventListener('input', (e) => {
            this.settings.messageBackgroundOpacity = parseInt(e.target.value);
            this.elements.messageBackgroundOpacity.value = this.settings.messageBackgroundOpacity;
            this.elements.messageBackgroundOpacityValue.textContent = this.settings.messageBackgroundOpacity + '%';
            this.updatePreview();
        });
        
        // Обработчики для градиента фона сообщений
        this.elements.messageBackgroundGradient.addEventListener('change', (e) => {
            this.settings.messageBackgroundGradient = e.target.value;
            this.toggleMessageGradientSettings();
            this.updatePreview();
        });
        
        this.elements.messageGradientColor1.addEventListener('input', (e) => {
            this.settings.messageGradientColor1 = e.target.value;
            this.elements.messageGradientColor1Text.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageGradientColor1Text.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.messageGradientColor1 = color;
                this.elements.messageGradientColor1.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.messageGradientColor2.addEventListener('input', (e) => {
            this.settings.messageGradientColor2 = e.target.value;
            this.elements.messageGradientColor2Text.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageGradientColor2Text.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.messageGradientColor2 = color;
                this.elements.messageGradientColor2.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.messageGradientDirection.addEventListener('change', (e) => {
            this.settings.messageGradientDirection = e.target.value;
            this.updatePreview();
        });
        
        
        this.elements.messageBackgroundImage1.addEventListener('change', (e) => {
            this.settings.messageBackgroundImage1 = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageBackgroundImage2.addEventListener('change', (e) => {
            this.settings.messageBackgroundImage2 = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageBgSize1.addEventListener('change', (e) => {
            this.settings.messageBgSize1 = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageBgPosition1.addEventListener('change', (e) => {
            this.settings.messageBgPosition1 = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageBgSize2.addEventListener('change', (e) => {
            this.settings.messageBgSize2 = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageBgPosition2.addEventListener('change', (e) => {
            this.settings.messageBgPosition2 = e.target.value;
            this.updatePreview();
        });
        
        // Обработчики для значков
        this.elements.showUserBadges.addEventListener('change', (e) => {
            this.settings.showUserBadges = e.target.checked;
            this.updatePreview();
        });
        
        this.elements.showChannelBadges.addEventListener('change', (e) => {
            this.settings.showChannelBadges = e.target.checked;
            this.updatePreview();
        });
        
        
        // Обработчики для шрифтов
        this.elements.fontFamily.addEventListener('change', (e) => {
            this.settings.fontFamily = e.target.value;
            this.loadGoogleFont(e.target.value);
            this.updatePreview();
        });
        
        // Обработчик для поиска шрифтов
        this.elements.fontSearch.addEventListener('input', (e) => {
            this.filterFonts(e.target.value);
        });
        
        // Обработчик для кнопки очистки поиска
        this.elements.clearFontSearch.addEventListener('click', () => {
            this.elements.fontSearch.value = '';
            this.filterFonts('');
            this.elements.fontSearch.focus();
        });
        
        this.elements.fontSize.addEventListener('input', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            this.elements.fontSizeNumber.value = this.settings.fontSize;
            this.elements.fontSizeValue.textContent = this.settings.fontSize + 'px';
            this.updatePreview();
        });
        
        this.elements.fontSizeNumber.addEventListener('input', (e) => {
            this.settings.fontSize = parseInt(e.target.value);
            this.elements.fontSize.value = this.settings.fontSize;
            this.elements.fontSizeValue.textContent = this.settings.fontSize + 'px';
            this.updatePreview();
        });
        
        this.elements.fontWeight.addEventListener('change', (e) => {
            this.settings.fontWeight = parseInt(e.target.value);
            this.updatePreview();
        });
        
        this.elements.lineHeight.addEventListener('input', (e) => {
            this.settings.lineHeight = parseFloat(e.target.value);
            this.elements.lineHeightNumber.value = this.settings.lineHeight;
            this.elements.lineHeightValue.textContent = this.settings.lineHeight;
            this.updatePreview();
        });
        
        this.elements.lineHeightNumber.addEventListener('input', (e) => {
            this.settings.lineHeight = parseFloat(e.target.value);
            this.elements.lineHeight.value = this.settings.lineHeight;
            this.elements.lineHeightValue.textContent = this.settings.lineHeight;
            this.updatePreview();
        });
        
        this.elements.letterSpacing.addEventListener('input', (e) => {
            this.settings.letterSpacing = parseFloat(e.target.value);
            this.elements.letterSpacingNumber.value = this.settings.letterSpacing;
            this.elements.letterSpacingValue.textContent = this.settings.letterSpacing + 'px';
            this.updatePreview();
        });
        
        this.elements.letterSpacingNumber.addEventListener('input', (e) => {
            this.settings.letterSpacing = parseFloat(e.target.value);
            this.elements.letterSpacing.value = this.settings.letterSpacing;
            this.elements.letterSpacingValue.textContent = this.settings.letterSpacing + 'px';
            this.updatePreview();
        });
        
        // Обработчики для цвета шрифта
        this.elements.fontColor.addEventListener('input', (e) => {
            this.settings.fontColor = e.target.value;
            this.elements.fontColorText.value = e.target.value;
            this.updatePreview();
        });
        
        this.elements.fontColorText.addEventListener('input', (e) => {
            const color = e.target.value;
            if (this.isValidColor(color)) {
                this.settings.fontColor = color;
                this.elements.fontColor.value = color;
                this.updatePreview();
            }
        });
        
        this.elements.fontColorPreset.addEventListener('click', () => {
            this.showColorPresets();
        });
        
        // Кнопки для фоновых изображений сообщений
        this.elements.testMessageBg1.addEventListener('click', () => {
            this.testMessageBackgroundImage(1);
        });
        
        this.elements.testMessageBg2.addEventListener('click', () => {
            this.testMessageBackgroundImage(2);
        });
        
        this.elements.clearMessageBg1.addEventListener('click', () => {
            this.settings.messageBackgroundImage1 = '';
            this.elements.messageBackgroundImage1.value = '';
            this.updatePreview();
        });
        
        this.elements.clearMessageBg2.addEventListener('click', () => {
            this.settings.messageBackgroundImage2 = '';
            this.elements.messageBackgroundImage2.value = '';
            this.updatePreview();
        });
        
        this.elements.clearBackground.addEventListener('click', () => {
            this.settings.backgroundImage = '';
            this.elements.backgroundImage.value = '';
            this.hideBackgroundPreview();
            this.updatePreview();
            this.showStatus('🗑️ Фоновое изображение очищено', 'info');
        });
        
        this.elements.testBackground.addEventListener('click', () => {
            this.testBackgroundImage();
        });
        
        // Настройки сообщений
        this.elements.maxMessages.addEventListener('input', (e) => {
            this.settings.maxMessages = parseInt(e.target.value);
            this.elements.maxMessagesNumber.value = e.target.value;
            this.elements.maxMessagesValue.textContent = e.target.value;
            this.updatePreview();
        });
        
        this.elements.maxMessagesNumber.addEventListener('input', (e) => {
            this.settings.maxMessages = parseInt(e.target.value);
            this.elements.maxMessages.value = e.target.value;
            this.elements.maxMessagesValue.textContent = e.target.value;
            this.updatePreview();
        });
        
        this.elements.messageSpeed.addEventListener('input', (e) => {
            this.settings.messageSpeed = parseInt(e.target.value);
            this.elements.messageSpeedNumber.value = e.target.value;
            this.elements.messageSpeedValue.textContent = e.target.value + 'ms';
            this.updatePreview();
        });
        
        this.elements.messageSpeedNumber.addEventListener('input', (e) => {
            this.settings.messageSpeed = parseInt(e.target.value);
            this.elements.messageSpeed.value = e.target.value;
            this.elements.messageSpeedValue.textContent = e.target.value + 'ms';
            this.updatePreview();
        });
        
        // Настройки OBS
        this.elements.chatWidth.addEventListener('input', (e) => {
            this.settings.chatWidth = parseInt(e.target.value);
            this.elements.chatWidthNumber.value = e.target.value;
            this.elements.chatWidthValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.chatWidthNumber.addEventListener('input', (e) => {
            this.settings.chatWidth = parseInt(e.target.value);
            this.elements.chatWidth.value = e.target.value;
            this.elements.chatWidthValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.chatHeight.addEventListener('input', (e) => {
            this.settings.chatHeight = parseInt(e.target.value);
            this.elements.chatHeightNumber.value = e.target.value;
            this.elements.chatHeightValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        this.elements.chatHeightNumber.addEventListener('input', (e) => {
            this.settings.chatHeight = parseInt(e.target.value);
            this.elements.chatHeight.value = e.target.value;
            this.elements.chatHeightValue.textContent = e.target.value + 'px';
            this.updatePreview();
        });
        
        // Кнопки действий
        this.elements.resetBtn.addEventListener('click', () => {
            this.resetSettings();
        });
        
        this.elements.exportBtn.addEventListener('click', () => {
            this.exportSettings();
        });
        
        this.elements.importBtn.addEventListener('click', () => {
            this.elements.importFile.click();
        });
        
        this.elements.importFile.addEventListener('change', (e) => {
            this.importSettings(e.target.files[0]);
        });
        
        // Копирование URL
        this.elements.copyUrlBtn.addEventListener('click', () => {
            this.copyURLToClipboard();
        });
        
        // Открытие чата
        this.elements.openChatBtn.addEventListener('click', () => {
            this.openChat();
        });
        
        // Обновление предпросмотра
        this.elements.refreshPreviewBtn.addEventListener('click', () => {
            this.refreshPreview();
        });
        
        // Подключение к реальному чату
        this.elements.connectPreviewBtn.addEventListener('click', () => {
            this.connectPreviewToChat();
        });
        
        // Отключение от чата
        this.elements.disconnectPreviewBtn.addEventListener('click', () => {
            this.disconnectPreviewFromChat();
        });
        
        // Автосохранение при изменении настроек
        Object.values(this.elements).forEach(element => {
            if (element && element.addEventListener) {
                element.addEventListener('change', () => {
                    this.saveSettings();
                });
            }
        });
    }
    
    saveChannel() {
        const channel = this.elements.channelInput.value.trim();
        if (!channel) {
            this.showStatus('❌ Введите название канала', 'error');
            return;
        }
        
        this.settings.channel = channel;
        this.saveSettings();
        this.updateChannelInLocalStorage(channel);
        this.showStatus('✅ Канал сохранен: ' + channel, 'success');
        this.updatePreview();
        this.updateOBSURL();
    }
    
    updateChannelInLocalStorage(channel) {
        try {
            localStorage.setItem('twitchChatChannel', channel);
            this.showStatus('📝 Канал сохранен в localStorage', 'info');
        } catch (error) {
            this.showStatus('❌ Ошибка при сохранении канала', 'error');
        }
    }
    
    async testBackgroundImage() {
        const url = this.elements.backgroundImage.value.trim();
        if (!url) {
            this.showStatus('❌ Введите URL изображения', 'error');
            return;
        }
        
        if (!this.isValidImageUrl(url)) {
            this.showStatus('❌ Неверный формат URL', 'error');
            return;
        }
        
        this.showStatus('🔍 Проверка изображения...', 'info');
        
        try {
            // Создаем новый объект Image для проверки
            const img = new Image();
            
            img.onload = () => {
                this.showStatus('✅ Изображение загружено успешно', 'success');
                this.showBackgroundPreview(url);
                this.settings.backgroundImage = url;
                this.updatePreview();
            };
            
            img.onerror = () => {
                this.showStatus('❌ Ошибка загрузки изображения', 'error');
                this.hideBackgroundPreview();
            };
            
            // Устанавливаем CORS для загрузки изображений с других доменов
            img.crossOrigin = 'anonymous';
            img.src = url;
            
        } catch (error) {
            this.showStatus('❌ Ошибка при проверке изображения', 'error');
            this.hideBackgroundPreview();
        }
    }
    
    isValidImageUrl(url) {
        try {
            new URL(url);
            const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
            const lowerUrl = url.toLowerCase();
            return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
                   lowerUrl.includes('imgur.com') || 
                   lowerUrl.includes('i.redd.it') ||
                   lowerUrl.includes('cdn.discordapp.com');
        } catch {
            return false;
        }
    }
    
    showBackgroundPreview(url) {
        this.elements.backgroundPreviewImg.src = url;
        this.elements.backgroundPreview.style.display = 'block';
    }
    
    hideBackgroundPreview() {
        this.elements.backgroundPreview.style.display = 'none';
        this.elements.backgroundPreviewImg.src = '';
    }
    
    testMessageBackgroundImage(layer) {
        const url = layer === 1 ? this.elements.messageBackgroundImage1.value.trim() : this.elements.messageBackgroundImage2.value.trim();
        if (!url) { 
            this.showStatus('❌ Введите URL изображения', 'error'); 
            return; 
        }
        if (!this.isValidImageUrl(url)) { 
            this.showStatus('❌ Неверный формат URL', 'error'); 
            return; 
        }
        this.showStatus('🔍 Проверка изображения...', 'info');
        try {
            const img = new Image();
            img.onload = () => {
                this.showStatus('✅ Изображение загружено успешно', 'success');
                if (layer === 1) {
                    this.settings.messageBackgroundImage1 = url;
                } else {
                    this.settings.messageBackgroundImage2 = url;
                }
                this.updatePreview();
            };
            img.onerror = () => {
                this.showStatus('❌ Ошибка загрузки изображения', 'error');
            };
            img.crossOrigin = 'anonymous';
            img.src = url;
        } catch (error) {
            this.showStatus('❌ Ошибка при проверке изображения', 'error');
        }
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
            backgrounds.push(gradient);
        } else {
            // Базовый цвет фона с прозрачностью
            const baseColor = this.hexToRgba(this.settings.messageBackgroundColor, this.settings.messageBackgroundOpacity / 100);
            messageElement.style.backgroundColor = baseColor;
        }
        
        if (backgrounds.length > 0) {
            messageElement.style.backgroundImage = backgrounds.join(', ');
            messageElement.style.backgroundSize = `${this.settings.messageBgSize1}, ${this.settings.messageBgSize2}`;
            messageElement.style.backgroundPosition = `${this.settings.messageBgPosition1}, ${this.settings.messageBgPosition2}`;
        }
        
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    reconnectChat() {
        this.showStatus('🔄 Обновление предпросмотра...', 'info');
        
        // Обновляем предпросмотр
        this.updatePreview();
        
        setTimeout(() => {
            this.showStatus('✅ Предпросмотр обновлен', 'success');
        }, 1000);
    }
    
    refreshPreview() {
        this.showStatus('🔄 Обновление предпросмотра...', 'info');
        
        // Применяем все настройки к предпросмотру
        this.updatePreview();
        
        // Сбрасываем флаг и обновляем демо-сообщения
        this.demoMessagesAdded = false;
        this.previewMessageCount = 0;
        this.addDemoMessages();
        this.demoMessagesAdded = true;
        
        setTimeout(() => {
            this.showStatus('✅ Предпросмотр обновлен', 'success');
        }, 2000);
    }
    
    updatePreview() {
        // Применяем полные размеры чата к предпросмотру
        this.elements.chatPreview.style.width = this.settings.chatWidth + 'px';
        this.elements.chatPreview.style.height = this.settings.chatHeight + 'px';
        
        // Применяем настройки к предпросмотру
        this.applyPreviewSettings();
        
        // Генерируем URL с параметрами
        const chatURL = this.generateChatURL();
        
        // Обновляем информацию для OBS
        this.elements.obsSize.textContent = `${this.settings.chatWidth}x${this.settings.chatHeight}`;
        this.elements.obsUrl.textContent = chatURL;
        this.elements.obsUrl.href = chatURL;
    }
    
    toggleGlowSettings() {
        if (this.settings.enableGlow) {
            this.elements.glowSettings.style.display = 'block';
            this.elements.glowIntensitySettings.style.display = 'block';
        } else {
            this.elements.glowSettings.style.display = 'none';
            this.elements.glowIntensitySettings.style.display = 'none';
        }
    }
    
    applyPreviewSettings() {
        const container = this.elements.previewChatContainer;
        
        // Применяем настройки рамки
        if (this.settings.hideBorder) {
            container.classList.add('no-border');
        } else {
            container.classList.remove('no-border');
            container.style.borderWidth = this.settings.borderWidth + 'px';
            container.style.borderColor = this.settings.borderColor;
        }
        
        container.style.borderRadius = this.settings.borderRadius + 'px';
        
        // Применяем свечение
        if (this.settings.enableGlow) {
            const glowColor = this.settings.glowColor;
            const intensity = this.settings.glowIntensity;
            container.style.boxShadow = `0 0 ${intensity}px ${glowColor}, 0 0 ${intensity * 2}px ${glowColor}`;
        } else {
            container.style.boxShadow = '';
        }
        
        // Применяем настройки фона
        if (this.settings.hideBackground) {
            container.classList.add('no-background');
        } else {
            container.classList.remove('no-background');
            
            if (this.settings.backgroundImage) {
                // Применяем фоновое изображение с прозрачностью
                const opacity = this.settings.backgroundOpacity / 100;
                container.style.backgroundImage = `url(${this.settings.backgroundImage})`;
                container.style.backgroundSize = this.settings.backgroundSize;
                container.style.backgroundPosition = this.settings.backgroundPosition;
                container.style.backgroundRepeat = 'no-repeat';
                
                // Создаем псевдоэлемент для прозрачности фонового изображения
                container.style.position = 'relative';
                container.style.background = 'rgba(255, 255, 255, 0.05)';
                container.style.backdropFilter = 'blur(10px)';
                
                // Удаляем старый псевдоэлемент если есть
                const oldOverlay = container.querySelector('.background-overlay');
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
                container.appendChild(overlay);
            } else {
                // Фон без изображения - применяем цвет или градиент
                container.style.backgroundImage = '';
                
                // Удаляем псевдоэлемент если есть
                const oldOverlay = container.querySelector('.background-overlay');
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
                    container.style.background = gradient;
                } else {
                    container.style.background = this.settings.backgroundColor;
                }
                
                container.style.backdropFilter = 'blur(10px)';
            }
        }
        
        // Применяем настройки выравнивания
        this.elements.previewChatMessages.className = this.elements.previewChatMessages.className.replace(/align-\w+/g, '');
        this.elements.previewChatMessages.classList.add(`align-${this.settings.messageAlignment}`);
        
        // Применяем режим рамки к контейнеру
        this.elements.previewChatMessages.classList.remove('border-full-width', 'border-fit-content');
        this.elements.previewChatMessages.classList.add(`border-${this.settings.borderMode}`);
        
        // Применяем выравнивание рамки к контейнеру
        this.elements.previewChatMessages.className = this.elements.previewChatMessages.className.replace(/border-align-\w+/g, '');
        this.elements.previewChatMessages.classList.add(`border-align-${this.settings.borderAlignment}`);
        
        // Применяем направление чата
        this.elements.previewChatMessages.className = this.elements.previewChatMessages.className.replace(/direction-\w+-\w+/g, '');
        this.elements.previewChatMessages.classList.add(`direction-${this.settings.chatDirection}`);
        
        
        // Применяем настройки шрифтов к контейнеру сообщений
        this.elements.previewChatMessages.style.fontFamily = this.settings.fontFamily;
        this.elements.previewChatMessages.style.fontSize = this.settings.fontSize + 'px';
        this.elements.previewChatMessages.style.fontWeight = this.settings.fontWeight;
        this.elements.previewChatMessages.style.lineHeight = this.settings.lineHeight;
        this.elements.previewChatMessages.style.letterSpacing = this.settings.letterSpacing + 'px';
        this.elements.previewChatMessages.style.color = this.settings.fontColor;
        
        // Обновляем все существующие сообщения в предпросмотре
        this.updateExistingPreviewMessages();
        
        // Добавляем демо-сообщения для предпросмотра только один раз
        if (!this.demoMessagesAdded) {
            this.addDemoMessages();
            this.demoMessagesAdded = true;
        }
    }
    
    clearPreviewMessages() {
        const messagesContainer = this.elements.previewChatMessages;
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.previewMessageCount = 0;
        }
    }
    
    updateExistingPreviewMessages() {
        const messagesContainer = this.elements.previewChatMessages;
        if (!messagesContainer) return;
        
        const messages = messagesContainer.querySelectorAll('.preview-message');
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
    
    async addDemoMessages() {
        const messagesContainer = this.elements.previewChatMessages;
        
        if (!messagesContainer) {
            console.error('previewChatMessages element not found!');
            return;
        }
        
        // Полная очистка предпросмотра
        this.clearPreviewMessages();
        
        // Используем только SVG значки (без API)
        console.log('Demo badges ready (SVG only)');
        
        // Добавляем демо-сообщения с метаданными
        const demoMessages = [
            { 
                username: 'Streamer', 
                text: 'Привет всем! Как дела?', 
                userData: { 
                    color: '#ff6b6b', 
                    badges: ['broadcaster/1']
                } 
            },
            { 
                username: 'Moderator', 
                text: 'Соблюдайте правила чата!', 
                userData: { 
                    color: '#4CAF50', 
                    badges: ['moderator/1']
                } 
            },
            { 
                username: 'VIPUser', 
                text: 'Отличный контент!', 
                userData: { 
                    color: '#FF9800', 
                    badges: ['vip/1']
                } 
            },
            { 
                username: 'Subscriber', 
                text: 'Подписался на 6 месяцев!', 
                userData: { 
                    color: '#9C27B0', 
                    badges: ['subscriber/6']
                } 
            },
            { 
                username: 'MultiBadgeUser', 
                text: 'У меня несколько бейджиков! 🎉', 
                userData: { 
                    color: '#FF9800',
                    badges: ['moderator/1', 'vip/1', 'subscriber/1']
                } 
            },
            { 
                username: 'PrimeUser', 
                text: 'Привет всем! 👋', 
                userData: { 
                    color: '#00BCD4',
                    badges: ['premium/1']
                } 
            },
            { 
                username: 'BitsDonator', 
                text: 'GG! 🎮', 
                userData: { 
                    color: '#FF5722',
                    badges: ['bits/1000']
                } 
            },
            { 
                username: 'GiftLeader', 
                text: 'Это очень длинное сообщение для демонстрации того, как работает перенос текста в чате. Оно должно корректно отображаться на нескольких строках!', 
                userData: { 
                    color: '#E91E63',
                    badges: ['sub-gift-leader/1']
                } 
            }
        ];
        
        demoMessages.forEach((msg, index) => {
            const delay = this.settings.staggerAnimations ? 
                index * this.settings.staggerDelay : 
                index * 300;
            setTimeout(() => {
                this.addPreviewMessage(msg.username, msg.text, msg.userData);
            }, delay);
        });
        
        // Статус подключения удален
    }
    
    syncPreviewMessageCount() {
        const actualCount = this.elements.previewChatMessages.querySelectorAll('.preview-message').length;
        this.previewMessageCount = actualCount;
    }
    
    scrollPreviewToBottom() {
        if (this.elements.previewChatMessages) {
            // Используем requestAnimationFrame для более плавной прокрутки
            requestAnimationFrame(() => {
                this.elements.previewChatMessages.scrollTop = this.elements.previewChatMessages.scrollHeight;
            });
        }
    }
    
    limitPreviewMessages() {
        if (!this.elements.previewChatMessages) return;
        
        const messages = this.elements.previewChatMessages.querySelectorAll('.preview-message');
        const maxMessages = 8; // Максимальное количество видимых сообщений
        
        if (messages.length > maxMessages) {
            // Удаляем самые старые сообщения
            for (let i = 0; i < messages.length - maxMessages; i++) {
                messages[i].remove();
            }
            this.syncPreviewMessageCount();
        }
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
    
    async fetchTwitchBadges(channelId) {
        try {
            // Проверяем кэш
            if (this.badgeCache.has(channelId)) {
                return this.badgeCache.get(channelId);
            }
            
            console.log('Загружаем значки для:', channelId);
            
            // Получаем глобальные бейджи через новый Helix API
            const globalResponse = await fetch('https://api.twitch.tv/helix/chat/badges/global', {
                headers: {
                    'Client-ID': this.twitchClientId
                }
            });
            
            let globalBadges = {};
            if (globalResponse.ok) {
                const globalData = await globalResponse.json();
                // Преобразуем данные в нужный формат
                globalBadges = this.transformBadgeData(globalData.data || []);
                console.log('Глобальные значки загружены:', Object.keys(globalBadges));
            } else {
                console.error('Ошибка загрузки глобальных значков:', globalResponse.status);
            }
            
            // Получаем бейджи канала
            let channelBadges = {};
            if (channelId && channelId !== 'global') {
                const channelResponse = await fetch(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channelId}`, {
                    headers: {
                        'Client-ID': this.twitchClientId
                    }
                });
                
                if (channelResponse.ok) {
                    const channelData = await channelResponse.json();
                    // Преобразуем данные в нужный формат
                    channelBadges = this.transformBadgeData(channelData.data || []);
                    console.log('Значки канала загружены:', Object.keys(channelBadges));
                } else {
                    console.error('Ошибка загрузки значков канала:', channelResponse.status);
                }
            }
            
            const badges = {
                global: globalBadges,
                channel: channelBadges
            };
            
            // Кэшируем результат
            this.badgeCache.set(channelId, badges);
            return badges;
            
        } catch (error) {
            console.error('Error fetching Twitch badges:', error);
            return { global: {}, channel: {} };
        }
    }
    
    transformBadgeData(badgeData) {
        const transformed = {};
        
        badgeData.forEach(badge => {
            const versions = {};
            badge.versions.forEach(version => {
                versions[version.id] = {
                    image_url_1x: version.image_url_1x,
                    image_url_2x: version.image_url_2x,
                    image_url_4x: version.image_url_4x
                };
            });
            
            transformed[badge.set_id] = {
                versions: versions
            };
        });
        
        return transformed;
    }
    
    async getChannelId(channelName) {
        try {
            const response = await fetch(`https://api.twitch.tv/helix/users?login=${channelName}`, {
                headers: {
                    'Client-ID': this.twitchClientId
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.data[0]?.id || null;
            }
        } catch (error) {
            console.error('Error fetching channel ID:', error);
        }
        return null;
    }
    
    getBadgeUrl(badgeType, badgeVersion) {
        // Проверяем кэш бейджей
        const channelId = this.channelId || 'global';
        const badges = this.badgeCache.get(channelId);
        
        if (badges) {
        // Ищем бейдж в глобальных или канальных бейджах
        let badgeSet = badges.global[badgeType] || badges.channel[badgeType];
        
        if (badgeSet && badgeSet.versions) {
            const version = badgeSet.versions[badgeVersion] || badgeSet.versions['1'];
                const url = version?.image_url_1x || version?.image_url_2x || version?.image_url_4x;
                if (url) return url;
            }
        }
        
        // Fallback на известные URL значков Twitch (только нужные)
        const knownBadgeUrls = {
            'broadcaster': 'https://static-cdn.jtvnw.net/badges/v1/5527c58c-fb7d-422d-b71b-f309dcb85cc1/2',
            'moderator': 'https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/1',
            'vip': 'https://static-cdn.jtvnw.net/badges/v1/b817aba4-fad8-49e2-b88a-7cc744dfa6ec/1',
            'subscriber': 'https://static-cdn.jtvnw.net/badges/v1/5d9f2208-5dd8-11e7-8513-2ff4adfae661/1'
        };
        
        return knownBadgeUrls[badgeType] || null;
    }
    
    getFallbackBadge(badgeType) {
        // Создаем SVG значки программно (только нужные)
        const svgBadges = {
            'broadcaster': `<svg width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" fill="#9146ff" stroke="#fff" stroke-width="1"/>
                <text x="8" y="11" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">B</text>
            </svg>`,
            'moderator': `<svg width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" fill="#00d4aa" stroke="#fff" stroke-width="1"/>
                <text x="8" y="11" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">M</text>
            </svg>`,
            'vip': `<svg width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" fill="#bf94ff" stroke="#fff" stroke-width="1"/>
                <text x="8" y="11" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">V</text>
            </svg>`,
            'subscriber': `<svg width="1em" height="1em" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="8" r="7" fill="#9146ff" stroke="#fff" stroke-width="1"/>
                <text x="8" y="11" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">S</text>
            </svg>`
        };
        
        const svgBadge = svgBadges[badgeType];
        if (svgBadge) {
            return `<span class="badge ${badgeType}" title="${this.getBadgeTitle(badgeType, '1')}">${svgBadge}</span>`;
        }
        
        // Только в крайнем случае используем эмодзи (только нужные)
        const fallbackMap = {
            'broadcaster': '<span class="badge broadcaster" title="Стример">👑</span>',
            'moderator': '<span class="badge mod" title="Модератор">🛡️</span>',
            'vip': '<span class="badge vip" title="VIP">⭐</span>',
            'subscriber': '<span class="badge subscriber" title="Подписчик">💎</span>'
        };
        return fallbackMap[badgeType] || ''; // Если значка нет - ничего не показываем
    }
    
    addPreviewMessage(username, text, userData = {}) {
        const messagesContainer = this.elements.previewChatMessages;
        
        if (!messagesContainer) {
            console.error('previewChatMessages element not found in addPreviewMessage!');
            return;
        }
        
        // Определяем цвет пользователя
        const userColor = userData.color || this.getDefaultUserColor(username);
        
        // Создаем бейджики
        const badges = this.createUserBadges(userData);
        
        // Используем display-name если есть, иначе username
        const displayName = userData.displayName || username;
        
        const messageElement = document.createElement('div');
        messageElement.className = 'preview-message';
        
        console.log('Preview animation settings:', this.settings.appearAnimation);
        
        // Применяем анимацию если выбрана
        if (this.settings.appearAnimation !== 'none') {
            const animationName = this.getAnimationName(this.settings.appearAnimation);
            const animationDuration = `${this.settings.appearDuration}ms`;
            const animationDelay = this.settings.appearDelay > 0 ? `${this.settings.appearDelay}ms` : '0ms';
            
            console.log('Preview applying animation:', this.settings.appearAnimation, '->', animationName);
            
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
        
        // Применяем центрирование
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
        
        // Применяем настройки шрифтов
        messageElement.style.fontFamily = this.settings.fontFamily;
        messageElement.style.fontSize = this.settings.fontSize + 'px';
        messageElement.style.fontWeight = this.settings.fontWeight;
        messageElement.style.lineHeight = this.settings.lineHeight;
        messageElement.style.letterSpacing = this.settings.letterSpacing + 'px';
        messageElement.style.color = this.settings.fontColor;
        
        // Обрабатываем эмодзи в тексте сообщения
        const processedText = this.processEmotes(text);
        
        messageElement.innerHTML = `<span class="username" style="color: ${userColor}">${badges}${this.escapeHtml(displayName)}:</span><span class="text">${processedText}</span>`;
        
        messagesContainer.appendChild(messageElement);
        this.previewMessageCount++;
        
        // Синхронизируем счетчик с реальным количеством сообщений
        this.syncPreviewMessageCount();
        
        // Ограничиваем количество видимых сообщений в предпросмотре
        this.limitPreviewMessages();
        
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
                            this.syncPreviewMessageCount(); // Синхронизируем после удаления
                        }
                    }, this.settings.disappearDuration);
                } else {
                    // Если анимация исчезновения отключена, просто удаляем элемент
                    if (messageElement.parentNode) {
                        messageElement.parentNode.removeChild(messageElement);
                        this.syncPreviewMessageCount(); // Синхронизируем после удаления
                    }
                }
            }, totalDisplayTime);
        }
        
        // Удаляем старые сообщения если их слишком много
        this.syncPreviewMessageCount(); // Синхронизируем счетчик перед проверкой
        if (this.previewMessageCount > this.previewMaxMessages) {
            const firstMessage = messagesContainer.querySelector('.preview-message');
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
                            this.syncPreviewMessageCount(); // Синхронизируем после удаления
                        }
                    }, this.settings.disappearDuration);
                } else {
                    // Обычное удаление без анимации
                    firstMessage.remove();
                    this.syncPreviewMessageCount(); // Синхронизируем после удаления
                }
            }
        }
        
        // Прокручиваем вниз
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
    
    createUserBadges(userData) {
        let badges = '';
        
        // Проверяем, нужно ли показывать значки пользователей
        if (!this.settings.showUserBadges) {
            return badges;
        }
        
        // Получаем бейджи из userData (если они уже загружены)
        if (userData.badges && userData.badges.length > 0) {
            for (const badge of userData.badges) {
                const [badgeType, badgeVersion] = badge.split('/');
                
                // Используем старые эмодзи значки
                const badgeEmoji = this.getFallbackBadge(badgeType);
                if (badgeEmoji) {
                    badges += badgeEmoji;
                }
            }
        } else {
            // Fallback на настоящие значки Twitch если бейджи не загружены (только нужные)
            if (userData.isBroadcaster) {
                badges += this.getFallbackBadge('broadcaster');
            }
            if (userData.isMod) {
                badges += this.getFallbackBadge('moderator');
            }
            if (userData.isVip) {
                badges += this.getFallbackBadge('vip');
            }
            if (userData.isSubscriber) {
                badges += this.getFallbackBadge('subscriber');
            }
        }
        
        return badges;
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
    
    // Обрабатываем эмодзи в сообщении (для предпросмотра)
    processEmotes(text) {
        if (!text) return text;
        
        // Для предпросмотра используем простую обработку
        // В реальном чате эмодзи будут загружаться через API
        return text;
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
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    generateChatURL() {
        // Используем настройку baseURL или fallback на текущий домен
        const baseURL = this.settings.baseURL ? 
            (this.settings.baseURL.endsWith('/') ? this.settings.baseURL + 'chat.html' : this.settings.baseURL + '/chat.html') :
            window.location.origin + '/chat.html';
        const params = new URLSearchParams();
        
        // Добавляем все настройки как параметры URL
        if (this.settings.channel) params.set('channel', this.settings.channel);
        
        // Настройки рамки
        params.set('borderWidth', this.settings.borderWidth);
        params.set('borderColor', this.settings.borderColor);
        params.set('borderRadius', this.settings.borderRadius);
        params.set('hideBorder', this.settings.hideBorder);
        params.set('enableGlow', this.settings.enableGlow);
        params.set('glowColor', this.settings.glowColor);
        params.set('glowIntensity', this.settings.glowIntensity);
        
        // Настройки фона
        if (this.settings.backgroundImage) params.set('backgroundImage', this.settings.backgroundImage);
        params.set('backgroundSize', this.settings.backgroundSize);
        params.set('backgroundPosition', this.settings.backgroundPosition);
        params.set('backgroundOpacity', this.settings.backgroundOpacity);
        params.set('backgroundColor', this.settings.backgroundColor);
        params.set('backgroundGradient', this.settings.backgroundGradient);
        params.set('gradientColor1', this.settings.gradientColor1);
        params.set('gradientColor2', this.settings.gradientColor2);
        params.set('gradientDirection', this.settings.gradientDirection);
        params.set('hideBackground', this.settings.hideBackground);
        
        // Настройки сообщений
        params.set('fadeMessages', this.settings.fadeMessages);
        params.set('messageAlignment', this.settings.messageAlignment);
        params.set('borderMode', this.settings.borderMode);
        params.set('borderAlignment', this.settings.borderAlignment);
        params.set('chatDirection', this.settings.chatDirection);
        
        // Настройки анимаций
        params.set('appearAnimation', this.settings.appearAnimation);
        params.set('disappearAnimation', this.settings.disappearAnimation);
        params.set('appearDuration', this.settings.appearDuration);
        params.set('appearDelay', this.settings.appearDelay);
        params.set('disappearDuration', this.settings.disappearDuration);
        params.set('messageDisplayTime', this.settings.messageDisplayTime);
        params.set('staggerAnimations', this.settings.staggerAnimations);
        params.set('staggerDelay', this.settings.staggerDelay);
        
        // Настройки фона сообщений
        params.set('messageBackgroundColor', this.settings.messageBackgroundColor);
        params.set('messageBackgroundOpacity', this.settings.messageBackgroundOpacity);
        params.set('messageBackgroundGradient', this.settings.messageBackgroundGradient);
        params.set('messageGradientColor1', this.settings.messageGradientColor1);
        params.set('messageGradientColor2', this.settings.messageGradientColor2);
        params.set('messageGradientDirection', this.settings.messageGradientDirection);
        if (this.settings.messageBackgroundImage1) params.set('messageBackgroundImage1', this.settings.messageBackgroundImage1);
        if (this.settings.messageBackgroundImage2) params.set('messageBackgroundImage2', this.settings.messageBackgroundImage2);
        params.set('messageBgSize1', this.settings.messageBgSize1);
        params.set('messageBgPosition1', this.settings.messageBgPosition1);
        params.set('messageBgSize2', this.settings.messageBgSize2);
        params.set('messageBgPosition2', this.settings.messageBgPosition2);
        
        // Настройки значков
        params.set('showUserBadges', this.settings.showUserBadges);
        params.set('showChannelBadges', this.settings.showChannelBadges);
        
        // Настройки шрифтов
        params.set('fontFamily', this.settings.fontFamily);
        params.set('fontSize', this.settings.fontSize);
        params.set('fontWeight', this.settings.fontWeight);
        params.set('lineHeight', this.settings.lineHeight);
        params.set('letterSpacing', this.settings.letterSpacing);
        params.set('fontColor', this.settings.fontColor);
        
        // Настройки чата
        params.set('maxMessages', this.settings.maxMessages);
        params.set('messageSpeed', this.settings.messageSpeed);
        params.set('chatWidth', this.settings.chatWidth);
        params.set('chatHeight', this.settings.chatHeight);
        
        const paramString = params.toString();
        return paramString ? `${baseURL}?${paramString}` : baseURL;
    }
    
    updateOBSURL() {
        const chatURL = this.generateChatURL();
        this.elements.obsUrl.textContent = chatURL;
    }
    
    async copyURLToClipboard() {
        try {
            const chatURL = this.generateChatURL();
            await navigator.clipboard.writeText(chatURL);
            this.showStatus('📋 URL скопирован в буфер обмена', 'success');
            
            // Временно меняем текст кнопки
            const originalText = this.elements.copyUrlBtn.textContent;
            this.elements.copyUrlBtn.textContent = '✅ Скопировано!';
            setTimeout(() => {
                this.elements.copyUrlBtn.textContent = originalText;
            }, 2000);
        } catch (error) {
            // Fallback для старых браузеров
            const chatURL = this.generateChatURL();
            const textArea = document.createElement('textarea');
            textArea.value = chatURL;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showStatus('📋 URL скопирован в буфер обмена', 'success');
        }
    }
    
    openChat() {
        if (!this.settings.channel) {
            this.showStatus('❌ Сначала укажите название канала', 'error');
            return;
        }
        
        const url = this.generateChatURL();
        window.open(url, '_blank');
        this.showStatus('✅ Чат открыт в новой вкладке', 'success');
    }
    
    
    loadSettings() {
        // Загружаем канал из localStorage
        const savedChannel = localStorage.getItem('twitchChatChannel');
        if (savedChannel) {
            this.settings.channel = savedChannel;
        }
        
        // Загружаем остальные настройки
        const saved = localStorage.getItem('twitchChatSettings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.settings = { ...this.settings, ...parsed };
                this.applySettingsToUI();
            } catch (error) {
                console.error('Ошибка при загрузке настроек:', error);
            }
        }
    }
    
    applySettingsToUI() {
        this.elements.channelInput.value = this.settings.channel;
        
        // Рамка
        this.elements.borderWidth.value = this.settings.borderWidth;
        this.elements.borderWidthNumber.value = this.settings.borderWidth;
        this.elements.borderWidthValue.textContent = this.settings.borderWidth + 'px';
        this.elements.borderColor.value = this.settings.borderColor;
        this.elements.borderRadius.value = this.settings.borderRadius;
        this.elements.borderRadiusNumber.value = this.settings.borderRadius;
        this.elements.borderRadiusValue.textContent = this.settings.borderRadius + 'px';
        this.elements.hideBorder.checked = this.settings.hideBorder;
        this.elements.enableGlow.checked = this.settings.enableGlow;
        this.elements.glowColor.value = this.settings.glowColor;
        this.elements.glowIntensity.value = this.settings.glowIntensity;
        this.elements.glowIntensityNumber.value = this.settings.glowIntensity;
        this.elements.glowIntensityValue.textContent = this.settings.glowIntensity + 'px';
        this.toggleGlowSettings();
        
        // Фон
        this.elements.backgroundImage.value = this.settings.backgroundImage;
        this.elements.backgroundSize.value = this.settings.backgroundSize;
        this.elements.backgroundPosition.value = this.settings.backgroundPosition;
        this.elements.backgroundOpacity.value = this.settings.backgroundOpacity;
        this.elements.backgroundOpacityNumber.value = this.settings.backgroundOpacity;
        this.elements.backgroundOpacityValue.textContent = this.settings.backgroundOpacity + '%';
        this.elements.backgroundColor.value = this.settings.backgroundColor;
        this.elements.backgroundColorText.value = this.settings.backgroundColor;
        this.elements.backgroundGradient.value = this.settings.backgroundGradient;
        this.elements.gradientColor1.value = this.settings.gradientColor1;
        this.elements.gradientColor1Text.value = this.settings.gradientColor1;
        this.elements.gradientColor2.value = this.settings.gradientColor2;
        this.elements.gradientColor2Text.value = this.settings.gradientColor2;
        this.elements.gradientDirection.value = this.settings.gradientDirection;
        this.toggleGradientSettings();
        if (this.elements.hideBackground) this.elements.hideBackground.checked = this.settings.hideBackground;
        if (this.elements.fadeMessages) this.elements.fadeMessages.checked = this.settings.fadeMessages;
        if (this.elements.messageAlignment) this.elements.messageAlignment.value = this.settings.messageAlignment;
        if (this.elements.borderMode) this.elements.borderMode.value = this.settings.borderMode;
        if (this.elements.borderAlignment) this.elements.borderAlignment.value = this.settings.borderAlignment;
        if (this.elements.chatDirection) this.elements.chatDirection.value = this.settings.chatDirection;
        if (this.elements.appearAnimation) this.elements.appearAnimation.value = this.settings.appearAnimation;
        if (this.elements.disappearAnimation) this.elements.disappearAnimation.value = this.settings.disappearAnimation;
        // Старый элемент animationDuration удален
        // Новые настройки анимаций
        if (this.elements.appearDuration) this.elements.appearDuration.value = this.settings.appearDuration;
        if (this.elements.appearDurationNumber) this.elements.appearDurationNumber.value = this.settings.appearDuration;
        if (this.elements.appearDurationValue) this.elements.appearDurationValue.textContent = this.settings.appearDuration + 'ms';
        if (this.elements.appearDelay) this.elements.appearDelay.value = this.settings.appearDelay;
        if (this.elements.appearDelayNumber) this.elements.appearDelayNumber.value = this.settings.appearDelay;
        if (this.elements.appearDelayValue) this.elements.appearDelayValue.textContent = this.settings.appearDelay + 'ms';
        if (this.elements.disappearDuration) this.elements.disappearDuration.value = this.settings.disappearDuration;
        if (this.elements.disappearDurationNumber) this.elements.disappearDurationNumber.value = this.settings.disappearDuration;
        if (this.elements.disappearDurationValue) this.elements.disappearDurationValue.textContent = this.settings.disappearDuration + 'ms';
        if (this.elements.messageDisplayTime) this.elements.messageDisplayTime.value = this.settings.messageDisplayTime;
        if (this.elements.messageDisplayTimeNumber) this.elements.messageDisplayTimeNumber.value = this.settings.messageDisplayTime;
        if (this.elements.messageDisplayTimeValue) this.elements.messageDisplayTimeValue.textContent = this.settings.messageDisplayTime + 'сек';
        if (this.elements.staggerAnimations) this.elements.staggerAnimations.checked = this.settings.staggerAnimations;
        if (this.elements.staggerDelay) this.elements.staggerDelay.value = this.settings.staggerDelay;
        if (this.elements.staggerDelayNumber) this.elements.staggerDelayNumber.value = this.settings.staggerDelay;
        if (this.elements.staggerDelayValue) this.elements.staggerDelayValue.textContent = this.settings.staggerDelay + 'ms';
        
        // Настройки фона сообщений
        this.elements.messageBackgroundColor.value = this.settings.messageBackgroundColor;
        this.elements.messageBackgroundColorText.value = this.settings.messageBackgroundColor;
        this.elements.messageBackgroundOpacity.value = this.settings.messageBackgroundOpacity;
        this.elements.messageBackgroundOpacityNumber.value = this.settings.messageBackgroundOpacity;
        this.elements.messageBackgroundOpacityValue.textContent = this.settings.messageBackgroundOpacity + '%';
        this.elements.messageBackgroundGradient.value = this.settings.messageBackgroundGradient;
        this.elements.messageGradientColor1.value = this.settings.messageGradientColor1;
        this.elements.messageGradientColor1Text.value = this.settings.messageGradientColor1;
        this.elements.messageGradientColor2.value = this.settings.messageGradientColor2;
        this.elements.messageGradientColor2Text.value = this.settings.messageGradientColor2;
        this.elements.messageGradientDirection.value = this.settings.messageGradientDirection;
        this.toggleMessageGradientSettings();
        this.elements.messageBackgroundImage1.value = this.settings.messageBackgroundImage1;
        this.elements.messageBackgroundImage2.value = this.settings.messageBackgroundImage2;
        this.elements.messageBgSize1.value = this.settings.messageBgSize1;
        this.elements.messageBgPosition1.value = this.settings.messageBgPosition1;
        this.elements.messageBgSize2.value = this.settings.messageBgSize2;
        this.elements.messageBgPosition2.value = this.settings.messageBgPosition2;
        // Настройки значков
        this.elements.showUserBadges.checked = this.settings.showUserBadges;
        this.elements.showChannelBadges.checked = this.settings.showChannelBadges;
        // Настройки шрифтов
        this.elements.fontFamily.value = this.settings.fontFamily;
        this.elements.fontSearch.value = ''; // Очищаем поиск при загрузке настроек
        this.elements.fontSize.value = this.settings.fontSize;
        this.elements.fontSizeNumber.value = this.settings.fontSize;
        this.elements.fontSizeValue.textContent = this.settings.fontSize + 'px';
        this.elements.fontWeight.value = this.settings.fontWeight;
        this.elements.lineHeight.value = this.settings.lineHeight;
        this.elements.lineHeightNumber.value = this.settings.lineHeight;
        this.elements.lineHeightValue.textContent = this.settings.lineHeight;
        this.elements.letterSpacing.value = this.settings.letterSpacing;
        this.elements.letterSpacingNumber.value = this.settings.letterSpacing;
        this.elements.letterSpacingValue.textContent = this.settings.letterSpacing + 'px';
        this.elements.fontColor.value = this.settings.fontColor;
        this.elements.fontColorText.value = this.settings.fontColor;
        
        // Сообщения
        this.elements.maxMessages.value = this.settings.maxMessages;
        this.elements.maxMessagesNumber.value = this.settings.maxMessages;
        this.elements.maxMessagesValue.textContent = this.settings.maxMessages;
        this.elements.messageSpeed.value = this.settings.messageSpeed;
        this.elements.messageSpeedNumber.value = this.settings.messageSpeed;
        this.elements.messageSpeedValue.textContent = this.settings.messageSpeed + 'ms';
        
        // OBS
        this.elements.chatWidth.value = this.settings.chatWidth;
        this.elements.chatWidthNumber.value = this.settings.chatWidth;
        this.elements.chatWidthValue.textContent = this.settings.chatWidth + 'px';
        this.elements.chatHeight.value = this.settings.chatHeight;
        this.elements.chatHeightNumber.value = this.settings.chatHeight;
        this.elements.chatHeightValue.textContent = this.settings.chatHeight + 'px';
    }
    
    saveSettings() {
        localStorage.setItem('twitchChatSettings', JSON.stringify(this.settings));
    }
    
    resetSettings() {
        if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
            localStorage.removeItem('twitchChatSettings');
            
            // Полная очистка предпросмотра
            this.clearPreviewMessages();
            
            // Сброс настроек к значениям по умолчанию
            this.settings = {
                channel: '',
                borderWidth: 3,
                borderColor: '#9146ff',
                borderRadius: 10,
                hideBorder: false,
                backgroundImage: '',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundOpacity: 100,
                backgroundColor: '#1a1a2e',
                backgroundGradient: 'none',
                gradientColor1: '#1a1a2e',
                gradientColor2: '#16213e',
                gradientDirection: 'to right',
                hideBackground: false,
                fadeMessages: false, // По умолчанию отключено
                messageAlignment: 'left',
                borderMode: 'fit-content',
                borderAlignment: 'left',
                chatDirection: 'bottom-to-top',
                appearAnimation: 'none',
                disappearAnimation: 'fade-out',
                appearDuration: 1000,
                appearDelay: 0,
                disappearDuration: 500,
                messageDisplayTime: 10,
                staggerAnimations: false,
                staggerDelay: 100,
                messageBackgroundColor: '#1a1a1a',
                messageBackgroundOpacity: 80,
                messageBackgroundGradient: 'none',
                messageGradientColor1: '#1a1a1a',
                messageGradientColor2: '#2a2a2a',
                messageGradientDirection: 'to right',
                messageBackgroundImage1: '',
                messageBackgroundImage2: '',
                messageBgSize1: 'cover',
                messageBgPosition1: 'center',
                messageBgSize2: 'cover',
                messageBgPosition2: 'center',
                showUserBadges: true,
                showChannelBadges: true,
                fontFamily: 'Arial, sans-serif',
                fontSize: 14,
                fontWeight: 'normal',
                lineHeight: 1.2,
                letterSpacing: 0,
                fontColor: '#ffffff',
                maxMessages: 100,
                messageSpeed: 300,
                chatWidth: 800,
                chatHeight: 600
            };
            
            // Применяем настройки и обновляем предпросмотр
            this.applySettingsToUI();
            this.updatePreview();
            
            // Добавляем демо-сообщения заново
            setTimeout(() => {
                this.addDemoMessages();
                this.showStatus('🔄 Настройки сброшены', 'success');
            }, 100);
        }
    }
    
    exportSettings() {
        try {
            // Создаем объект с настройками и метаданными
            const exportData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                settings: this.settings,
                description: 'Amperverser Chat Settings'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
            link.download = `amperverser-chat-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
        link.click();
            document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showStatus('📤 Настройки экспортированы', 'success');
        } catch (error) {
            console.error('Ошибка при экспорте настроек:', error);
            this.showStatus('❌ Ошибка при экспорте', 'error');
        }
    }
    
    importSettings(file) {
        if (!file) return;
        
        // Проверяем тип файла
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showStatus('❌ Выберите JSON файл', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                
                // Проверяем структуру файла
                let settingsToImport;
                if (imported.settings && imported.version) {
                    // Новый формат с метаданными
                    settingsToImport = imported.settings;
                    console.log(`Импорт настроек версии ${imported.version} от ${imported.timestamp}`);
                } else if (imported.channel || imported.borderWidth !== undefined) {
                    // Старый формат - прямые настройки
                    settingsToImport = imported;
                } else {
                    throw new Error('Неверный формат файла настроек');
                }
                
                // Полная очистка предпросмотра
                this.clearPreviewMessages();
                
                // Импортируем настройки
                this.settings = { ...this.settings, ...settingsToImport };
                
                // Применяем настройки
                this.applySettingsToUI();
                this.saveSettings();
                this.updatePreview();
                
                // Добавляем демо-сообщения заново
                setTimeout(() => {
                    this.addDemoMessages();
                this.showStatus('📥 Настройки импортированы', 'success');
                }, 100);
                
            } catch (error) {
                console.error('Ошибка при импорте настроек:', error);
                this.showStatus('❌ Ошибка при импорте настроек', 'error');
            }
        };
        
        reader.onerror = () => {
            this.showStatus('❌ Ошибка чтения файла', 'error');
        };
        
        reader.readAsText(file);
    }
    
    showStatus(message, type = 'info') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = `status-${type}`;
        
        setTimeout(() => {
            this.elements.statusMessage.textContent = 'Готов к работе';
            this.elements.statusMessage.className = '';
        }, 3000);
    }
    
    // Метод для фильтрации шрифтов по поисковому запросу
    filterFonts(searchTerm) {
        const select = this.elements.fontFamily;
        const options = select.querySelectorAll('option');
        const optgroups = select.querySelectorAll('optgroup');
        const clearBtn = this.elements.clearFontSearch;
        
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Показываем/скрываем кнопку очистки
        if (searchLower === '') {
            clearBtn.style.display = 'none';
        } else {
            clearBtn.style.display = 'flex';
        }
        
        if (searchLower === '') {
            // Показываем все опции и группы
            options.forEach(option => {
                option.classList.remove('hidden');
            });
            optgroups.forEach(group => {
                group.style.display = '';
            });
            return;
        }
        
        let hasVisibleOptions = false;
        
        optgroups.forEach(group => {
            const groupOptions = group.querySelectorAll('option');
            let groupHasVisibleOptions = false;
            
            groupOptions.forEach(option => {
                const optionText = option.textContent.toLowerCase();
                const optionValue = option.value.toLowerCase();
                
                // Поиск по названию шрифта и описанию
                if (optionText.includes(searchLower) || optionValue.includes(searchLower)) {
                    option.classList.remove('hidden');
                    groupHasVisibleOptions = true;
                    hasVisibleOptions = true;
                } else {
                    option.classList.add('hidden');
                }
            });
            
            // Скрываем группу, если в ней нет видимых опций
            group.style.display = groupHasVisibleOptions ? '' : 'none';
        });
        
        // Если ничего не найдено, показываем сообщение
        if (!hasVisibleOptions && searchLower !== '') {
            this.showStatus(`🔍 По запросу "${searchTerm}" ничего не найдено. Попробуйте: майнкрафт, майнинг, космос, ретро, неон, игровой`, 'info');
        } else if (hasVisibleOptions) {
            const visibleCount = select.querySelectorAll('option:not(.hidden)').length;
            this.showStatus(`🔍 Найдено ${visibleCount} шрифтов`, 'success');
        }
    }
    
    // Метод для загрузки Google Fonts
    loadGoogleFont(fontFamily) {
        // Извлекаем название шрифта из CSS значения
        const fontName = fontFamily.replace(/['"]/g, '').split(',')[0].trim();
        
        // Проверяем, является ли это Google Font
        const googleFonts = [
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Source Sans Pro', 'Poppins',
            'Nunito', 'Ubuntu', 'PT Sans', 'Droid Sans', 'Fira Sans', 'Oswald',
            'Raleway', 'Work Sans', 'Inter', 'DM Sans', 'Noto Sans', 'Quicksand',
            'Exo 2', 'Mukti', 'Playfair Display', 'Merriweather', 'Lora', 'PT Serif',
            'Crimson Text', 'Libre Baskerville', 'Source Serif Pro', 'Droid Serif',
            'Noto Serif', 'Bitter', 'Vollkorn', 'Cormorant Garamond', 'Bebas Neue',
            'Fredoka One', 'Righteous', 'Lobster', 'Pacifico', 'Dancing Script',
            'Satisfy', 'Kalam', 'Caveat', 'Amatic SC', 'Bangers', 'Creepster',
            'Fascinate', 'Orbitron', 'Fira Code', 'Source Code Pro', 'JetBrains Mono',
            'Roboto Mono', 'Ubuntu Mono', 'PT Mono', 'Droid Sans Mono', 'Noto Sans Mono',
            'Space Mono', 'Inconsolata',
            // Новые игровые и футуристические шрифты
            'Audiowide', 'Electrolize', 'Michroma', 'Russo One', 'Press Start 2P',
            'VT323', 'Share Tech Mono', 'Nova Mono', 'Rationale', 'Aldrich',
            'Rajdhani', 'Syncopate',
            // Новые креативные шрифты
            'Permanent Marker', 'Shadows Into Light', 'Indie Flower', 'Comfortaa',
            'Chewy', 'Bungee', 'Bungee Shade', 'Bungee Inline', 'Bungee Hairline',
            'Bungee Outline', 'Bungee Spice', 'Butcherman', 'Butcherman Caps',
            'Butcherman Condensed', 'Butcherman Inline', 'Butcherman Outline',
            'Butcherman Spice', 'Butcherman Hairline', 'Butcherman Shade'
        ];
        
        if (googleFonts.includes(fontName)) {
            // Проверяем, не загружен ли уже этот шрифт
            const existingLink = document.querySelector(`link[href*="${fontName}"]`);
            if (!existingLink) {
                // Создаем ссылку на Google Fonts
                const link = document.createElement('link');
                link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700;800;900&display=swap`;
                link.rel = 'stylesheet';
                document.head.appendChild(link);
                
                console.log(`Google Font "${fontName}" загружен`);
            }
        }
    }
    
    // Метод для инициализации Google Fonts при загрузке
    initializeGoogleFonts() {
        // Загружаем несколько популярных шрифтов заранее
        const popularFonts = [
            'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
            'Orbitron', 'Press Start 2P', 'VT323', 'Share Tech Mono', 'Electrolize'
        ];
        popularFonts.forEach(font => {
            this.loadGoogleFont(`'${font}', sans-serif`);
        });
        
        // Инициализируем предпросмотр шрифтов
        this.initializeFontPreview();
    }
    
    // Метод для инициализации предпросмотра шрифтов
    initializeFontPreview() {
        const select = this.elements.fontFamily;
        const options = select.querySelectorAll('option');
        
        options.forEach(option => {
            if (option.value) {
                // Добавляем атрибут для предпросмотра
                option.setAttribute('data-font', option.value);
                option.style.fontFamily = option.value;
            }
        });
    }
    // Метод для валидации цвета
    isValidColor(color) {
        const s = new Option().style;
        s.color = color;
        return s.color !== '';
    }
    
    // Метод для показа предустановленных цветов
    showColorPresets() {
        const presets = [
            { name: 'Белый', color: '#ffffff' },
            { name: 'Черный', color: '#000000' },
            { name: 'Красный', color: '#ff0000' },
            { name: 'Зеленый', color: '#00ff00' },
            { name: 'Синий', color: '#0000ff' },
            { name: 'Желтый', color: '#ffff00' },
            { name: 'Фиолетовый', color: '#9146ff' },
            { name: 'Оранжевый', color: '#ff6600' },
            { name: 'Розовый', color: '#ff69b4' },
            { name: 'Голубой', color: '#00ffff' },
            { name: 'Серый', color: '#808080' },
            { name: 'Золотой', color: '#ffd700' },
            { name: 'Серебряный', color: '#c0c0c0' },
            { name: 'Неоновый зеленый', color: '#39ff14' },
            { name: 'Неоновый синий', color: '#00bfff' },
            { name: 'Неоновый розовый', color: '#ff1493' }
        ];
        
        // Создаем модальное окно с предустановленными цветами
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: #1a1a2e;
            border: 2px solid #9146ff;
            border-radius: 15px;
            padding: 20px;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const title = document.createElement('h3');
        title.textContent = '🎨 Предустановленные цвета';
        title.style.cssText = `
            color: #9146ff;
            margin-bottom: 20px;
            text-align: center;
        `;
        
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        `;
        
        presets.forEach(preset => {
            const button = document.createElement('button');
            button.style.cssText = `
                padding: 10px;
                border: 2px solid ${preset.color};
                border-radius: 8px;
                background: rgba(255, 255, 255, 0.05);
                color: ${preset.color};
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
            `;
            button.innerHTML = `
                <div style="width: 20px; height: 20px; background: ${preset.color}; border-radius: 50%; margin: 0 auto 5px;"></div>
                ${preset.name}
            `;
            
            button.addEventListener('click', () => {
                this.settings.fontColor = preset.color;
                this.elements.fontColor.value = preset.color;
                this.elements.fontColorText.value = preset.color;
                this.updatePreview();
                document.body.removeChild(modal);
            });
            
            button.addEventListener('mouseenter', () => {
                button.style.background = `${preset.color}20`;
                button.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.background = 'rgba(255, 255, 255, 0.05)';
                button.style.transform = 'translateY(0)';
            });
            
            grid.appendChild(button);
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '❌ Закрыть';
        closeBtn.style.cssText = `
            width: 100%;
            padding: 10px;
            background: #9146ff;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
        `;
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        content.appendChild(title);
        content.appendChild(grid);
        content.appendChild(closeBtn);
        modal.appendChild(content);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
        
        document.body.appendChild(modal);
    }
    
    // Метод для переключения настроек градиента фона
    toggleGradientSettings() {
        if (this.settings.backgroundGradient === 'none') {
            this.elements.gradientSettings.style.display = 'none';
        } else {
            this.elements.gradientSettings.style.display = 'block';
        }
    }
    
    // Метод для переключения настроек градиента фона сообщений
    toggleMessageGradientSettings() {
        if (this.settings.messageBackgroundGradient === 'none') {
            this.elements.messageGradientSettings.style.display = 'none';
        } else {
            this.elements.messageGradientSettings.style.display = 'block';
        }
    }
    
    // Метод для создания градиента
    createGradient(gradientType, color1, color2, direction) {
        switch (gradientType) {
            case 'linear':
                return `linear-gradient(${direction}, ${color1}, ${color2})`;
            case 'radial':
                return `radial-gradient(circle, ${color1}, ${color2})`;
            case 'conic':
                return `conic-gradient(from 0deg, ${color1}, ${color2})`;
            default:
                return color1;
        }
    }
    
    // Подключение предпросмотра к реальному чату
    async connectPreviewToChat() {
        if (!this.settings.channel) {
            this.showStatus('❌ Сначала укажите канал!', 'error');
            return;
        }
        
        if (this.previewConnected) {
            this.showStatus('⚠️ Уже подключено к чату!', 'warning');
            return;
        }
        
        this.updatePreviewStatus('connecting', 'Подключение...');
        this.elements.connectPreviewBtn.style.display = 'none';
        this.elements.disconnectPreviewBtn.style.display = 'inline-block';
        
        try {
            // Создаем экземпляр чата для предпросмотра
            this.previewChatInstance = new TwitchChat();
            
            // Очищаем предпросмотр от демо-сообщений
            this.clearPreviewMessages();
            
            // Подключаемся к чату
            await this.previewChatInstance.connectToChat(this.settings.channel);
            
            // Переопределяем метод добавления сообщений для предпросмотра
            const originalAddMessage = this.previewChatInstance.addChatMessage.bind(this.previewChatInstance);
            this.previewChatInstance.addChatMessage = (username, text, userData) => {
                // Добавляем сообщение в реальный чат
                originalAddMessage(username, text, userData);
                
                // Добавляем сообщение в предпросмотр
                this.addPreviewMessage(username, text, userData);
            };
            
            this.previewConnected = true;
            this.updatePreviewStatus('connected', 'Подключено');
            this.showStatus('✅ Подключено к чату ' + this.settings.channel, 'success');
            
        } catch (error) {
            console.error('Ошибка подключения к чату:', error);
            this.updatePreviewStatus('disconnected', 'Ошибка подключения');
            this.elements.connectPreviewBtn.style.display = 'inline-block';
            this.elements.disconnectPreviewBtn.style.display = 'none';
            this.showStatus('❌ Ошибка подключения к чату: ' + error.message, 'error');
        }
    }
    
    // Отключение от чата
    disconnectPreviewFromChat() {
        if (!this.previewConnected) {
            this.showStatus('⚠️ Не подключено к чату!', 'warning');
            return;
        }
        
        try {
            // Отключаемся от чата
            if (this.previewChatInstance) {
                this.previewChatInstance.disconnect();
                this.previewChatInstance = null;
            }
            
            this.previewConnected = false;
            this.updatePreviewStatus('disconnected', 'Отключено');
            this.elements.connectPreviewBtn.style.display = 'inline-block';
            this.elements.disconnectPreviewBtn.style.display = 'none';
            
            // Очищаем предпросмотр и добавляем демо-сообщения
            this.clearPreviewMessages();
            this.addDemoMessages();
            
            this.showStatus('🔌 Отключено от чата', 'info');
            
        } catch (error) {
            console.error('Ошибка отключения от чата:', error);
            this.showStatus('❌ Ошибка отключения: ' + error.message, 'error');
        }
    }
    
    // Обновление статуса предпросмотра
    updatePreviewStatus(status, text) {
        this.elements.previewStatus.textContent = text;
        this.elements.previewStatus.className = 'preview-status ' + status;
    }
}

// Инициализация редактора при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.chatEditor = new ChatEditor();
});

