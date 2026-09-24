# hanser 弹幕组 UI 库使用文档

## 引入

```javascript
import 'normalize.css';
import 'hanser-ui/theme/var.css';
```

组件可以从包入口引，也可以按路径引。按路径引只打包用到的组件：

```javascript
import { HTabs, HCard, Confirm } from 'hanser-ui';
import HTabs from 'hanser-ui/components/h-tabs';
```

属性、事件、选项的命名沿用通行写法（如 `close-on-click-modal`、`close-on-press-escape`、`custom-class`），同一个概念全库只用一个名字。

手机端断点统一是 750px，定义在 `hanser-ui/common/breakpoints.js`（`MOBILE_MAX_WIDTH`）。组件 CSS 的媒体查询只能写字面量，发版前 `npm run check-breakpoints` 会核对所有组件都和它一致。

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

| 属性                  | 说明                                                                          | 类型                    | 默认值             |
| --------------------- | ----------------------------------------------------------------------------- | ----------------------- | ------------------ |
| visible               | 是否显示，支持 `.sync`                                                        | Boolean                 | false              |
| title                 | 标题                                                                          | String                  | -                  |
| aria-label            | 无标题时的无障碍名称                                                          | String                  | 弹窗               |
| role                  | 面板的无障碍角色，需要用户确认的弹窗用 `alertdialog`                          | String                  | dialog             |
| width                 | 面板宽度，数字按 px 处理                                                      | Number / String         | 480                |
| max-height            | 面板最大高度，数字按 px 处理                                                  | Number / String         | calc(100vh - 24px) |
| scroll                | 内容超出时是否在内容区滚动                                                    | Boolean                 | true               |
| close-on-click-modal  | 点击遮罩是否关闭                                                              | Boolean                 | true               |
| close-on-press-escape | 按 Esc 是否关闭                                                               | Boolean                 | true               |
| show-close            | 是否显示关闭按钮                                                              | Boolean                 | true               |
| append-to-body        | 是否挂载到 body                                                               | Boolean                 | true               |
| lock-scroll           | 打开时是否锁定页面滚动                                                        | Boolean                 | true               |
| z-index               | 遮罩层级                                                                      | Number / String         | 3000               |
| custom-class          | 面板附加类名                                                                  | String / Array / Object | -                  |
| body-class            | 内容区附加类名                                                                | String / Array / Object | -                  |
| row                   | 面板是否横向排列，用于 aside 侧栏                                             | Boolean                 | false              |
| before-close          | 关闭前回调，参数为 `done` 和关闭来源；调用 `done()` 或 Promise resolve 后关闭 | Function                | -                  |

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
this.$confirm('草稿删除后将无法恢复，是否继续', '提示', { type: 'warning', confirmButtonText: '删除' })
    .then(() => this.deleteDraft())
    .catch(() => {});

this.$alert('本地草稿已损坏！', { type: 'error' });

this.$prompt('请输入图片链接', '提示', { inputPattern: /^https?:\/\//, inputErrorMessage: '链接格式不对' })
    .then(({ value }) => this.addImage(value));

// 确定后等请求完成再关，期间确定按钮转圈；Promise reject 时弹窗留着
this.$confirm('确认删除该周边？', '删除', {
    type: 'danger',
    beforeClose: (action) => (action === 'confirm' ? this.deleteHobby() : Promise.resolve())
});
```

组件外（store、路由守卫等普通 JS）也能用，`Vue.use(Confirm)` 之后调用：

```javascript
import { confirm, alert, prompt } from 'hanser-ui/components/h-confirm';
```

调用方式：`(message, title, options)`，`title` 可省略，默认「提示」。

- `$confirm`：点确定 resolve `'confirm'`；点取消、关闭按钮、遮罩或按 Esc 时 reject `'cancel'`。开 `distinguishCancelAndClose` 后，关闭按钮、遮罩、Esc 改为 reject `'close'`
- `$prompt`：带输入框，确定时 resolve `{ value, action }`，其余同 `$confirm`；输入框里回车等于点确定
- `$alert`：只有确定按钮，遮罩和 Esc 不关闭；不管怎么关都 resolve，调用方不用补 `catch`
- 同一时间只显示一个，后来的排队；打开时焦点落在确定按钮上（`$prompt` 落在输入框上），回车即确认
- 面板的无障碍角色是 `alertdialog`

| 选项                      | 说明                                                                                                    | 类型            | 默认值                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------- |
| type                      | 图标：`info`、`success`、`warning`、`error`；`danger` 同 `error` 的图标，确定按钮同时变红               | String          | -                                     |
| confirmButtonText         | 确定按钮文字                                                                                            | String          | 确定                                  |
| cancelButtonText          | 取消按钮文字                                                                                            | String          | 取消                                  |
| confirmButtonType         | 确定按钮类型，同 h-button 的 `type`                                                                     | String          | primary，`type` 为 danger 时是 danger |
| showConfirmButton         | 是否显示确定按钮                                                                                        | Boolean         | true                                  |
| showCancelButton          | 是否显示取消按钮                                                                                        | Boolean         | alert 为 false                        |
| showClose                 | 是否显示右上角关闭按钮                                                                                  | Boolean         | true                                  |
| closeOnClickModal         | 点击遮罩是否关闭                                                                                        | Boolean         | alert 为 false                        |
| closeOnPressEscape        | 按 Esc 是否关闭                                                                                         | Boolean         | alert 为 false                        |
| distinguishCancelAndClose | 关闭按钮、遮罩、Esc 是否和取消区分开，区分时 action 为 `'close'`                                        | Boolean         | false                                 |
| beforeClose               | 关闭前回调 `(action, instance, done)`，调用 `done()` 才关；返回 Promise 时 resolve 才关，确定时按钮转圈 | Function        | -                                     |
| callback                  | 关闭时回调：`(action, instance)`，`$prompt` 是 `(value, action)`                                        | Function        | -                                     |
| dangerouslyUseHTMLString  | 正文按 HTML 渲染，内容必须可信                                                                          | Boolean         | false                                 |
| customClass               | 面板附加类名                                                                                            | String          | -                                     |
| width                     | 面板宽度，数字按 px 处理                                                                                | Number / String | 420                                   |
| zIndex                    | 遮罩层级，要压过普通弹窗和下拉                                                                          | Number / String | 5000                                  |
| inputValue                | `$prompt` 输入框初始值                                                                                  | String          | -                                     |
| inputPlaceholder          | `$prompt` 输入框占位文字                                                                                | String          | -                                     |
| inputType                 | `$prompt` 输入框类型                                                                                    | String          | text                                  |
| inputPattern              | `$prompt` 校验正则                                                                                      | RegExp          | -                                     |
| inputValidator            | `$prompt` 校验函数，返回 `false` 或错误文字表示不通过                                                   | Function        | -                                     |
| inputErrorMessage         | `$prompt` 校验不通过时的提示                                                                            | String          | 输入的数据不合法!                     |

`beforeClose` 里可以改 `instance.confirmButtonText`、`instance.confirmButtonLoading` 等字段，改完即时生效。

h-alert 已废弃：它注册的 `$alert` 现在转交给这里，原来的 `$alert('文字')`、`$alert({ type, message })` 照旧可用，和 `Vue.use(Confirm)` 同时装也不会互相覆盖。新代码直接用 h-confirm。

## 切换栏

```javascript
import HTabs from 'hanser-ui/components/h-tabs';
```

```html
<!-- 页面顶部的主题色导航条，选项带 to 时渲染成 router-link -->
<h-tabs type="nav" replace :items="[{ value: '#point', label: '我的积分', to: '/score#point' }]" :value="$route.hash" />

<!-- 卡片里的下划线筛选，count 为真时在文字后面显示数量 -->
<h-tabs v-model="status" :items="[{ value: 0, label: '待审核', count: 3 }, { value: 1, label: '已发货', disabled: true }]" />

<!-- 自定义每一项的文字，比如带未读红点 -->
<h-tabs v-model="tab" :items="items">
    <template #label="{ item, active }">{{ item.label }}<i v-if="item.unread" class="dot" /></template>
</h-tabs>
```

只管这一排切换项，不管下面的内容面板，内容由调用方按 `value` 自己切。

| 属性           | 说明                                                        | 类型            | 默认值 |
| -------------- | ----------------------------------------------------------- | --------------- | ------ |
| value          | 当前选中项的 value，支持 `v-model`                          | String / Number | -      |
| items          | 选项列表 `[{ value, label, count, to, replace, disabled }]` | Array           | []     |
| type           | `nav` 页面导航条，`line` 卡片内下划线筛选                   | String          | line   |
| replace        | 带 `to` 的项用 `router.replace` 跳转，单项的 `replace` 优先 | Boolean         | false  |
| fill-on-mobile | 屏宽 750px 以下 `nav` 的项等分铺满                          | Boolean         | true   |

插槽：`label`（参数 `{ item, active }`，自定义每一项的文字，数量仍由 `count` 显示）；`extra`，放在所有项后面，用来放搜索、下载这类入口。

事件：`input(value)`、`change(value)` 只在选中项变化时触发；`tab-click(item)` 每次点击都触发，点当前项也会，适合做刷新。

`nav` 的尺寸和字色可以用变量调整，写在调用方自己的类名上：`--h-tabs-nav-padding`（默认 11px 28px）、`--h-tabs-nav-radius`（10px）、`--h-tabs-nav-text-color`（`--theme-text-color-white`）、`--h-tabs-nav-item-margin`（0 15px）、`--h-tabs-nav-item-min-width`（auto）、`--h-tabs-nav-label-padding`（0）。

带 `to` 的项依赖 vue-router 注册的 `router-link`。路由驱动的切换栏由调用方根据路由算出 `value` 传入。

无障碍：项带 `to` 时整条按导航处理，根元素是 `nav`，当前项带 `aria-current`；否则按页内切换处理，根元素是 `tablist`，每项是 `tab` 带 `aria-selected`，只有当前项能用 Tab 键选中，左右方向键、Home、End 在可用项之间移动并直接选中。同一条里不要混用两种项。

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

外观用变量调整，写在调用方自己的类名上：`--h-card-bg-color`（默认 `--theme-notice-bg-color`）、`--h-card-border`（2px solid `--theme-block-border`）、`--h-card-radius`（10px）、`--h-card-shadow`（`--theme-index-block-shadow`）。例如侧栏小组件：`--h-card-bg-color: var(--theme-side-menu-bg-color)`。不要直接覆盖 `background`、`border` 这些属性，调用方类名和组件同权重，谁生效取决于样式加载顺序。

## 气泡弹窗

```javascript
import HPopover from 'hanser-ui/components/h-popover';
```

```html
<h-popover v-model="visible" trigger="click" placement="bottom-end" :width="240" popper-class="user-actions">
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
| close-on-press-escape  | 按 Esc 是否关闭                                 | Boolean                 | true    |
| close-on-content-click | 点击面板内容是否关闭，适合操作菜单              | Boolean                 | false   |
| visible-arrow          | 是否显示箭头                                    | Boolean                 | false   |
| popper-class           | 面板附加类名                                    | String / Array / Object | -       |
| open-delay             | hover 打开延迟，单位 ms                         | Number                  | 0       |
| close-delay            | hover 关闭延迟，单位 ms                         | Number                  | 100     |
| z-index                | 面板层级                                        | Number / String         | 4000    |
| role                   | 面板无障碍角色                                  | String                  | tooltip |

插槽：`reference`、默认内容。

事件：`input`、`update:visible`、`show`、`after-enter`、`hide`、`after-leave`。实例方法：`show()`、`hide()`、`toggle()`、`updatePosition()`、`focusPanel(selector)`。

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
