#!/bin/bash
# 🌐 部署 Claw Home 到 GitHub Pages

echo "🚀 部署 Claw Home 到 GitHub Pages..."

# 检查是否在 git 仓库
if [ ! -d .git ]; then
    echo "❌ 错误: 当前目录不是 git 仓库"
    exit 1
fi

# 创建 gh-pages 分支
git checkout -b gh-pages 2>/dev/null || git checkout gh-pages

# 确保所有文件已提交
git add -A
git commit -m "Deploy to GitHub Pages" || true

# 推送到 gh-pages 分支
git push origin gh-pages -f

# 切换回 main 分支
git checkout main

echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "   https://victorShawFan.github.io/claw_home"
echo ""
echo "注意: 首次部署可能需要几分钟生效"
