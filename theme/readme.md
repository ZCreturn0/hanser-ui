## 增加主题色说明

### 增加主题色步骤:

1. 在 `var.css` 中每个主题加上要增加的变量
2. 在 `colors.js` 加上主题色对应的含义
3. 运行命令 `npm run build-theme` 构建js引用文件和展示页后即可上传代码

注意变量命名

## 面板配色（surface）

`--theme-surface-*` 这一组是站里浮层、私聊、编辑器和各类卡片内部通用的面板配色，原来在社区里分成 `--im-*`、`--ed-*` 两份各自维护，现在收在这里。取值规则：

- 正文、次要文字、链接对面板底、悬浮底、选中底、胶囊底都 >= 4.5
- 底色一律不透明，不允许半透明压在页面背景图上
- 强调色 `--theme-accent-color` 是填充色，压白底只有 1.72，不能直接当正文；要强调色的文字用 `--theme-surface-link-color`
- 暗夜面板是深蓝，未读徽章反过来做亮底深字，否则深压深看不见
- `--theme-modal-panel-bg-color`、`--theme-modal-text-color` 等弹窗变量和气泡变量都引用 surface，改面板配色时一起生效

## 状态色（status）

`--theme-status-*-color` 是提示、成功、警告、危险四种状态图标的颜色，压面板底色都 >= 3。原有的 `--theme-color-warning`（#e09d16）、`--theme-color-success`（#6ea82f）压白底只有 2.33、2.87，当图标看不清，所以另起这一组；`--theme-color-*` 仍用在按钮底色这类填充上。
