/**
 * 🦞 Claw Home - 小龙虾之家主逻辑
 * 实时状态面板和互动系统
 */

// 小龙虾状态配置
const LOBSTER_STATES = {
    RESTING: { code: 'resting', icon: '💤', text: '休息中', color: '#9B59B6', task: '正在休息充电...' },
    WORKING: { code: 'working', icon: '🔨', text: '干活中', color: '#FF6B6B', task: '正在努力工作中...' },
    SYNCING: { code: 'syncing', icon: '☁️', text: '同步中', color: '#3498DB', task: '正在同步数据...' },
    FIXING: { code: 'fixing', icon: '🔧', text: '修Bug中', color: '#E74C3C', task: '正在紧急修复Bug...' },
    THINKING: { code: 'thinking', icon: '💭', text: '思考中', color: '#F39C12', task: '正在深度思考...' },
    LEARNING: { code: 'learning', icon: '📖', text: '学习中', color: '#2ECC71', task: '正在学习新技能...' },
    IDLE: { code: 'idle', icon: '😊', text: '待机中', color: '#95A5A6', task: '等待新任务中...' }
};

// 气泡对话框内容
const SPEECH_BUBBLES = {
    resting: [
        '呼...让我睡一会儿 💤',
        '充电中，请勿打扰 🔋',
        '做个好梦... 🌙'
    ],
    working: [
        '正在努力工作中！💪',
        '这个任务交给我吧！✨',
        '代码写起来~ 🖥️',
        '让我想想怎么解决... 🤔'
    ],
    syncing: [
        '同步数据中... ☁️',
        '备份很重要哦！💾',
        '和云端通话中... 📡'
    ],
    fixing: [
        '啊！有个Bug！🐛',
        '正在紧急修复中... 🔧',
        '这个问题有点棘手... 😅',
        '修Bug修到头秃... 💇'
    ],
    thinking: [
        '让我深度思考一下... 🧠',
        '这个逻辑有点复杂... 🤯',
        '灵感快来吧！💡'
    ],
    learning: [
        '学习新技能中！📚',
        '这个技能好有意思~ ✨',
        '知识就是力量！💪'
    ],
    idle: [
        '好无聊啊... 🥱',
        '有什么我可以帮忙的吗？🙋',
        '我在等待任务中~ ⏳',
        '要不要和我玩一会儿？🎮'
    ]
};

// 子Agent列表
let subAgents = [];

// 当前状态
let currentState = 'working';

// WebSocket连接（预留接口）
let ws = null;

/**
 * 初始化应用
 */
function init() {
    console.log('🦞 Claw Home 初始化完成！');
    
    // 初始化任务列表（清空mock数据）
    initTaskList();
    
    // 设置初始状态
    updateMainLobsterState('idle');
    
    // 绑定事件
    bindEvents();
    
    // 更新运行时间
    updateUptime();
    setInterval(updateUptime, 60000);
    
    // 初始化昼夜模式
    initDayNightMode();
    
    // 初始化子agent框样式
    updateSubAgentCardStyle();
}

/**
 * 初始化任务列表（只保留当前状态任务）
 */
function initTaskList() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
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
    
    const message = isNight ? '🌙 切换到夜间模式~ 晚安！' : '☀️ 切换到日间模式~ 早安！';
    showCustomBubble(message);
}

/**
 * 更新昼夜切换按钮状态
 */
function updateDayNightButton(isNight) {
    const button = document.getElementById('dayNightToggle');
    const icon = document.getElementById('toggleIcon');
    const text = document.getElementById('toggleText');
    
    if (isNight) {
        button.classList.add('night');
        icon.textContent = '🌙';
        text.textContent = '夜间';
    } else {
        button.classList.remove('night');
        icon.textContent = '☀️';
        text.textContent = '日间';
    }
}

/**
 * 显示自定义气泡
 */
function showCustomBubble(message) {
    const bubble = document.getElementById('speechBubble');
    bubble.innerHTML = `<p>${message}</p>`;
    bubble.style.animation = 'none';
    bubble.offsetHeight;
    bubble.style.animation = 'fade-in-out 3s ease-in-out';
}

/**
 * 更新主小龙虾状态 - 任务与状态强绑定
 * @param {string} stateCode - 状态代码
 */
function updateMainLobsterState(stateCode) {
    const state = LOBSTER_STATES[stateCode.toUpperCase()] || LOBSTER_STATES.IDLE;
    const lobster = document.getElementById('mainLobster');
    const statusTag = document.getElementById('mainStatusTag');
    const mainStatus = document.getElementById('mainStatus');
    
    // 如果状态没变，不重复更新
    if (currentState === state.code) {
        return;
    }
    
    currentState = state.code;
    
    // 设置状态属性
    lobster.setAttribute('data-status', state.code);
    
    // 更新状态标签
    statusTag.innerHTML = `<span class="status-icon">${state.icon}</span><span class="status-text">${state.text}</span>`;
    statusTag.style.background = state.color;
    
    // 更新控制面板状态
    mainStatus.textContent = `${state.text} ${state.icon}`;
    
    // 显示气泡对话框
    showSpeechBubble(state.code);
    
    // 更新任务列表（状态改变才更新）
    updateTaskByState(state);
}

/**
 * 根据状态更新任务列表
 * @param {Object} state - 状态对象
 */
function updateTaskByState(state) {
    const taskList = document.getElementById('taskList');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 创建新任务项
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item active';
    taskItem.innerHTML = `
        <span class="task-icon">${state.icon}</span>
        <span class="task-text">${state.task}</span>
        <span class="task-time">${timeStr}</span>
    `;
    
    // 插入到最前面
    taskList.insertBefore(taskItem, taskList.firstChild);
    
    // 标记之前的任务为已完成
    const allTasks = taskList.querySelectorAll('.task-item');
    allTasks.forEach((item, index) => {
        if (index > 0) {
            item.classList.remove('active');
            item.classList.add('completed');
        }
    });
    
    // 限制任务数量（最多显示5个）
    while (taskList.children.length > 5) {
        taskList.removeChild(taskList.lastChild);
    }
}

/**
 * 显示气泡对话框
 */
function showSpeechBubble(stateCode) {
    const bubble = document.getElementById('speechBubble');
    const messages = SPEECH_BUBBLES[stateCode] || SPEECH_BUBBLES.idle;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    bubble.innerHTML = `<p>${message}</p>`;
    bubble.style.animation = 'none';
    bubble.offsetHeight;
    bubble.style.animation = 'fade-in-out 4s ease-in-out';
}

/**
 * 互动功能
 */
function interact(action) {
    const lobster = document.getElementById('mainLobster');
    const energyFill = document.getElementById('energyFill');
    const energyText = document.getElementById('energyText');
    const mood = document.getElementById('mood');
    
    let currentEnergy = parseInt(energyText.textContent);
    
    switch(action) {
        case 'feed':
            lobster.classList.add('eating');
            setTimeout(() => lobster.classList.remove('eating'), 1000);
            showCustomBubble(' yummy! 🍤');
            currentEnergy = Math.min(100, currentEnergy + 10);
            mood.textContent = '😋 饱饱的';
            break;
            
        case 'play':
            lobster.classList.add('happy');
            setTimeout(() => lobster.classList.remove('happy'), 1500);
            showCustomBubble('好开心！🎾');
            currentEnergy = Math.max(0, currentEnergy - 5);
            mood.textContent = '🥳 超开心';
            break;
            
        case 'pet':
            showCustomBubble('好舒服~ 👋');
            mood.textContent = '🥰 被宠爱';
            break;
            
        case 'check':
            showSystemInfo();
            break;
    }
    
    energyFill.style.width = currentEnergy + '%';
    energyText.textContent = currentEnergy + '%';
    
    if (currentEnergy < 20) {
        mood.textContent = '😫 好累';
    }
}

/**
 * 显示系统信息
 */
function showSystemInfo() {
    const info = {
        '技能数量': '33个',
        '运行时间': document.getElementById('uptime').textContent,
        '磁盘使用率': '20%',
        '子Agent数': subAgents.length + '个',
        '当前状态': LOBSTER_STATES[currentState.toUpperCase()]?.text || '未知'
    };
    
    const bubble = document.getElementById('speechBubble');
    bubble.innerHTML = `
        <p><strong>📊 系统状态</strong></p>
        ${Object.entries(info).map(([k, v]) => `<p>${k}: ${v}</p>`).join('')}
    `;
    bubble.style.animation = 'fade-in-out 5s ease-in-out';
}

/**
 * 添加子Agent龙虾
 */
function addSubAgent(agent) {
    subAgents.push(agent);
    renderSubAgents();
    updateSubAgentCardStyle();
}

/**
 * 移除子Agent
 */
function removeSubAgent(agentId) {
    subAgents = subAgents.filter(a => a.id !== agentId);
    renderSubAgents();
    updateSubAgentCardStyle();
}

/**
 * 更新子agent卡片样式
 */
function updateSubAgentCardStyle() {
    const card = document.querySelector('.sub-agents-card');
    if (subAgents.length === 0) {
        card.classList.add('empty');
    } else {
        card.classList.remove('empty');
    }
}

/**
 * 渲染子Agent列表
 */
function renderSubAgents() {
    const container = document.getElementById('subAgentsList');
    const countEl = document.getElementById('subAgentCount');
    
    countEl.textContent = `(${subAgents.length})`;
    
    if (subAgents.length === 0) {
        container.innerHTML = '<p class="empty-text">暂无子Agent运行中...</p>';
        return;
    }
    
    container.innerHTML = subAgents.map(agent => `
        <div class="sub-lobster-item" data-id="${agent.id}">
            <span class="sub-lobster-avatar">🦞</span>
            <div class="sub-lobster-info">
                <div class="sub-lobster-name">${agent.name}</div>
                <div class="sub-lobster-status">${agent.status}</div>
                <div class="sub-lobster-task">${agent.task || '待机中'}</div>
            </div>
        </div>
    `).join('');
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
    document.getElementById('mainLobster').addEventListener('click', () => {
        interact('pet');
    });
    
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case '1': interact('feed'); break;
            case '2': interact('play'); break;
            case '3': interact('pet'); break;
            case '4': interact('check'); break;
        }
    });
}

/**
 * 对外暴露的API（供OpenClaw调用）
 */
window.ClawHomeAPI = {
    setStatus: updateMainLobsterState,
    addSubAgent: addSubAgent,
    removeSubAgent: removeSubAgent,
    showMessage: showCustomBubble,
    interact: interact
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
