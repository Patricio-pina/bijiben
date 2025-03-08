// 音频管理系统
class AudioManager {
    constructor() {
        this.sounds = {};
        this.bgMusic = null;
        this.isMuted = false;
        this.volume = 0.5;
        this.bgMusicVolume = 0.3;
        this.sfxVolume = 0.7;
        this.isInitialized = false;
        this.loadFailed = false;
    }

    // 初始化音频系统
    init() {
        if (this.isInitialized) return;
        
        try {
            // 尝试加载音频
            this.loadAudio();
            
            // 添加音量控制事件监听器
            const volumeControl = document.getElementById('volumeControl');
            if (volumeControl) {
                volumeControl.addEventListener('input', (e) => {
                    this.setVolume(parseFloat(e.target.value));
                });
            }
            
            // 添加静音按钮事件监听器
            const muteBtn = document.getElementById('muteBtn');
            if (muteBtn) {
                muteBtn.addEventListener('click', () => {
                    this.toggleMute();
                });
            }
            
            this.isInitialized = true;
        } catch (error) {
            console.log("音频初始化失败:", error);
            this.loadFailed = true;
        }
    }
    
    // 加载所有音频
    loadAudio() {
        // 使用内置的音效，避免依赖外部文件
        this.loadDefaultSounds();
    }
    
    // 加载默认音效（使用AudioContext API生成音效）
    loadDefaultSounds() {
        // 创建音频上下文
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.log('Web Audio API不受支持，使用静音模式');
            this.loadFailed = true;
            return;
        }
        
        // 创建默认音效
        this.createDefaultSound('button_click', 'click');
        this.createDefaultSound('tower_place', 'place');
        this.createDefaultSound('tower_upgrade', 'upgrade');
        this.createDefaultSound('enemy_hit', 'hit');
        this.createDefaultSound('enemy_death', 'death');
        this.createDefaultSound('boss_spawn', 'boss');
        this.createDefaultSound('boss_death', 'bossDeath');
        this.createDefaultSound('wave_start', 'wave');
        this.createDefaultSound('gold_earn', 'coin');
        this.createDefaultSound('game_over', 'gameOver');
    }
    
    // 创建默认音效
    createDefaultSound(name, type) {
        const sound = {
            play: () => {
                if (this.isMuted || this.loadFailed) return;
                
                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();
                    
                    // 设置音量
                    gainNode.gain.value = this.sfxVolume * this.volume;
                    
                    // 连接节点
                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);
                    
                    // 根据类型设置不同的音效参数
                    switch (type) {
                        case 'click':
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.1);
                            break;
                        case 'place':
                            oscillator.type = 'square';
                            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.2);
                            break;
                        case 'upgrade':
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.3);
                            break;
                        case 'hit':
                            oscillator.type = 'sawtooth';
                            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                            gainNode.gain.setValueAtTime(gainNode.gain.value * 0.3, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.1);
                            break;
                        case 'death':
                            oscillator.type = 'triangle';
                            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.3);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.3);
                            break;
                        case 'boss':
                            oscillator.type = 'sawtooth';
                            oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
                            oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 0.2);
                            oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.3);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.4);
                            break;
                        case 'bossDeath':
                            oscillator.type = 'sawtooth';
                            oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.5);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.5);
                            break;
                        case 'wave':
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(500, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(700, this.audioContext.currentTime + 0.1);
                            oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.2);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.2);
                            break;
                        case 'coin':
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(700, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(900, this.audioContext.currentTime + 0.1);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.1);
                            break;
                        case 'gameOver':
                            oscillator.type = 'sine';
                            oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
                            oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.5);
                            break;
                        default:
                            oscillator.type = 'sine';
                            oscillator.frequency.value = 440;
                            gainNode.gain.setValueAtTime(gainNode.gain.value, this.audioContext.currentTime);
                            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                            oscillator.start();
                            oscillator.stop(this.audioContext.currentTime + 0.1);
                    }
                } catch (e) {
                    console.log(`播放音效 ${name} 失败:`, e);
                }
            },
            cloneNode: function() {
                return this;
            }
        };
        
        this.sounds[name] = sound;
    }

    // 加载背景音乐
    loadBackgroundMusic(url) {
        try {
            // 创建简单的背景音乐
            if (this.audioContext) {
                const bgMusic = {
                    isPlaying: false,
                    play: () => {
                        if (this.isMuted || this.loadFailed || bgMusic.isPlaying) return;
                        
                        try {
                            // 创建简单的背景音乐
                            const oscillator1 = this.audioContext.createOscillator();
                            const oscillator2 = this.audioContext.createOscillator();
                            const gainNode = this.audioContext.createGain();
                            
                            // 设置音量
                            gainNode.gain.value = this.bgMusicVolume * this.volume * 0.2;
                            
                            // 设置音调
                            oscillator1.type = 'sine';
                            oscillator1.frequency.value = 220;
                            
                            oscillator2.type = 'triangle';
                            oscillator2.frequency.value = 330;
                            
                            // 连接节点
                            oscillator1.connect(gainNode);
                            oscillator2.connect(gainNode);
                            gainNode.connect(this.audioContext.destination);
                            
                            // 开始播放
                            oscillator1.start();
                            oscillator2.start();
                            
                            // 设置循环
                            bgMusic.isPlaying = true;
                            bgMusic.oscillator1 = oscillator1;
                            bgMusic.oscillator2 = oscillator2;
                            bgMusic.gainNode = gainNode;
                        } catch (e) {
                            console.log('背景音乐播放失败:', e);
                        }
                    },
                    pause: () => {
                        if (!bgMusic.isPlaying) return;
                        
                        try {
                            // 停止播放
                            if (bgMusic.oscillator1) {
                                bgMusic.oscillator1.stop();
                                bgMusic.oscillator2.stop();
                                bgMusic.isPlaying = false;
                            }
                        } catch (e) {
                            console.log('背景音乐暂停失败:', e);
                        }
                    }
                };
                
                this.bgMusic = bgMusic;
            }
        } catch (e) {
            console.log('加载背景音乐失败:', e);
        }
    }

    // 加载音效
    loadSound(name, url) {
        // 音效已经在loadDefaultSounds中创建
    }

    // 播放背景音乐
    playBackgroundMusic() {
        if (this.bgMusic && !this.isMuted && !this.loadFailed) {
            try {
                this.bgMusic.play();
            } catch (error) {
                console.log("背景音乐播放失败: ", error);
            }
        }
    }

    // 暂停背景音乐
    pauseBackgroundMusic() {
        if (this.bgMusic) {
            try {
                this.bgMusic.pause();
            } catch (error) {
                console.log("背景音乐暂停失败: ", error);
            }
        }
    }

    // 播放音效
    playSound(name) {
        if (this.sounds[name] && !this.isMuted && !this.loadFailed) {
            try {
                this.sounds[name].play();
            } catch (error) {
                console.log(`音效 ${name} 播放失败: `, error);
            }
        }
    }

    // 设置音量
    setVolume(value) {
        this.volume = value;
        
        // 更新UI
        const volumeControl = document.getElementById('volumeControl');
        if (volumeControl) {
            volumeControl.value = this.volume;
        }
        
        // 如果音量为0，显示静音图标
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            if (this.volume === 0) {
                muteBtn.textContent = '🔇';
                this.isMuted = true;
                this.pauseBackgroundMusic();
            } else {
                muteBtn.textContent = '🔊';
                this.isMuted = false;
                this.playBackgroundMusic();
            }
        }
    }

    // 切换静音状态
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        const muteBtn = document.getElementById('muteBtn');
        if (muteBtn) {
            if (this.isMuted) {
                muteBtn.textContent = '🔇';
                this.pauseBackgroundMusic();
            } else {
                muteBtn.textContent = '🔊';
                this.playBackgroundMusic();
            }
        }
    }
}

// 创建全局音频管理器实例
const audioManager = new AudioManager(); 