/**
 * 🦞 Claw Home - 小龙虾之家主逻辑
 * 实时状态面板和互动系统
 */

// 小龙虾状态配置
const LOBSTER_STATES = {
    RESTING: { code: 'resting', icon: '💤', text: '休息中', color: '#9B59B6' },
    WORKING: { code: 'working', icon: '🔨', text: '干活中', color: '#FF6B6B' },
    SYNCING: { code: 'syncing', icon: '☁️', text: '同步中', color: '#3498DB' },
    FIXING: { code: 'fixing', icon: '🔧', text: '修Bug中', color: '#E74C3C' },
    THINKING: { code: 'thinking', icon: '💭', text: '思考中', color: '#F39C12' },
    LEARNING: { code: 'learning', icon: '📖', text: '学习中', color: '#2ECC71' },
    IDLE: { code: 'idle', icon: '😊', text: '待机中', color: '#95A5A6' }
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

// 子Agent列表（模拟数据）
let subAgents = [];

// WebSocket连接（预留接口）
let ws = null;

/**
 * 初始化应用
 */
function init() {
    console.log('🦞 Claw Home 初始化完成！');
    
    // 设置初始状态
    updateMainLobsterState('working');
    
    // 启动定时更新
    startAutoUpdate();
    
    // 模拟子Agent（实际项目中会从WebSocket获取）
    simulateSubAgents();
    
    // 绑定事件
    bindEvents();
    
    // 更新运行时间
    updateUptime();
    setInterval(updateUptime, 60000);
}

/**
 * 更新主小龙虾状态
 * @param {string} stateCode - 状态代码
 */
function updateMainLobsterState(stateCode) {
    const state = LOBSTER_STATES[stateCode.toUpperCase()] || LOBSTER_STATES.IDLE;
    const lobster = document.getElementById('mainLobster');
    const statusTag = document.getElementById('mainStatusTag');
    const mainStatus = document.getElementById('mainStatus');
    
    // 设置状态属性
    lobster.setAttribute('data-status', state.code);
    
    // 更新状态标签
    statusTag.innerHTML = `<span class="status-icon">${state.icon}</span><span class="status-text">${state.text}</span>`;
    statusTag.style.background = state.color;
    
    // 更新控制面板状态
    mainStatus.textContent = `${state.text} ${state.icon}`;
    
    // 显示气泡对话框
    showSpeechBubble(state.code);
    
    // 添加到任务列表
    if (state.code !== 'idle') {
        addTask(`${state.text}`, state.icon);
    }
}

/**
 * 显示气泡对话框
 * @param {string} stateCode - 状态代码
 */
function showSpeechBubble(stateCode) {
    const bubble = document.getElementById('speechBubble');
    const messages = SPEECH_BUBBLES[stateCode] || SPEECH_BUBBLES.idle;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    bubble.innerHTML = `<p>${message}</p>`;
    bubble.style.animation = 'none';
    bubble.offsetHeight; // 触发重排
    bubble.style.animation = 'fade-in-out 4s ease-in-out';
}

/**
 * 互动功能
 * @param {string} action - 动作类型
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
            showSpeechBubble('eating');
            currentEnergy = Math.min(100, currentEnergy + 10);
            mood.textContent = '😋 饱饱的';
            break;
            
        case 'play':
            lobster.classList.add('happy');
            setTimeout(() => lobster.classList.remove('happy'), 1500);
            showSpeechBubble('playing');
            currentEnergy = Math.max(0, currentEnergy - 5);
            mood.textContent = '🥳 超开心';
            break;
            
        case 'pet':
            lobster.style.transform = 'scale(1.1)';
            setTimeout(() => lobster.style.transform = '', 300);
            showSpeechBubble('petting');
            mood.textContent = '🥰 被宠爱';
            break;
            
        case 'check':
            showSystemInfo();
            break;
    }
    
    // 更新能量条
    energyFill.style.width = currentEnergy + '%';
    energyText.textContent = currentEnergy + '%';
    
    // 根据能量更新心情
    if (currentEnergy < 20) {
        mood.textContent = '😫 好累';
    } else if (currentEnergy > 80) {
        mood.textContent = '😊 开心';
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
        '可用空间': '45GB',
        '子Agent数': subAgents.length + '个'
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
 * @param {Object} agent - Agent信息
 */
function addSubAgent(agent) {
    subAgents.push(agent);
    renderSubAgents();
}

/**
 * 移除子Agent
 * @param {string} agentId - Agent ID
 */
function removeSubAgent(agentId) {
    subAgents = subAgents.filter(a => a.id !== agentId);
    renderSubAgents();
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
 * 模拟子Agent（演示用）
 */
function simulateSubAgents() {
    // 模拟添加一个子Agent
    setTimeout(() => {
        addSubAgent({
            id: 'agent-1',
            name: '小钳子 #1',
            status: '🟢 运行中',
            task: '搜索新技能...'
        });
    }, 3000);
    
    // 模拟移除
    setTimeout(() => {
        removeSubAgent('agent-1');
    }, 15000);
}

/**
 * 添加任务到列表
 * @param {string} task - 任务描述
 * @param {string} icon - 图标
 */
function addTask(task, icon = '✅') {
    const taskList = document.getElementById('taskList');
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item active';
    taskItem.innerHTML = `
        <span class="task-icon">${icon}</span>
        <span class="task-text">${task}</span>
        <span class="task-time">${timeStr}</span>
    `;
    
    // 插入到最前面
    taskList.insertBefore(taskItem, taskList.firstChild);
    
    // 限制任务数量
    while (taskList.children.length > 10) {
        taskList.removeChild(taskList.lastChild);
    }
    
    // 3秒后标记为完成
    setTimeout(() => {
        taskItem.classList.remove('active');
        taskItem.classList.add('completed');
    }, 3000);
}

/**
 * 自动更新状态（模拟）
 */
function startAutoUpdate() {
    const states = ['working', 'thinking', 'syncing', 'idle'];
    let currentIndex = 0;
    
    // 每10秒切换一次状态（演示用）
    setInterval(() => {
        currentIndex = (currentIndex + 1) % states.length;
        updateMainLobsterState(states[currentIndex]);
    }, 10000);
}

/**
 * 更新运行时间
 */
function updateUptime() {
    const startTime = new Date('2026-03-10T12:13:00'); // 会话开始时间
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
    // 点击小龙虾互动
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
        }
    });
}

/**
 * WebSocket连接（预留接口）
 */
function connectWebSocket() {
    // 实际项目中连接到OpenClaw的后端
    // ws = new WebSocket('ws://localhost:8080');
    // ws.onmessage = (event) => {
    //     const data = JSON.parse(event.data);
    //     handleWebSocketMessage(data);
    // };
}

/**
 * 处理WebSocket消息
 * @param {Object} data - 消息数据
 */
function handleWebSocketMessage(data) {
    switch(data.type) {
        case 'status_update':
            updateMainLobsterState(data.status);
            break;
        case 'subagent_add':
            addSubAgent(data.agent);
            break;
        case 'subagent_remove':
            removeSubAgent(data.agentId);
            break;
        case 'energy_update':
            document.getElementById('energyFill').style.width = data.energy + '%';
            document.getElementById('energyText').textContent = data.energy + '%';
            break;
    }
}

/**
 * 对外暴露的API（供OpenClaw调用）
 */
window.ClawHomeAPI = {
    setStatus: updateMainLobsterState,
    addSubAgent: addSubAgent,
    removeSubAgent: removeSubAgent,
    showMessage: showSpeechBubble,
    interact: interact
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
