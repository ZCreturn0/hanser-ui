# hanser 弹幕组 UI 库使用文档

## 引入

```javascript
import 'normalize.css';
import 'hanser-ui/theme/var.css';
```

## 弹窗

```javascript
import HDialog from 'hanser-ui/components/h-dialog';
```

```html
<h-dialog
    :visible.sync="visible"
    title="标题"
    :width="480"
    :before-close="confirmClose"
    @close="handleClose"
    @closed="handleClosed">
    弹窗内容
    <template #foot>
        <button @click="visible = false">取消</button>
        <button @click="submit">确定</button>
    </template>
</h-dialog>
```

| 属性             | 说明                                                                          | 类型                    | 默认值             |
| ---------------- | ----------------------------------------------------------------------------- | ----------------------- | ------------------ |
| visible          | 是否显示，支持 `.sync`                                                        | Boolean                 | false              |
| title            | 标题                                                                          | String                  | -                  |
| aria-label       | 无标题时的无障碍名称                                                          | String                  | 弹窗               |
| width            | 面板宽度，数字按 px 处理                                                      | Number / String         | 480                |
| max-height       | 面板最大高度，数字按 px 处理                                                  | Number / String         | calc(100vh - 24px) |
| scroll           | 内容超出时是否在内容区滚动                                                    | Boolean                 | true               |
| close-on-overlay | 点击遮罩是否关闭                                                              | Boolean                 | true               |
| close-on-escape  | 按 Esc 是否关闭                                                               | Boolean                 | true               |
| show-close       | 是否显示关闭按钮                                                              | Boolean                 | true               |
| append-to-body   | 是否挂载到 body                                                               | Boolean                 | true               |
| lock-scroll      | 打开时是否锁定页面滚动                                                        | Boolean                 | true               |
| z-index          | 遮罩层级                                                                      | Number / String         | 3000               |
| panel-class      | 面板附加类名                                                                  | String / Array / Object | -                  |
| body-class       | 内容区附加类名                                                                | String / Array / Object | -                  |
| row              | 面板是否横向排列，用于 aside 侧栏                                             | Boolean                 | false              |
| before-close     | 关闭前回调，参数为 `done` 和关闭来源；调用 `done()` 或 Promise resolve 后关闭 | Function                | -                  |

插槽：`head`、默认内容、`foot`、`aside`。

事件：`update:visible`、`close(reason)`、`closed`。`reason` 可为 `button`、`overlay`、`escape` 或 `api`。

`before-close` 兼容回调和 Promise 两种写法。回调模式调用 `done()` 关闭、`done(false)` 取消；Promise resolve 后关闭、reject 后取消。同步返回 `true` 或 `false` 也可直接确认或取消。

## 确认框

```javascript
import Vue from 'vue';
import { Confirm } from 'hanser-ui/components/h-confirm';

Vue.use(Confirm);
```

```javascript
this.$confirm('草稿删除后将无法恢复，是否继续', '提示', { confirmButtonText: '删除' })
    .then(() => this.deleteDraft())
    .catch(() => {});

this.$alert('本地草稿已损坏！');
```

调用方式和 element 的 `MessageBox` 一致：`(message, title, options)`，`title` 可省略，默认「提示」。

- `$confirm`：点确定 resolve `'confirm'`；点取消、关闭按钮、遮罩或按 Esc 时 reject `'cancel'` 或 `'close'`
- `$alert`：只有确定按钮，遮罩和 Esc 不关闭；不管怎么关都 resolve，调用方不用补 `catch`
- 同一时间只显示一个，后来的排队；打开时焦点落在确定按钮上，回车即确认

| 选项                     | 说明                            | 类型            | 默认值                 |
| ------------------------ | ------------------------------- | --------------- | ---------------------- |
| confirmButtonText        | 确定按钮文字                    | String          | 确定                   |
| cancelButtonText         | 取消按钮文字                    | String          | 取消                   |
| showCancel               | 是否显示取消按钮                | Boolean         | confirm 为 true        |
| showClose                | 是否显示右上角关闭按钮          | Boolean         | true                   |
| closeOnOverlay           | 点击遮罩是否关闭                | Boolean         | confirm 为 true        |
| closeOnEscape            | 按 Esc 是否关闭                 | Boolean         | confirm 为 true        |
| dangerouslyUseHTMLString | 正文按 HTML 渲染，内容必须可信  | Boolean         | false                  |
| width                    | 面板宽度，数字按 px 处理        | Number / String | 420                    |
| zIndex                   | 遮罩层级，要压过普通弹窗和下拉  | Number / String | 5000                   |
| callback                 | 关闭时回调，参数为 action       | Function        | -                      |

## 切换栏

```javascript
import HTabs from 'hanser-ui/components/h-tabs';
```

```html
<!-- 页面顶部的主题色导航条，选项带 to 时渲染成 router-link -->
<h-tabs type="nav" replace :items="[{ value: '#point', label: '我的积分', to: '/score#point' }]" :value="$route.hash" />

<!-- 卡片里的下划线筛选，count 为真时在文字后面显示数量 -->
<h-tabs v-model="status" :items="[{ value: 0, label: '待审核', count: 3 }, { value: 1, label: '已发货' }]" />
```

| 属性    | 说明                                                        | 类型            | 默认值 |
| ------- | ----------------------------------------------------------- | --------------- | ------ |
| value   | 当前选中项的 value，支持 `v-model`                          | String / Number | -      |
| items   | 选项列表 `[{ value, label, count, to }]`                    | Array           | []     |
| type    | `nav` 页面导航条，`line` 卡片内下划线筛选                   | String          | line   |
| replace | 带 `to` 的项用 `router.replace` 跳转                        | Boolean         | false  |

事件：`input(value)`、`change(value)` 只在选中项变化时触发；`tab-click(item)` 每次点击都触发，点当前项也会，适合做刷新。

带 `to` 的项依赖 vue-router 注册的 `router-link`。路由驱动的切换栏由调用方根据路由算出 `value` 传入。

## 卡片

```javascript
import HCard from 'hanser-ui/components/h-card';
```

```html
<h-card class="score-card">内容</h-card>
```

卡片外壳：10px 圆角、`--theme-block-border` 描边、`--theme-index-block-shadow` 阴影、`--theme-notice-bg-color` 底色；默认屏宽 750px 以下去掉描边和圆角。内边距、宽度由调用方的类名给。

| 属性           | 说明                                                     | 类型    | 默认值 |
| -------------- | -------------------------------------------------------- | ------- | ------ |
| tag            | 渲染的标签                                               | String  | div    |
| flat-on-mobile | 屏宽 750px 以下去掉描边和圆角，两侧留了边距的卡要关掉 | Boolean | true   |

换底色用 `--h-card-bg-color`，例如侧栏小组件：`--h-card-bg-color: var(--theme-side-menu-bg-color)`。不要直接覆盖 `background`，调用方类名和组件同权重，谁生效取决于样式加载顺序。

## 气泡弹窗

```javascript
import HPopover from 'hanser-ui/components/h-popover';
```

```html
<h-popover v-model="visible" trigger="click" placement="bottom-end" :width="240" panel-class="user-actions">
    <button type="button">编辑</button>
    <button type="button">删除</button>
    <template #reference>
        <button type="button">更多</button>
    </template>
</h-popover>
```

| 属性                   | 说明                                            | 类型                    | 默认值  |
| ---------------------- | ----------------------------------------------- | ----------------------- | ------- |
| value                  | 是否显示，支持 `v-model`                        | Boolean                 | -       |
| visible                | 是否显示，支持 `.sync`；与 value 同时传入时优先 | Boolean                 | -       |
| trigger                | 触发方式：`click`、`hover`、`manual`            | String                  | click   |
| placement              | 弹出位置，使用 Popper placement 值              | String                  | bottom  |
| width                  | 面板宽度，数字按 px 处理                        | Number / String         | -       |
| min-width              | 面板最小宽度；传入 width 时默认与 width 相同    | Number / String         | 120     |
| offset                 | 面板与触发元素的间距                            | Number                  | 8       |
| append-to-body         | 是否挂载到 body                                 | Boolean                 | true    |
| disabled               | 是否禁用                                        | Boolean                 | false   |
| close-on-outside       | 点击外部是否关闭                                | Boolean                 | true    |
| close-on-escape        | 按 Esc 是否关闭                                 | Boolean                 | true    |
| close-on-content-click | 点击面板内容是否关闭，适合操作菜单              | Boolean                 | false   |
| show-arrow             | 是否显示箭头                                    | Boolean                 | false   |
| panel-class            | 面板附加类名                                    | String / Array / Object | -       |
| open-delay             | hover 打开延迟，单位 ms                         | Number                  | 0       |
| close-delay            | hover 关闭延迟，单位 ms                         | Number                  | 100     |
| z-index                | 面板层级                                        | Number / String         | 4000    |
| role                   | 面板无障碍角色                                  | String                  | tooltip |

插槽：`reference`、默认内容。

事件：`input`、`update:visible`、`show`、`after-show`、`hide`、`after-hide`。实例方法：`show()`、`hide()`、`toggle()`、`updatePosition()`、`focusPanel(selector)`。

组件仅使用透明度过渡，不会产生上下位移动画。业务可通过 `--h-popover-padding`、`--h-popover-radius`、`--h-popover-bg-color`、`--h-popover-border`、`--h-popover-shadow` 和 `--h-popover-text-color` 调整外观。

## 单选

```html
<h-radio-group v-model="radioSelected" @change="radioChange">
    <h-radio v-for="item in radioList" :key="item" :value="item" :label="item" :disabled="item === 1"></h-radio>
</h-radio-group>
```

说明:

1. `h-radio-group` 和 `h-radio` 必须一起使用，且 `h-radio` 必须为 `h-radio-group` 的子元素
2. `radioSelected` 只能为基础数据类型，不支持对象

| 属性          | 说明                     |
| ------------- | ------------------------ |
| radioSelected | 绑定的值，为当前选中的值 |
| value         | 当前单选对应的值         |
| label         | 单选展示的文本           |
| disabled      | 禁用状态                 |
| border        | 带有边框状态             |

| 事件   | 说明                                                                                                   | 回调值       |
| ------ | ------------------------------------------------------------------------------------------------------ | ------------ |
| change | 选中值改变时触发事件（点击当前选中的 `radio` 或点击 `disabled` 状态的 `radio` 不会触发 `change` 事件） | 当前选中的值 |
