// 游戏常量
const TILE_SIZE = 40;
const GRID_WIDTH = 20;
const GRID_HEIGHT = 12;
const ENEMY_TYPES = {
    NORMAL: { color: 'red', health: 100, speed: 1, reward: 10 },
    FAST: { color: 'orange', health: 60, speed: 2, reward: 15 },
    TANK: { color: 'darkred', health: 200, speed: 0.5, reward: 20 },
    // BOSS类型
    BOSS: { color: 'purple', health: 500, speed: 0.7, reward: 50, size: 1.5, isBoss: true },
    // 大BOSS类型
    MEGA_BOSS: { color: 'black', health: 2000, speed: 0.4, reward: 200, size: 2, isBoss: true, isMegaBoss: true }
};
const TOWER_TYPES = {
    BASIC: { color: 'blue', damage: 20, range: 100, cost: 10, fireRate: 1, level: 1 },
    ARROW: { color: 'green', damage: 15, range: 150, cost: 20, fireRate: 2, level: 1 },
    MAGIC: { color: 'purple', damage: 30, range: 120, cost: 30, fireRate: 0.8, level: 1 },
    // 升级后的塔
    BASIC_2: { color: 'lightblue', damage: 45, range: 120, cost: 25, fireRate: 1.2, level: 2 },
    ARROW_2: { color: 'lightgreen', damage: 35, range: 180, cost: 45, fireRate: 2.5, level: 2 },
    MAGIC_2: { color: 'mediumpurple', damage: 65, range: 140, cost: 65, fireRate: 1, level: 2 },
    BASIC_3: { color: 'deepskyblue', damage: 100, range: 150, cost: 60, fireRate: 1.5, level: 3 },
    ARROW_3: { color: 'springgreen', damage: 80, range: 220, cost: 100, fireRate: 3, level: 3 },
    MAGIC_3: { color: 'blueviolet', damage: 150, range: 170, cost: 140, fireRate: 1.2, level: 3 }
};

// 塔升级路径
const TOWER_UPGRADES = {
    BASIC: 'BASIC_2',
    ARROW: 'ARROW_2',
    MAGIC: 'MAGIC_2',
    BASIC_2: 'BASIC_3',
    ARROW_2: 'ARROW_3',
    MAGIC_2: 'MAGIC_3'
};

// 游戏状态
let gameState = {
    gold: 100,
    lives: 10,
    wave: 0,
    level: 0, // 当前关卡
    enemies: [],
    towers: [],
    projectiles: [],
    path: [],
    selectedTower: null,
    waveInProgress: false,
    lastFrameTime: 0,
    grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0)),
    // 拖拽相关状态
    draggedTower: null,
    isDragging: false,
    // 塔布放拖拽状态
    isPlacingTower: false,
    placingTowerType: null,
    placingTowerX: 0,
    placingTowerY: 0,
    // BOSS相关状态
    bossSpawned: false,
    megaBossSpawned: false,
    bossHealthBar: {
        visible: false,
        health: 0,
        maxHealth: 0,
        name: ""
    },
    // 游戏控制状态
    isPaused: false,
    autoStartWave: true,
    waveDelay: 5000, // 下一波开始前的延迟（毫秒）
    waveDelayTimer: 0, // 当前延迟计时器
    waveCountdown: 0, // 倒计时显示
    // 音频状态
    audio: {
        bgMusic: null,
        isMuted: false,
        volume: 0.5,
        sounds: {}
    }
};

// 获取DOM元素
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const goldDisplay = document.getElementById('gold');
const livesDisplay = document.getElementById('lives');
const waveDisplay = document.getElementById('wave');
const levelDisplay = document.getElementById('level');
const countdownDisplay = document.getElementById('countdown');
const pauseBtn = document.getElementById('pauseBtn');
const towerButtons = {
    basic: document.getElementById('basicTower'),
    arrow: document.getElementById('arrowTower'),
    magic: document.getElementById('magicTower')
};
const bossHealthContainer = document.getElementById('bossHealthContainer');
const bossNameDisplay = document.getElementById('bossName');
const bossHealthBar = document.getElementById('bossHealthBar');

// 初始化游戏地图和路径
function initializeGame() {
    // 创建一个简单的路径
    createPath();
    
    // 绘制初始地图
    drawGame();
    
    // 更新UI
    updateUI();
    
    // 添加事件监听器
    addEventListeners();
    
    // 初始化音频系统
    audioManager.init();
    
    // 设置第一波的延迟
    if (gameState.autoStartWave) {
        gameState.waveDelayTimer = Date.now();
        gameState.waveCountdown = gameState.waveDelay;
    }
}

// 创建敌人路径
function createPath() {
    // 简单的S形路径
    gameState.path = [];
    
    // 起点（左边缘）
    let x = 0;
    let y = 1;
    gameState.path.push({x, y});
    
    // 向右移动到接近右边缘
    while (x < GRID_WIDTH - 2) {
        x++;
        gameState.path.push({x, y});
        gameState.grid[y][x] = 1; // 标记为路径
    }
    
    // 向下移动
    while (y < GRID_HEIGHT - 2) {
        y++;
        gameState.path.push({x, y});
        gameState.grid[y][x] = 1;
    }
    
    // 向左移动到接近左边缘
    while (x > 1) {
        x--;
        gameState.path.push({x, y});
        gameState.grid[y][x] = 1;
    }
    
    // 向下移动到底部
    while (y < GRID_HEIGHT - 1) {
        y++;
        gameState.path.push({x, y});
        gameState.grid[y][x] = 1;
    }
    
    // 向右移动到右边缘（终点）
    while (x < GRID_WIDTH - 1) {
        x++;
        gameState.path.push({x, y});
        gameState.grid[y][x] = 1;
    }
    
    // 设置起点和终点
    gameState.grid[gameState.path[0].y][gameState.path[0].x] = 2; // 起点
    gameState.grid[gameState.path[gameState.path.length-1].y][gameState.path[gameState.path.length-1].x] = 3; // 终点
}

// 添加事件监听器
function addEventListeners() {
    // 暂停按钮
    pauseBtn.addEventListener('click', togglePause);
    
    // 选择塔类型
    towerButtons.basic.addEventListener('click', () => selectTower('BASIC'));
    towerButtons.arrow.addEventListener('click', () => selectTower('ARROW'));
    towerButtons.magic.addEventListener('click', () => selectTower('MAGIC'));
    
    // 在画布上放置塔
    canvas.addEventListener('click', handleCanvasClick);
    
    // 拖拽相关事件
    canvas.addEventListener('mousedown', startDragging);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // 右键点击取消操作
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        cancelTowerPlacement();
        return false;
    });
    
    // 键盘事件 - 空格键暂停/继续游戏
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            togglePause();
        }
    });
}

// 切换游戏暂停/继续状态
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    
    // 播放按钮点击音效
    audioManager.playSound('button_click');
    
    // 更新按钮文本
    pauseBtn.textContent = gameState.isPaused ? '继续游戏' : '暂停游戏';
    
    // 更新游戏容器类
    if (gameState.isPaused) {
        document.body.classList.add('paused');
        
        // 创建暂停覆盖层
        const gameArea = document.querySelector('.game-area');
        let pauseOverlay = document.querySelector('.paused-overlay');
        
        if (!pauseOverlay) {
            pauseOverlay = document.createElement('div');
            pauseOverlay.className = 'paused-overlay';
            
            const pauseText = document.createElement('div');
            pauseText.className = 'paused-text';
            pauseText.textContent = '游戏已暂停';
            
            pauseOverlay.appendChild(pauseText);
            gameArea.appendChild(pauseOverlay);
        } else {
            pauseOverlay.style.display = 'flex';
        }
        
        // 暂停背景音乐
        audioManager.pauseBackgroundMusic();
    } else {
        document.body.classList.remove('paused');
        
        // 隐藏暂停覆盖层
        const pauseOverlay = document.querySelector('.paused-overlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
        }
        
        // 继续播放背景音乐
        audioManager.playBackgroundMusic();
        
        // 重置上一帧时间，避免暂停后的大幅度时间跳跃
        gameState.lastFrameTime = 0;
    }
}

// 处理鼠标移动
function handleMouseMove(event) {
    // 处理塔的拖拽移动
    if (gameState.isDragging && gameState.draggedTower) {
        dragTower(event);
    }
    
    // 处理塔的放置预览
    if (gameState.isPlacingTower) {
        const rect = canvas.getBoundingClientRect();
        gameState.placingTowerX = event.clientX - rect.left;
        gameState.placingTowerY = event.clientY - rect.top;
    }
}

// 处理鼠标抬起
function handleMouseUp(event) {
    // 如果正在拖拽塔，处理拖拽结束
    if (gameState.isDragging) {
        endDragging(event);
    }
    
    // 如果正在放置塔，尝试放置
    if (gameState.isPlacingTower) {
        placeTowerAtCurrentPosition(event);
    }
}

// 处理鼠标离开画布
function handleMouseLeave(event) {
    // 如果正在拖拽塔，取消拖拽
    if (gameState.isDragging) {
        cancelDragging();
    }
    
    // 如果正在放置塔，不做任何操作（保持放置状态）
}

// 处理画布点击事件
function handleCanvasClick(event) {
    // 如果正在拖拽，不处理点击事件
    if (gameState.isDragging) return;
    
    // 如果正在放置塔，尝试放置
    if (gameState.isPlacingTower) {
        placeTowerAtCurrentPosition(event);
    }
}

// 在当前位置放置塔
function placeTowerAtCurrentPosition(event) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    
    // 检查是否可以在此位置放置塔
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && gameState.grid[y][x] === 0) {
        // 创建新塔
        const towerType = TOWER_TYPES[gameState.placingTowerType];
        const tower = {
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE / 2,
            type: gameState.placingTowerType,
            damage: towerType.damage,
            range: towerType.range,
            fireRate: towerType.fireRate,
            lastFired: 0
        };
        
        // 添加塔并扣除金币
        gameState.towers.push(tower);
        gameState.gold -= towerType.cost;
        gameState.grid[y][x] = 4; // 标记为塔位置
        
        // 更新UI
        updateUI();
        
        // 播放塔放置音效
        audioManager.playSound('tower_place');
        
        // 显示音效动画
        showSoundEffect(tower.x, tower.y, '🏗️');
        
        // 如果金币不足以继续放置同类型的塔，取消放置模式
        if (gameState.gold < towerType.cost) {
            cancelTowerPlacement();
        }
        
        // 显示放置效果
        showPlacementEffect(tower.x, tower.y);
    }
}

// 取消塔放置模式
function cancelTowerPlacement() {
    gameState.isPlacingTower = false;
    gameState.placingTowerType = null;
    canvas.style.cursor = 'default';
}

// 显示塔放置效果
function showPlacementEffect(x, y) {
    // 创建放置效果粒子
    const particles = [];
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 1.5;
        const size = 2 + Math.random() * 2;
        const life = 20 + Math.random() * 10;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: '#4CAF50',
            life: life,
            maxLife: life
        });
    }
    
    // 动画函数
    function animateParticles() {
        // 更新粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 移动粒子
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 减少生命值
            particle.life--;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // 绘制粒子
        if (particles.length > 0) {
            // 保存当前绘图状态
            ctx.save();
            
            // 绘制每个粒子
            for (const particle of particles) {
                const alpha = particle.life / particle.maxLife;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 恢复绘图状态
            ctx.restore();
            
            // 继续动画
            requestAnimationFrame(animateParticles);
        }
    }
    
    // 开始动画
    animateParticles();
}

// 开始拖拽塔
function startDragging(event) {
    // 如果已经选择了塔类型或正在拖拽，不处理
    if (gameState.selectedTower || gameState.isDragging) return;
    
    // 获取点击位置
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    
    // 检查是否点击了塔
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT && gameState.grid[y][x] === 4) {
        // 查找被点击的塔
        const clickedTower = gameState.towers.find(tower => 
            Math.floor(tower.x / TILE_SIZE) === x && 
            Math.floor(tower.y / TILE_SIZE) === y
        );
        
        if (clickedTower) {
            // 开始拖拽
            gameState.isDragging = true;
            gameState.draggedTower = clickedTower;
            
            // 记录原始位置
            clickedTower.originalX = clickedTower.x;
            clickedTower.originalY = clickedTower.y;
            clickedTower.originalGridX = x;
            clickedTower.originalGridY = y;
            
            // 将塔移到鼠标位置
            clickedTower.x = event.clientX - rect.left;
            clickedTower.y = event.clientY - rect.top;
            
            // 清除原始位置的网格标记
            gameState.grid[y][x] = 0;
        }
    }
}

// 拖拽塔
function dragTower(event) {
    if (!gameState.isDragging || !gameState.draggedTower) return;
    
    // 更新塔的位置为鼠标位置
    const rect = canvas.getBoundingClientRect();
    gameState.draggedTower.x = event.clientX - rect.left;
    gameState.draggedTower.y = event.clientY - rect.top;
}

// 结束拖拽
function endDragging(event) {
    if (!gameState.isDragging || !gameState.draggedTower) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((event.clientY - rect.top) / TILE_SIZE);
    
    // 检查目标位置
    if (x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT) {
        if (gameState.grid[y][x] === 0) {
            // 放置到空位置
            gameState.draggedTower.x = x * TILE_SIZE + TILE_SIZE / 2;
            gameState.draggedTower.y = y * TILE_SIZE + TILE_SIZE / 2;
            gameState.grid[y][x] = 4;
        } else if (gameState.grid[y][x] === 4) {
            // 尝试合并塔
            const targetTower = gameState.towers.find(tower => 
                Math.floor(tower.x / TILE_SIZE) === x && 
                Math.floor(tower.y / TILE_SIZE) === y &&
                tower !== gameState.draggedTower
            );
            
            if (targetTower && canMergeTowers(gameState.draggedTower, targetTower)) {
                // 合并塔
                mergeTowers(gameState.draggedTower, targetTower);
            } else {
                // 无法合并，返回原位置
                returnTowerToOriginalPosition();
            }
        } else {
            // 无效位置，返回原位置
            returnTowerToOriginalPosition();
        }
    } else {
        // 超出边界，返回原位置
        returnTowerToOriginalPosition();
    }
    
    // 重置拖拽状态
    gameState.isDragging = false;
    gameState.draggedTower = null;
}

// 取消拖拽（鼠标离开画布）
function cancelDragging() {
    if (gameState.isDragging && gameState.draggedTower) {
        // 返回原位置
        returnTowerToOriginalPosition();
        
        // 重置拖拽状态
        gameState.isDragging = false;
        gameState.draggedTower = null;
    }
}

// 将塔返回原位置
function returnTowerToOriginalPosition() {
    if (!gameState.draggedTower) return;
    
    // 恢复原始位置
    gameState.draggedTower.x = gameState.draggedTower.originalX;
    gameState.draggedTower.y = gameState.draggedTower.originalY;
    
    // 恢复网格标记
    gameState.grid[gameState.draggedTower.originalGridY][gameState.draggedTower.originalGridX] = 4;
    
    // 清除临时属性
    delete gameState.draggedTower.originalX;
    delete gameState.draggedTower.originalY;
    delete gameState.draggedTower.originalGridX;
    delete gameState.draggedTower.originalGridY;
}

// 检查两个塔是否可以合并
function canMergeTowers(tower1, tower2) {
    // 只有相同类型和相同等级的塔可以合并
    return tower1.type === tower2.type && 
           TOWER_TYPES[tower1.type].level < 3; // 最高等级为3
}

// 合并两个塔
function mergeTowers(tower1, tower2) {
    // 获取当前塔类型
    const currentType = tower1.type;
    
    // 获取升级后的塔类型
    const upgradedType = TOWER_UPGRADES[currentType];
    
    if (!upgradedType) return; // 无法升级
    
    // 更新目标塔的属性
    tower2.type = upgradedType;
    tower2.damage = TOWER_TYPES[upgradedType].damage;
    tower2.range = TOWER_TYPES[upgradedType].range;
    tower2.fireRate = TOWER_TYPES[upgradedType].fireRate;
    
    // 从数组中移除拖拽的塔
    const index = gameState.towers.indexOf(tower1);
    if (index !== -1) {
        gameState.towers.splice(index, 1);
    }
    
    // 播放升级音效
    audioManager.playSound('tower_upgrade');
    
    // 显示音效动画
    showSoundEffect(tower2.x, tower2.y, '⬆️');
    
    // 显示升级效果
    showUpgradeEffect(tower2.x, tower2.y);
}

// 选择塔类型
function selectTower(type) {
    if (gameState.gold >= TOWER_TYPES[type].cost) {
        // 播放按钮点击音效
        audioManager.playSound('button_click');
        
        // 取消之前的选择
        if (gameState.isPlacingTower) {
            gameState.isPlacingTower = false;
            gameState.placingTowerType = null;
        }
        
        // 设置新的拖拽放置状态
        gameState.isPlacingTower = true;
        gameState.placingTowerType = type;
        
        // 初始化拖拽位置（鼠标位置）
        const rect = canvas.getBoundingClientRect();
        gameState.placingTowerX = rect.width / 2;
        gameState.placingTowerY = rect.height / 2;
        
        // 添加鼠标移动事件监听器
        canvas.style.cursor = 'pointer';
    } else {
        alert('金币不足！');
    }
}

// 开始新的一波敌人
function startWave() {
    if (gameState.waveInProgress) return;
    
    gameState.wave++;
    gameState.waveInProgress = true;
    
    // 每波结束后增加关卡计数
    gameState.level = Math.ceil(gameState.wave / 3); // 每3波为1关
    
    // 重置BOSS状态
    gameState.bossSpawned = false;
    gameState.megaBossSpawned = false;
    gameState.bossHealthBar.visible = false;
    
    // 播放波次开始音效
    audioManager.playSound('wave_start');
    
    // 根据波数生成敌人
    const enemyCount = 5 + gameState.wave * 2;
    
    // 设置生成敌人的间隔
    let enemiesSpawned = 0;
    const spawnInterval = setInterval(() => {
        // 检查是否需要生成BOSS
        let enemyType = 'NORMAL';
        const rand = Math.random();
        
        // 每关最后一波生成BOSS
        if (gameState.wave % 3 === 0 && !gameState.bossSpawned && enemiesSpawned >= enemyCount - 1) {
            enemyType = 'BOSS';
            gameState.bossSpawned = true;
        } 
        // 每5关生成大BOSS
        else if (gameState.level % 5 === 0 && gameState.wave % 3 === 0 && !gameState.megaBossSpawned && enemiesSpawned >= enemyCount - 1) {
            enemyType = 'MEGA_BOSS';
            gameState.megaBossSpawned = true;
        }
        // 普通敌人类型
        else if (gameState.wave > 3) {
            if (rand < 0.2) {
                enemyType = 'TANK';
            } else if (rand < 0.5) {
                enemyType = 'FAST';
            }
        } else if (gameState.wave > 1) {
            if (rand < 0.3) {
                enemyType = 'FAST';
            }
        }
        
        // 创建敌人
        const enemyTemplate = ENEMY_TYPES[enemyType];
        const enemy = {
            x: gameState.path[0].x * TILE_SIZE + TILE_SIZE / 2,
            y: gameState.path[0].y * TILE_SIZE + TILE_SIZE / 2,
            type: enemyType,
            health: enemyTemplate.health * (1 + gameState.wave * 0.1),
            maxHealth: enemyTemplate.health * (1 + gameState.wave * 0.1),
            speed: enemyTemplate.speed,
            reward: enemyTemplate.reward,
            pathIndex: 0,
            size: enemyTemplate.size || 1,
            isBoss: enemyTemplate.isBoss || false,
            isMegaBoss: enemyTemplate.isMegaBoss || false
        };
        
        // 如果是BOSS，设置血条
        if (enemy.isBoss) {
            gameState.bossHealthBar.visible = true;
            gameState.bossHealthBar.health = enemy.health;
            gameState.bossHealthBar.maxHealth = enemy.maxHealth;
            gameState.bossHealthBar.name = enemy.isMegaBoss ? "超级BOSS" : "BOSS";
            
            // 更新UI显示BOSS血条
            updateUI();
        }
        
        gameState.enemies.push(enemy);
        enemiesSpawned++;
        
        if (enemiesSpawned >= enemyCount) {
            clearInterval(spawnInterval);
        }
    }, 1000);
    
    // 更新UI
    updateUI();
}

// 更新游戏状态
function updateGame(deltaTime) {
    // 如果游戏暂停，不更新游戏状态
    if (gameState.isPaused) return;
    
    // 更新下一波倒计时
    if (!gameState.waveInProgress && gameState.autoStartWave && gameState.waveDelayTimer > 0) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - gameState.waveDelayTimer;
        
        gameState.waveCountdown = Math.max(0, gameState.waveDelay - elapsedTime);
        
        // 更新UI显示倒计时
        updateUI();
        
        // 如果倒计时结束，开始下一波
        if (gameState.waveCountdown <= 0) {
            gameState.waveDelayTimer = 0;
            startWave();
        }
    }
    
    // 更新敌人位置
    updateEnemies(deltaTime);
    
    // 更新塔攻击
    updateTowers(deltaTime);
    
    // 更新投射物
    updateProjectiles(deltaTime);
    
    // 检查波次是否结束
    checkWaveEnd();
}

// 更新敌人位置
function updateEnemies(deltaTime) {
    let bossExists = false;
    
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
        const enemy = gameState.enemies[i];
        
        // 如果是BOSS，更新血条
        if (enemy.isBoss) {
            bossExists = true;
            gameState.bossHealthBar.health = enemy.health;
            updateUI();
        }
        
        // 如果敌人到达终点
        if (enemy.pathIndex >= gameState.path.length - 1) {
            // 如果是BOSS，扣除更多生命值
            if (enemy.isBoss) {
                gameState.lives -= enemy.isMegaBoss ? 5 : 3;
            } else {
                gameState.lives--;
            }
            
            gameState.enemies.splice(i, 1);
            updateUI();
            
            // 游戏结束检查
            if (gameState.lives <= 0) {
                // 播放游戏结束音效
                audioManager.playSound('game_over');
                
                alert('游戏结束！你坚持了 ' + gameState.wave + ' 波敌人，到达了第 ' + gameState.level + ' 关！');
                resetGame();
                return;
            }
            continue;
        }
        
        // 移动敌人
        const targetPoint = gameState.path[enemy.pathIndex + 1];
        const targetX = targetPoint.x * TILE_SIZE + TILE_SIZE / 2;
        const targetY = targetPoint.y * TILE_SIZE + TILE_SIZE / 2;
        
        // 计算方向
        const dx = targetX - enemy.x;
        const dy = targetY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果到达当前路径点，前进到下一个
        if (distance < 2) {
            enemy.pathIndex++;
            
            // BOSS特殊效果：到达路径点时恢复一些生命值
            if (enemy.isBoss && enemy.health < enemy.maxHealth) {
                const healAmount = enemy.isMegaBoss ? enemy.maxHealth * 0.05 : enemy.maxHealth * 0.02;
                enemy.health = Math.min(enemy.health + healAmount, enemy.maxHealth);
            }
        } else {
            // 移动敌人
            enemy.x += (dx / distance) * enemy.speed * deltaTime * 0.05;
            enemy.y += (dy / distance) * enemy.speed * deltaTime * 0.05;
        }
        
        // 检查敌人是否死亡
        if (enemy.health <= 0) {
            // 增加金币奖励
            gameState.gold += enemy.reward;
            
            // 播放敌人死亡音效
            if (enemy.isBoss) {
                audioManager.playSound('boss_death');
                // 显示音效动画
                showSoundEffect(enemy.x, enemy.y, '💥');
            } else {
                audioManager.playSound('enemy_death');
                // 显示音效动画
                showSoundEffect(enemy.x, enemy.y, '💀');
            }
            
            // BOSS死亡特效
            if (enemy.isBoss) {
                // 显示爆炸效果
                showBossDeathEffect(enemy.x, enemy.y, enemy.isMegaBoss);
                
                // 大BOSS额外奖励
                if (enemy.isMegaBoss) {
                    gameState.gold += 100;
                    gameState.lives += 2; // 奖励生命值
                }
            }
            
            // 移除敌人
            gameState.enemies.splice(i, 1);
            updateUI();
        }
    }
    
    // 如果没有BOSS存在，隐藏血条
    if (!bossExists) {
        gameState.bossHealthBar.visible = false;
        updateUI();
    }
}

// 更新塔攻击
function updateTowers(deltaTime) {
    for (const tower of gameState.towers) {
        tower.lastFired += deltaTime;
        
        // 检查是否可以攻击
        if (tower.lastFired >= 1000 / tower.fireRate) {
            // 寻找范围内的敌人
            let target = null;
            let closestDistance = Infinity;
            
            for (const enemy of gameState.enemies) {
                const dx = tower.x - enemy.x;
                const dy = tower.y - enemy.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= tower.range && distance < closestDistance) {
                    target = enemy;
                    closestDistance = distance;
                }
            }
            
            // 如果找到目标，发射投射物
            if (target) {
                const projectile = {
                    x: tower.x,
                    y: tower.y,
                    targetEnemy: target,
                    damage: tower.damage,
                    speed: 5,
                    color: TOWER_TYPES[tower.type].color
                };
                
                gameState.projectiles.push(projectile);
                tower.lastFired = 0;
            }
        }
    }
}

// 更新投射物
function updateProjectiles(deltaTime) {
    for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
        const projectile = gameState.projectiles[i];
        
        // 检查目标是否还存在
        if (!gameState.enemies.includes(projectile.targetEnemy)) {
            gameState.projectiles.splice(i, 1);
            continue;
        }
        
        // 移动投射物
        const dx = projectile.targetEnemy.x - projectile.x;
        const dy = projectile.targetEnemy.y - projectile.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 如果击中目标
        if (distance < 5) {
            projectile.targetEnemy.health -= projectile.damage;
            
            // 播放命中音效
            audioManager.playSound('enemy_hit');
            
            // 显示伤害数字
            showDamageNumber(projectile.targetEnemy.x, projectile.targetEnemy.y, projectile.damage);
            
            gameState.projectiles.splice(i, 1);
        } else {
            // 移动投射物
            projectile.x += (dx / distance) * projectile.speed * deltaTime * 0.05;
            projectile.y += (dy / distance) * projectile.speed * deltaTime * 0.05;
        }
    }
}

// 检查波次是否结束
function checkWaveEnd() {
    if (gameState.waveInProgress && gameState.enemies.length === 0) {
        gameState.waveInProgress = false;
        
        // 波次奖励
        const waveBonus = 20 + gameState.wave * 5;
        gameState.gold += waveBonus;
        
        // 显示奖励提示
        showBonusMessage(waveBonus);
        
        // 设置下一波的延迟
        if (gameState.autoStartWave) {
            gameState.waveDelayTimer = Date.now();
            gameState.waveCountdown = gameState.waveDelay;
        }
        
        // 更新UI
        updateUI();
    }
}

// 显示奖励提示
function showBonusMessage(bonus) {
    // 播放金币获得音效
    audioManager.playSound('gold_earn');
    
    // 创建提示元素
    const gameArea = document.querySelector('.game-area');
    const bonusMsg = document.createElement('div');
    bonusMsg.className = 'bonus-message';
    bonusMsg.textContent = `+${bonus} 金币`;
    
    // 设置样式
    bonusMsg.style.position = 'absolute';
    bonusMsg.style.top = '50%';
    bonusMsg.style.left = '50%';
    bonusMsg.style.transform = 'translate(-50%, -50%)';
    bonusMsg.style.color = 'gold';
    bonusMsg.style.fontSize = '32px';
    bonusMsg.style.fontWeight = 'bold';
    bonusMsg.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
    bonusMsg.style.zIndex = '100';
    bonusMsg.style.opacity = '1';
    bonusMsg.style.transition = 'opacity 2s, transform 2s';
    
    // 添加到游戏区域
    gameArea.appendChild(bonusMsg);
    
    // 动画效果
    setTimeout(() => {
        bonusMsg.style.opacity = '0';
        bonusMsg.style.transform = 'translate(-50%, -100%)';
    }, 100);
    
    // 移除元素
    setTimeout(() => {
        gameArea.removeChild(bonusMsg);
    }, 2100);
}

// 绘制游戏
function drawGame() {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    drawGrid();
    
    // 绘制路径
    drawPath();
    
    // 绘制塔
    drawTowers();
    
    // 绘制敌人
    drawEnemies();
    
    // 绘制投射物
    drawProjectiles();
    
    // 绘制选择指示器
    drawSelectionIndicator();
    
    // 绘制塔放置预览
    if (gameState.isPlacingTower) {
        drawTowerPlacementPreview();
    }
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += TILE_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制路径
function drawPath() {
    // 绘制路径瓦片
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            if (gameState.grid[y][x] === 1) {
                ctx.fillStyle = '#a67c52';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (gameState.grid[y][x] === 2) {
                ctx.fillStyle = '#4CAF50';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            } else if (gameState.grid[y][x] === 3) {
                ctx.fillStyle = '#F44336';
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }
}

// 绘制塔
function drawTowers() {
    for (const tower of gameState.towers) {
        // 如果是被拖拽的塔，使用半透明效果
        if (gameState.isDragging && tower === gameState.draggedTower) {
            ctx.globalAlpha = 0.6;
        } else {
            ctx.globalAlpha = 1.0;
        }
        
        // 绘制塔的主体
        ctx.fillStyle = TOWER_TYPES[tower.type].color;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, TILE_SIZE / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制塔的等级（小圆点）
        const level = TOWER_TYPES[tower.type].level;
        ctx.fillStyle = 'white';
        
        // 根据等级绘制不同数量的点
        for (let i = 0; i < level; i++) {
            const angle = (Math.PI * 2 / level) * i;
            const dotX = tower.x + Math.cos(angle) * (TILE_SIZE / 4);
            const dotY = tower.y + Math.sin(angle) * (TILE_SIZE / 4);
            
            ctx.beginPath();
            ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 绘制攻击范围（仅当选中或拖拽时）
        if (gameState.selectedTower || (gameState.isDragging && tower === gameState.draggedTower)) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 重置透明度
        ctx.globalAlpha = 1.0;
    }
}

// 绘制敌人
function drawEnemies() {
    for (const enemy of gameState.enemies) {
        // 计算敌人大小
        const enemySize = (TILE_SIZE / 3) * (enemy.size || 1);
        
        // 绘制敌人
        ctx.fillStyle = ENEMY_TYPES[enemy.type].color;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemySize, 0, Math.PI * 2);
        ctx.fill();
        
        // 如果是BOSS，添加特殊效果
        if (enemy.isBoss) {
            // 绘制光环
            ctx.strokeStyle = enemy.isMegaBoss ? 'gold' : 'rgba(255, 0, 255, 0.5)';
            ctx.lineWidth = enemy.isMegaBoss ? 3 : 2;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemySize + 5, 0, Math.PI * 2);
            ctx.stroke();
            
            // 绘制BOSS标记
            ctx.fillStyle = 'white';
            ctx.font = enemy.isMegaBoss ? 'bold 16px Arial' : '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(enemy.isMegaBoss ? 'MEGA' : 'BOSS', enemy.x, enemy.y - enemySize - 15);
        }
        
        // 绘制生命条
        const healthBarWidth = TILE_SIZE * (enemy.size || 1);
        const healthBarHeight = enemy.isBoss ? 8 : 5;
        const healthPercentage = enemy.health / enemy.maxHealth;
        const barY = enemy.y - enemySize - (enemy.isBoss ? 20 : 10);
        
        ctx.fillStyle = '#333';
        ctx.fillRect(enemy.x - healthBarWidth / 2, barY, healthBarWidth, healthBarHeight);
        
        // 根据敌人类型和血量设置血条颜色
        let healthColor;
        if (enemy.isMegaBoss) {
            healthColor = healthPercentage > 0.5 ? 'gold' : healthPercentage > 0.2 ? 'orange' : 'red';
        } else if (enemy.isBoss) {
            healthColor = healthPercentage > 0.5 ? 'magenta' : healthPercentage > 0.2 ? 'orange' : 'red';
        } else {
            healthColor = healthPercentage > 0.5 ? 'green' : healthPercentage > 0.2 ? 'orange' : 'red';
        }
        
        ctx.fillStyle = healthColor;
        ctx.fillRect(enemy.x - healthBarWidth / 2, barY, healthBarWidth * healthPercentage, healthBarHeight);
    }
}

// 绘制投射物
function drawProjectiles() {
    for (const projectile of gameState.projectiles) {
        ctx.fillStyle = projectile.color;
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 绘制选择指示器
function drawSelectionIndicator() {
    if (gameState.selectedTower) {
        // 获取鼠标位置
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // 计算网格位置
            const gridX = Math.floor(mouseX / TILE_SIZE);
            const gridY = Math.floor(mouseY / TILE_SIZE);
            
            // 检查是否可以放置
            let canPlace = false;
            if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
                canPlace = gameState.grid[gridY][gridX] === 0;
            }
            
            // 绘制选择指示器
            ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(gridX * TILE_SIZE, gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            
            // 绘制塔的攻击范围
            const towerType = TOWER_TYPES[gameState.selectedTower];
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(gridX * TILE_SIZE + TILE_SIZE / 2, gridY * TILE_SIZE + TILE_SIZE / 2, towerType.range, 0, Math.PI * 2);
            ctx.stroke();
        });
    }
}

// 绘制塔放置预览
function drawTowerPlacementPreview() {
    if (!gameState.isPlacingTower || !gameState.placingTowerType) return;
    
    const x = gameState.placingTowerX;
    const y = gameState.placingTowerY;
    
    // 计算网格位置
    const gridX = Math.floor(x / TILE_SIZE);
    const gridY = Math.floor(y / TILE_SIZE);
    
    // 检查是否可以放置
    let canPlace = false;
    if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT) {
        canPlace = gameState.grid[gridY][gridX] === 0;
    }
    
    // 绘制塔的预览
    const towerType = TOWER_TYPES[gameState.placingTowerType];
    
    // 设置透明度
    ctx.globalAlpha = 0.6;
    
    // 绘制塔的主体
    ctx.fillStyle = towerType.color;
    ctx.beginPath();
    ctx.arc(x, y, TILE_SIZE / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制塔的等级（小圆点）
    const level = towerType.level;
    ctx.fillStyle = 'white';
    
    // 根据等级绘制不同数量的点
    for (let i = 0; i < level; i++) {
        const angle = (Math.PI * 2 / level) * i;
        const dotX = x + Math.cos(angle) * (TILE_SIZE / 4);
        const dotY = y + Math.sin(angle) * (TILE_SIZE / 4);
        
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 绘制攻击范围
    ctx.strokeStyle = canPlace ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, towerType.range, 0, Math.PI * 2);
    ctx.stroke();
    
    // 绘制网格指示器
    ctx.fillStyle = canPlace ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(gridX * TILE_SIZE, gridY * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    
    // 重置透明度
    ctx.globalAlpha = 1.0;
    
    // 显示成本信息
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${towerType.cost} 金币`, x, y - TILE_SIZE / 2 - 5);
}

// 更新UI
function updateUI() {
    goldDisplay.textContent = gameState.gold;
    livesDisplay.textContent = gameState.lives;
    waveDisplay.textContent = gameState.wave;
    levelDisplay.textContent = gameState.level;
    
    // 更新倒计时显示
    if (gameState.waveInProgress) {
        countdownDisplay.textContent = "进行中";
    } else if (gameState.waveCountdown > 0) {
        countdownDisplay.textContent = Math.ceil(gameState.waveCountdown / 1000) + "秒";
    } else {
        countdownDisplay.textContent = "-";
    }
    
    // 更新按钮状态
    towerButtons.basic.disabled = gameState.gold < TOWER_TYPES.BASIC.cost;
    towerButtons.arrow.disabled = gameState.gold < TOWER_TYPES.ARROW.cost;
    towerButtons.magic.disabled = gameState.gold < TOWER_TYPES.MAGIC.cost;
    
    // 更新BOSS血条
    if (gameState.bossHealthBar.visible) {
        document.body.classList.add('boss-active');
        bossHealthContainer.style.display = 'block';
        bossNameDisplay.textContent = gameState.bossHealthBar.name;
        const healthPercentage = (gameState.bossHealthBar.health / gameState.bossHealthBar.maxHealth) * 100;
        bossHealthBar.style.width = healthPercentage + '%';
        
        // 根据血量百分比改变颜色
        if (healthPercentage > 50) {
            bossHealthBar.style.backgroundColor = '#ff3333'; // 红色
        } else if (healthPercentage > 25) {
            bossHealthBar.style.backgroundColor = '#ff9933'; // 橙色
        } else {
            bossHealthBar.style.backgroundColor = '#ffff33'; // 黄色
        }
    } else {
        document.body.classList.remove('boss-active');
        bossHealthContainer.style.display = 'none';
    }
}

// 重置游戏
function resetGame() {
    gameState = {
        gold: 100,
        lives: 10,
        wave: 0,
        level: 0, // 当前关卡
        enemies: [],
        towers: [],
        projectiles: [],
        path: [],
        selectedTower: null,
        waveInProgress: false,
        lastFrameTime: 0,
        grid: Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0)),
        // 拖拽相关状态
        draggedTower: null,
        isDragging: false,
        // 塔布放拖拽状态
        isPlacingTower: false,
        placingTowerType: null,
        placingTowerX: 0,
        placingTowerY: 0,
        // BOSS相关状态
        bossSpawned: false,
        megaBossSpawned: false,
        bossHealthBar: {
            visible: false,
            health: 0,
            maxHealth: 0,
            name: ""
        },
        // 游戏控制状态
        isPaused: false,
        autoStartWave: true,
        waveDelay: 5000, // 下一波开始前的延迟（毫秒）
        waveDelayTimer: 0, // 当前延迟计时器
        waveCountdown: 0 // 倒计时显示
    };
    
    // 重置鼠标指针
    canvas.style.cursor = 'default';
    
    initializeGame();
}

// 游戏循环
function gameLoop(timestamp) {
    // 计算帧间隔时间
    if (!gameState.lastFrameTime) {
        gameState.lastFrameTime = timestamp;
    }
    const deltaTime = timestamp - gameState.lastFrameTime;
    gameState.lastFrameTime = timestamp;
    
    // 更新游戏状态
    updateGame(deltaTime);
    
    // 绘制游戏
    drawGame();
    
    // 继续循环
    requestAnimationFrame(gameLoop);
}

// 初始化游戏
initializeGame();

// 开始游戏循环
requestAnimationFrame(gameLoop);

// 显示升级效果
function showUpgradeEffect(x, y) {
    // 创建升级效果粒子
    const particles = [];
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        const size = 2 + Math.random() * 3;
        const life = 30 + Math.random() * 20;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: 'gold',
            life: life,
            maxLife: life
        });
    }
    
    // 动画函数
    function animateParticles() {
        // 更新粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 移动粒子
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 减少生命值
            particle.life--;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // 绘制粒子
        if (particles.length > 0) {
            // 保存当前绘图状态
            ctx.save();
            
            // 绘制每个粒子
            for (const particle of particles) {
                const alpha = particle.life / particle.maxLife;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 恢复绘图状态
            ctx.restore();
            
            // 继续动画
            requestAnimationFrame(animateParticles);
        }
    }
    
    // 开始动画
    animateParticles();
}

// 显示BOSS死亡效果
function showBossDeathEffect(x, y, isMegaBoss) {
    // 创建爆炸效果粒子
    const particles = [];
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        const size = 2 + Math.random() * 6;
        const life = 50 + Math.random() * 30;
        
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: size,
            color: isMegaBoss ? 'black' : 'purple',
            life: life,
            maxLife: life
        });
    }
    
    // 动画函数
    function animateParticles() {
        // 更新粒子
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            
            // 移动粒子
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 减少生命值
            particle.life--;
            
            // 移除死亡粒子
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // 绘制粒子
        if (particles.length > 0) {
            // 保存当前绘图状态
            ctx.save();
            
            // 绘制每个粒子
            for (const particle of particles) {
                const alpha = particle.life / particle.maxLife;
                ctx.globalAlpha = alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 恢复绘图状态
            ctx.restore();
            
            // 继续动画
            requestAnimationFrame(animateParticles);
        }
    }
    
    // 开始动画
    animateParticles();
}

// 显示音效动画
function showSoundEffect(x, y, icon) {
    const gameArea = document.querySelector('.game-area');
    const effect = document.createElement('div');
    effect.className = 'sound-effect';
    effect.textContent = icon;
    
    // 设置位置
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    
    // 添加到游戏区域
    gameArea.appendChild(effect);
    
    // 动画结束后移除
    setTimeout(() => {
        gameArea.removeChild(effect);
    }, 500);
}

// 显示伤害数字
function showDamageNumber(x, y, damage) {
    const gameArea = document.querySelector('.game-area');
    const damageText = document.createElement('div');
    damageText.className = 'damage-number';
    damageText.textContent = `-${Math.round(damage)}`;
    
    // 设置样式
    damageText.style.position = 'absolute';
    damageText.style.left = `${x}px`;
    damageText.style.top = `${y - 20}px`;
    damageText.style.color = 'white';
    damageText.style.textShadow = '1px 1px 2px black';
    damageText.style.fontSize = '14px';
    damageText.style.fontWeight = 'bold';
    damageText.style.zIndex = '100';
    damageText.style.pointerEvents = 'none';
    damageText.style.transition = 'transform 0.5s, opacity 0.5s';
    damageText.style.opacity = '1';
    
    // 添加到游戏区域
    gameArea.appendChild(damageText);
    
    // 动画效果
    setTimeout(() => {
        damageText.style.transform = 'translateY(-30px)';
        damageText.style.opacity = '0';
    }, 50);
    
    // 移除元素
    setTimeout(() => {
        gameArea.removeChild(damageText);
    }, 550);
} 