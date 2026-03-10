/**
 * 🦞 Claw Home - 小龙虾之家主逻辑 v1.2
 * 中央布局 + 天气系统 + 冒险岛BGM
 */

// 状态配置
const LOBSTER_STATES = {
    RESTING: { code: 'resting', icon: '💤', text: '休息中', color: '#9B59B6' },
    WORKING: { code: 'working', icon: '🔨', text: '干活中', color: '#FF6B6B' },
    SYNCING: { code: 'syncing', icon: '☁️', text: '同步中', color: '#3498DB' },
    FIXING: { code: 'fixing', icon: '🔧', text: '修Bug中', color: '#E74C3C' },
    THINKING: { code: 'thinking', icon: '💭', text: '思考中', color: '#F39C12' },
    LEARNING: { code: 'learning', icon: '📖', text: '学习中', color: '#2ECC71' },
    IDLE: { code: 'idle', icon: '😊', text: '待机中', color: '#95A5A6' }
};

// 气泡内容
const SPEECH_BUBBLES = {
    resting: ['呼...让我睡一会儿 💤', '充电中... 🔋', '做个好梦... 🌙'],
    working: ['正在努力工作中！💪', '这个任务交给我吧！✨', '代码写起来~ 🖥️'],
    syncing: ['同步数据中... ☁️', '备份很重要哦！💾'],
    fixing: ['啊！有个Bug！🐛', '正在紧急修复中... 🔧', '修Bug修到头秃... 💇'],
    thinking: ['让我深度思考一下... 🧠', '灵感快来吧！💡'],
    learning: ['学习新技能中！📚', '知识就是力量！💪'],
    idle: ['有什么可以帮忙的吗？🙋', '我在等待任务中~ ⏳']
};

// 天气图标映射
const WEATHER_ICONS = {
    '晴': '☀️',
    '多云': '⛅',
    '阴': '☁️',
    '小雨': '🌦️',
    '中雨': '🌧️',
    '大雨': '⛈️',
    '暴雨': '⛈️',
    '雪': '❄️',
    '雾': '🌫️',
    '霾': '😷'
};

// 全局状态
let currentState = 'idle';
let subAgents = [];
let tasks = [];
let isMusicPlaying = false;
let currentWeather = null;

/**
 * 初始化
 */
async function init() {
    console.log('🦞 Claw Home v1.2 初始化完成！');
    
    // 加载龙虾SVG
    await loadLobsterSVG();
    
    // 初始化昼夜模式
    initDayNightMode();
    
    // 初始化天气
    initWeather();
    
    // 设置初始状态（会触发任务添加）
    updateMainLobsterState('idle');
    
    // 初始渲染任务列表
    renderTasks();
    
    // 绑定事件
    bindEvents();
    
    // 更新运行时间
    updateUptime();
    setInterval(updateUptime, 60000);
}

/**
 * 加载龙虾SVG
 */
async function loadLobsterSVG() {
    try {
        const response = await fetch('assets/lobster.svg');
        const svgText = await response.text();
        document.getElementById('lobsterSprite').innerHTML = svgText;
        console.log('✅ Q版龙虾加载完成');
    } catch (error) {
        console.error('加载龙虾SVG失败:', error);
    }
}

/**
 * 初始化昼夜模式
 */
function initDayNightMode() {
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour >= 18;
    
    if (isNight) {
        document.body.classList.add('night-mode');
        updateDayNightButton(true);
    }
}

/**
 * 切换昼夜模式
 */
function toggleDayNight() {
    const isNight = document.body.classList.toggle('night-mode');
    updateDayNightButton(isNight);
    showBubble(isNight ? '🌙 切换到夜间模式~' : '☀️ 切换到日间模式~');
}

function updateDayNightButton(isNight) {
    const icon = document.getElementById('toggleIcon');
    icon.textContent = isNight ? '🌙' : '☀️';
}

/**
 * BGM控制
 */
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const btn = document.getElementById('musicToggle');
    const icon = document.getElementById('musicIcon');
    
    if (isMusicPlaying) {
        bgm.pause();
        isMusicPlaying = false;
        btn.classList.remove('playing');
        icon.textContent = '🎵';
        showBubble('音乐已暂停 🎵');
    } else {
        bgm.volume = 0.3;
        bgm.play().catch(e => {
            console.log('音乐播放失败:', e);
            showBubble('音乐播放失败，请检查网络');
        });
        isMusicPlaying = true;
        btn.classList.add('playing');
        icon.textContent = '🎶';
        showBubble('冒险岛BGM开始播放 🎶');
    }
}

/**
 * 天气系统
 */
function initWeather() {
    // 立即获取一次天气
    fetchWeather();
    
    // 设置定时更新：0点、8点、12点、19点
    scheduleWeatherUpdates();
    
    // 每分钟检查是否需要更新
    setInterval(checkWeatherUpdate, 60000);
}

/**
 * 获取深圳天气
 */
async function fetchWeather() {
    console.log('🌤️ 正在获取深圳天气...');
    
    try {
        // 使用 Open-Meteo API（免费，无需key，CORS友好）
        const response = await fetch(
            'https://api.open-meteo.com/v1/forecast?latitude=22.54&longitude=114.06&current_weather=true&timezone=Asia%2FHong_Kong'
        );
        
        if (!response.ok) throw new Error('API请求失败');
        
        const data = await response.json();
        console.log('天气数据:', data);
        
        const weatherCode = data.current_weather.weathercode;
        const temp = Math.round(data.current_weather.temperature);
        const condition = weatherCodeToCondition(weatherCode);
        
        updateWeatherDisplay(condition, `${temp}°C`);
    } catch (error) {
        console.error('天气获取失败:', error);
        // 如果API失败，使用模拟数据（开发测试用）
        updateWeatherDisplay('晴', '25°C');
    }
}

/**
 * 天气代码转描述
 */
function weatherCodeToCondition(code) {
    const codes = {
        0: '晴', 1: '晴', 2: '多云', 3: '阴',
        45: '雾', 48: '雾',
        51: '小雨', 53: '小雨', 55: '中雨',
        61: '小雨', 63: '中雨', 65: '大雨',
        71: '雪', 73: '雪', 75: '雪',
        95: '暴雨', 96: '暴雨', 99: '暴雨'
    };
    return codes[code] || '多云';
}

/**
 * 更新天气显示
 */
function updateWeatherDisplay(condition, temp) {
    currentWeather = condition;
    
    const iconEl = document.getElementById('weatherIcon');
    const tempEl = document.getElementById('weatherTemp');
    const descEl = document.getElementById('weatherDesc');
    const timeEl = document.getElementById('weatherTime');
    
    // 获取图标
    let icon = WEATHER_ICONS[condition] || '🌡️';
    iconEl.textContent = icon;
    
    // 更新温度和描述
    tempEl.textContent = temp;
    descEl.textContent = condition;
    
    // 更新时间
    const now = new Date();
    timeEl.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} 更新`;
    
    // 应用天气效果
    applyWeatherEffects(condition);
    
    console.log(`🌤️ 天气更新: ${condition} ${temp}`);
}

/**
 * 应用天气效果
 */
function applyWeatherEffects(condition) {
    // 清除所有效果
    document.getElementById('rainContainer').classList.remove('active');
    document.getElementById('snowContainer').classList.remove('active');
    document.getElementById('cloudsContainer').classList.remove('active');
    document.getElementById('scene').classList.remove('thunder');
    
    // 根据天气应用效果
    if (condition.includes('雨')) {
        document.getElementById('rainContainer').classList.add('active');
        createRaindrops();
        
        // 雷暴效果
        if (condition.includes('暴') || condition.includes('大')) {
            document.getElementById('scene').classList.add('thunder');
        }
    } else if (condition.includes('雪')) {
        document.getElementById('snowContainer').classList.add('active');
        createSnowflakes();
    } else if (condition.includes('云') || condition.includes('阴')) {
        document.getElementById('cloudsContainer').classList.add('active');
        createClouds();
    }
}

/**
 * 创建雨滴
 */
function createRaindrops() {
    const container = document.getElementById('rainContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = Math.random() * 100 + '%';
        drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        drop.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(drop);
    }
}

/**
 * 创建雪花
 */
function createSnowflakes() {
    const container = document.getElementById('snowContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.textContent = '❄';
        flake.style.left = Math.random() * 100 + '%';
        flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        flake.style.animationDuration = (Math.random() * 3 + 3) + 's';
        flake.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(flake);
    }
}

/**
 * 创建云朵
 */
function createClouds() {
    const container = document.getElementById('cloudsContainer');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.width = (Math.random() * 100 + 100) + 'px';
        cloud.style.height = (Math.random() * 30 + 40) + 'px';
        cloud.style.top = (Math.random() * 30 + 10) + '%';
        cloud.style.animationDuration = (Math.random() * 20 + 20) + 's';
        cloud.style.animationDelay = (Math.random() * -20) + 's';
        container.appendChild(cloud);
    }
}

/**
 * 设置天气定时更新
 */
function scheduleWeatherUpdates() {
    const updateTimes = [0, 8, 12, 19]; // 0点, 8点, 12点, 19点
    
    updateTimes.forEach(hour => {
        const now = new Date();
        const updateTime = new Date();
        updateTime.setHours(hour, 0, 0, 0);
        
        if (updateTime <= now) {
            updateTime.setDate(updateTime.getDate() + 1);
        }
        
        const delay = updateTime - now;
        setTimeout(() => {
            fetchWeather();
            scheduleWeatherUpdates(); // 递归设置下一天
        }, delay);
    });
}

/**
 * 检查是否需要更新天气
 */
function checkWeatherUpdate() {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // 在0,8,12,19点的0分更新
    if ([0, 8, 12, 19].includes(hour) && minute === 0) {
        fetchWeather();
    }
}

/**
 * 更新主龙虾状态
 */
function updateMainLobsterState(stateCode) {
    const state = LOBSTER_STATES[stateCode.toUpperCase()] || LOBSTER_STATES.IDLE;
    const lobster = document.getElementById('mainLobster');
    const statusTag = document.getElementById('mainStatusTag');
    const mainStatus = document.getElementById('mainStatus');
    
    if (currentState === state.code) return;
    currentState = state.code;
    
    lobster.setAttribute('data-status', state.code);
    statusTag.innerHTML = `<span class="status-icon">${state.icon}</span><span class="status-text">${state.text}</span>`;
    statusTag.style.background = state.color;
    mainStatus.textContent = `${state.text} ${state.icon}`;
    
    showStateBubble(state.code);
    addTask(state.text, state.icon);
}

/**
 * 显示状态气泡
 */
function showStateBubble(stateCode) {
    const messages = SPEECH_BUBBLES[stateCode] || SPEECH_BUBBLES.idle;
    const message = messages[Math.floor(Math.random() * messages.length)];
    showBubble(message);
}

/**
 * 显示气泡
 */
function showBubble(message) {
    const bubble = document.getElementById('speechBubble');
    bubble.innerHTML = `<p>${message}</p>`;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
}

/**
 * 互动功能
 */
function interact(action) {
    const energyFill = document.getElementById('energyFill');
    const energyText = document.getElementById('energyText');
    const mood = document.getElementById('mood');
    
    let currentEnergy = parseInt(energyText.textContent) || 50;
    
    // 播放音效
    playSound(action);
    
    switch(action) {
        case 'feed':
            showBubble(' yummy! 🍤');
            currentEnergy = Math.min(100, currentEnergy + 10);
            mood.textContent = '饱饱的';
            break;
            
        case 'play':
            showBubble('好开心！🎾');
            currentEnergy = Math.max(0, currentEnergy - 5);
            mood.textContent = '超开心';
            break;
            
        case 'pet':
            showBubble('好舒服~ 👋');
            mood.textContent = '被宠爱';
            break;
            
        case 'check':
            showSystemInfo();
            break;
    }
    
    energyFill.style.height = currentEnergy + '%';
    energyText.textContent = currentEnergy + '%';
    
    if (currentEnergy < 20) mood.textContent = '好累';
}

/**
 * 播放音效
 */
function playSound(action) {
    const sound = document.getElementById('sound-' + action);
    if (sound) {
        sound.volume = 0.3;
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

/**
 * 显示系统信息
 */
function showSystemInfo() {
    const info = {
        '技能数量': '33个',
        '运行时间': document.getElementById('uptime').textContent,
        '子Agent数': subAgents.length + '个',
        '当前天气': currentWeather || '加载中',
        '当前状态': LOBSTER_STATES[currentState.toUpperCase()]?.text || '未知'
    };
    
    const html = Object.entries(info).map(([k, v]) => `<p>${k}: ${v}</p>`).join('');
    const bubble = document.getElementById('speechBubble');
    bubble.innerHTML = `<p><strong>📊 系统状态</strong></p>${html}`;
    bubble.classList.remove('show');
    void bubble.offsetWidth;
    bubble.classList.add('show');
}

/**
 * 添加任务
 */
function addTask(taskText, icon) {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 避免重复添加相同任务
    const existingTask = tasks.find(t => t.text === taskText && t.time === timeStr);
    if (existingTask) return;
    
    tasks.unshift({ text: taskText, icon, time: timeStr });
    if (tasks.length > 5) tasks.pop();
    
    console.log('📋 添加任务:', taskText, '当前任务数:', tasks.length);
    renderTasks();
    updateTodayStats();
}

/**
 * 渲染任务列表
 */
function renderTasks() {
    const container = document.getElementById('taskListCompact');
    
    if (!container) {
        console.error('找不到任务列表容器');
        return;
    }
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="task-compact">等待任务...</div>';
        return;
    }
    
    container.innerHTML = tasks.map((t, index) => 
        `<div class="task-compact ${index === 0 ? 'active' : ''}">${t.icon} ${t.text} <small>${t.time}</small></div>`
    ).join('');
}

/**
 * 更新今日统计
 */
function updateTodayStats() {
    document.getElementById('todayTasks').textContent = tasks.length;
}

/**
 * 子Agent管理
 */
function addSubAgent(agent) {
    subAgents.push(agent);
    renderSubAgents();
}

function removeSubAgent(agentId) {
    subAgents = subAgents.filter(a => a.id !== agentId);
    renderSubAgents();
}

async function renderSubAgents() {
    const compactContainer = document.getElementById('subAgentsCompact');
    const visualContainer = document.getElementById('subLobstersArea');
    
    // 更新侧边栏紧凑显示
    if (subAgents.length === 0) {
        compactContainer.innerHTML = '<span class="empty-text">无</span>';
    } else {
        compactContainer.innerHTML = subAgents.map(a => 
            `<div class="sub-agent-mini">🦞 ${a.name}</div>`
        ).join('');
    }
    
    // 更新场景中的视觉显示
    if (!visualContainer) return;
    
    if (subAgents.length === 0) {
        visualContainer.innerHTML = '';
        return;
    }
    
    // 加载SVG用于子龙虾
    let svgText = '';
    try {
        const response = await fetch('assets/lobster.svg');
        svgText = await response.text();
    } catch (e) {
        console.error('加载子龙虾SVG失败:', e);
        return;
    }
    
    visualContainer.innerHTML = subAgents.map((a, index) => 
        `<div class="sub-lobster" style="animation-delay: -${index * 3}s">${svgText}</div>`
    ).join('');
}

/**
 * 更新运行时间
 */
function updateUptime() {
    const startTime = new Date('2026-03-10T12:13:00');
    const now = new Date();
    const diff = now - startTime;
    
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    
    document.getElementById('uptime').textContent = `${hours}小时${minutes}分`;
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 点击龙虾
    document.getElementById('mainLobster').addEventListener('click', () => {
        interact('pet');
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case '1': interact('feed'); break;
            case '2': interact('play'); break;
            case '3': interact('pet'); break;
            case '4': interact('check'); break;
            case 'm': toggleMusic(); break;
        }
    });
}

/**
 * 对外API
 */
window.ClawHomeAPI = {
    setStatus: updateMainLobsterState,
    addSubAgent: addSubAgent,
    removeSubAgent: removeSubAgent,
    showMessage: showBubble,
    interact: interact,
    refreshWeather: fetchWeather
};

// 初始化
document.addEventListener('DOMContentLoaded', init);
