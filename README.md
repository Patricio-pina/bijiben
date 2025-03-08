# 塔防游戏

一个简单而有趣的HTML5塔防游戏，使用JavaScript和Canvas实现。

![游戏截图](screenshots/game_screenshot.png)

## 在线演示

你可以在这里玩游戏: [塔防游戏在线演示](https://你的用户名.github.io/tower-defense-game/)

## 游戏说明

在这个塔防游戏中，敌人会沿着固定的路径从起点（绿色方块）移动到终点（红色方块）。你的任务是建造防御塔来阻止敌人到达终点。每当敌人到达终点，你将失去一条生命。当生命值降至零时，游戏结束。

## 如何运行游戏

1. 将所有文件下载到本地文件夹
2. 在浏览器中打开`index.html`文件
3. 开始游戏！

## 游戏控制

- 点击塔按钮选择要建造的塔，然后拖动到地图上合适的位置放置
- 右键点击取消当前塔的放置
- 拖拽已放置的塔到另一个相同类型和等级的塔上可以合并升级
- 点击"暂停游戏"按钮或按空格键可以暂停/继续游戏
- 游戏会自动开始下一波敌人，倒计时显示在界面上
- 使用音量滑块调整游戏音量，点击音量图标可以静音/取消静音

## 塔类型

- **基础塔**（10金币）：基本攻击塔，平衡的伤害和射程
- **箭塔**（20金币）：射程更远，攻击速度更快，但伤害较低
- **魔法塔**（30金币）：高伤害，但攻击速度较慢

## 塔升级系统

每种塔都有三个等级：

1. **一级塔**：初始建造的塔
2. **二级塔**：合并两个相同类型的一级塔获得
3. **三级塔**：合并两个相同类型的二级塔获得

每次升级都会显著提高塔的攻击力、射程和攻击速度。

## 敌人类型

- **普通敌人**（红色）：平衡的生命值和速度
- **快速敌人**（橙色）：移动速度快，但生命值低
- **坦克敌人**（深红色）：生命值高，但移动速度慢
- **BOSS**（紫色）：每关最后一波出现，拥有高生命值和特殊能力
- **超级BOSS**（黑色）：每5关出现一次，极高生命值和强大能力

## BOSS系统

- **普通BOSS**：每关最后一波出现（每3波一次）
  - 拥有高生命值和特殊光环
  - 到达路径点时会恢复少量生命值
  - 到达终点会扣除3条生命
  - 击败后获得大量金币奖励

- **超级BOSS**：每5关出现一次
  - 拥有极高生命值和金色光环
  - 到达路径点时会恢复更多生命值
  - 到达终点会扣除5条生命
  - 击败后获得丰厚金币奖励和额外生命值

## 音效和音乐系统

游戏包含丰富的音效和背景音乐，增强游戏体验：

- **背景音乐**：魔性的游戏背景音乐，营造紧张刺激的游戏氛围
- **塔放置音效**：放置塔时的建造音效
- **塔升级音效**：合并升级塔时的升级音效
- **敌人命中音效**：塔攻击命中敌人时的音效
- **敌人死亡音效**：敌人被消灭时的音效
- **BOSS出现音效**：BOSS出现时的警告音效
- **BOSS死亡音效**：BOSS被击败时的爆炸音效
- **波次开始音效**：新一波敌人开始时的提示音效
- **金币获得音效**：获得金币奖励时的音效
- **按钮点击音效**：点击按钮时的交互音效

所有音效和音乐都使用Web Audio API直接生成，无需外部音频文件，确保游戏在任何环境下都能正常运行。音量可以通过界面右下角的音量控制进行调整或静音。

## 游戏策略

- 合理规划塔的位置，利用路径的弯曲处放置塔可以最大化攻击时间
- 不同类型的塔适合对付不同类型的敌人
- 随着波数增加，敌人会变得更强大，确保你有足够的防御力量
- 合理利用塔的合并升级系统，在关键位置放置高等级塔
- 考虑是建造更多的低级塔还是集中资源升级少数塔
- 为BOSS做好准备，确保有足够的高级塔来对付它们
- 利用暂停功能来规划策略和放置塔

## 技术实现

- 使用HTML5 Canvas进行游戏渲染
- 纯JavaScript实现，无需额外库
- 响应式设计，适应不同屏幕大小
- 拖拽系统实现塔的放置和升级
- BOSS系统增加游戏挑战性和策略深度
- 自动波次系统和暂停功能提升游戏体验
- 完整的音效和音乐系统增强游戏沉浸感

## 未来改进

- 添加更多类型的塔和敌人
- 添加特殊技能和效果
- 添加更多音效和背景音乐
- 实现存档功能
- 添加更多关卡和地图

## 开发

如果你想为这个项目做贡献，请按照以下步骤操作：

1. Fork这个仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

## 许可证

MIT 