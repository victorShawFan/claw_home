#!/bin/bash
# 🦞 Claw Home 启动脚本 (Linux/Mac)

echo "🦞 启动 Claw Home 小龙虾之家..."

# 检查端口是否被占用
PORT=8080
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -n "$PID" ]; then
    echo "端口 $PORT 被占用 (PID: $PID)，正在释放..."
    kill -9 $PID 2>/dev/null
    sleep 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 启动服务器
echo "启动 HTTP 服务器..."
nohup python3 -m http.server $PORT > /tmp/claw_home.log 2>&1 &
SERVER_PID=$!

# 等待服务启动
sleep 2

# 验证服务是否启动
if curl -s http://localhost:$PORT > /dev/null; then
    echo "✅ 服务启动成功！"
    echo ""
    echo "🌐 访问地址:"
    echo "   本地: http://localhost:$PORT"
    echo ""
    
    # 自动打开浏览器 (Mac)
    if command -v open &> /dev/null; then
        open http://localhost:$PORT
    fi
    
    echo "按 Ctrl+C 停止服务"
    echo "日志文件: /tmp/claw_home.log"
else
    echo "❌ 服务启动失败"
    echo "日志:"
    cat /tmp/claw_home.log
fi
