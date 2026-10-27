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
| aria-label            | 无障碍名称；传了就优先用，没传时用标题，都没有时叫「弹窗」                    | String                  | -                  |
| role                  | 面板的无障碍角色，需要用户确认的弹窗用 `alertdialog`                          | String                  | dialog             |
| width                 | 面板宽度，数字按 px 处理                                                      | Number / String         | 480                |
| max-height            | 面板最大高度，数字按 px 处理                                                  | Number / String         | calc(100vh - 24px) |
| scroll                | 内容超出时是否在内容区滚动                                                    | Boolean                 | true               |
| close-on-click-modal  | 在遮罩上按下时是否关闭                                                        | Boolean                 | true               |
| close-on-press-escape | 按 Esc 是否关闭；输入法组字时、或这次按键已被里面拦下时不关                   | Boolean                 | true               |
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

打开时焦点先落到面板里带 `autofocus` 或 `data-autofocus` 的元素上，没有就落在面板上；关上后还给打开前有焦点的元素。

点遮罩关闭在按下时就生效：在面板里拖选文字、松手落到遮罩上不会关。按 Esc 认 `Escape` 和 `Esc`；输入法组字时的 Esc 是取消候选词，不关弹窗；里面的气泡、输入框已经处理掉这次 Esc（`event.defaultPrevented`）时也不关。

`aria-label` 和标题同时有时用 `aria-label`：`head` 插槽里常放按钮，拿标题区当名称会把按钮文字也念出来。

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
| type                      | 只有 `danger` 有效果：确定按钮变红；`info`、`success`、`warning`、`error` 照旧能传，不影响显示          | String          | -                                     |
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

## 抽屉

```javascript
import HDrawer from 'hanser-ui/components/h-drawer';
```

```html
<h-drawer :visible.sync="visible" aria-label="选择话题">
    <template #head>
        <span class="sheet-title">话题</span>
        <button type="button" @click="visible = false">完成</button>
    </template>
    <topic-list v-if="visible" />
</h-drawer>
```

从屏幕底部弹上来的面板，手机端代替弹窗用。弹层挂到 body，原位置只留一个不占布局的占位节点，挂过去时内容里已有的滚动位置照旧保留。面板最高 88vh，超出时内容区滚动。关上后内容随弹层一起销毁，下次打开重新创建，相当于气泡弹窗的 `destroy-on-close` 一直开着；要留住的状态放在调用方。

| 属性                  | 说明                                           | 类型            | 默认值 |
| --------------------- | ---------------------------------------------- | --------------- | ------ |
| visible               | 是否显示，支持 `.sync`                         | Boolean         | false  |
| title                 | 标题，用了 `head` 插槽时不显示                 | String          | -      |
| aria-label            | 无障碍名称，传了就优先用，不传时用标题区做名称 | String          | -      |
| direction             | 弹出方向，目前只有 `btt`（从底部）             | String          | btt    |
| close-on-click-modal  | 点击遮罩是否关闭                               | Boolean         | true   |
| close-on-press-escape | 按 Esc 是否关闭                                | Boolean         | true   |
| append-to-body        | 是否挂载到 body                                | Boolean         | true   |
| lock-scroll           | 打开时是否锁定页面滚动                         | Boolean         | true   |
| z-index               | 遮罩层级                                       | Number / String | 2200   |

插槽：`head`（替换标题区，标题和按钮可以一起放）、默认内容。

| 事件           | 说明                                                               | 回调参数                        |
| -------------- | ------------------------------------------------------------------ | ------------------------------- |
| update:visible | 点遮罩或按 Esc 请求关闭                                            | false                           |
| open           | 打开时触发                                                         | -                               |
| opened         | 打开动画结束、焦点落好后触发                                       | -                               |
| close          | 点遮罩或按 Esc 请求关闭时触发，外面改 `visible` 不触发，和弹窗一致 | 关闭来源：`overlay` 或 `escape` |
| closed         | 关闭动画结束后触发                                                 | -                               |

- 打开后焦点落到面板里带 `autofocus` 或 `data-autofocus` 的元素，没有就落在面板上；Tab 在面板内循环。
- 关闭后焦点还给打开前的那个元素；它已经被换掉时，落到它原来所在区域里第一个能聚焦的元素；关闭时焦点已被别处接走就不抢。
- 叠着开多个时只有最上面那个响应键盘；焦点在从抽屉里弹出的确认框里时，键盘归确认框。
- `Escape` 和旧浏览器报的 `Esc` 都认；输入法正在组字，或者里面已经拦下了这次按键（调了 `preventDefault`）时，按 Esc 不关。
- 锁滚动是给 body 加 `h-drawer-lock` 类，不改行内样式，和弹窗的锁滚动互不干扰。

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

## 标签

```javascript
import HTag from 'hanser-ui/components/h-tag';
```

```html
<h-tag
    v-for="(topic, index) in topics"
    :key="topic.id"
    :ref="'tag' + topic.id"
    closable
    :close-label="`移除话题 ${topic.name}`"
    @close="remove(topic, index, $event)">
    <button type="button" @click="openPicker">#{{ topic.name }}</button>
</h-tag>
```

只是一个 8px 圆角的 `inline-flex` 外壳，底色、内边距、文字都由调用方放进默认插槽的内容决定。

| 属性        | 说明                                                         | 类型    | 默认值 |
| ----------- | ------------------------------------------------------------ | ------- | ------ |
| closable    | 是否显示关闭按钮                                             | Boolean | false  |
| close-label | 关闭按钮的无障碍名称，要说清关的是哪个；不传时读屏念「关闭」 | String  | 关闭   |

插槽：默认内容。

事件：`close(event)`，点关闭按钮时触发。组件不会自己消失，调用方从列表里删掉它；`event.detail` 为 0 表示是键盘触发的。

方法：`focusClose()`，把焦点放到关闭按钮上。用键盘关掉一个之后，调用方在 `$nextTick` 里调下一个标签的 `focusClose()`，删光了就把焦点还给入口按钮：

```javascript
remove(topic, index, event) {
    this.$emit('remove', topic);
    if (event.detail) return;
    this.$nextTick(() => {
        const next = this.topics[index] || this.topics[index - 1];
        const tag = next && [].concat(this.$refs['tag' + next.id])[0];
        if (tag) tag.focusClose();
        else if (!next && this.$refs.entry) this.$refs.entry.focus();
    });
}
```

关闭按钮是压在右上角的 18px 小圆标，平时隐藏，鼠标停在标签上或焦点进入标签时淡入；没有悬停的设备（触屏）一直显示。点击范围由 `.h-tag__close::before` 往外撑 4px。手机上要调位置、大小或点击范围时，在调用方覆盖 `.h-tag__close` 和 `.h-tag__close::before`。

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

触发元素不方便放进插槽时（比如几个入口共用一个面板，或者要贴着光标位置弹），传 `reference` 指定参照物，插槽可以不放触发元素：

```html
<!-- 贴着入口按钮弹出，打开时焦点移进面板，关上还给打开前有焦点的入口按钮 -->
<h-popover
    :visible="open"
    :reference="anchor"
    placement="top-start"
    role="dialog"
    aria-label="选择话题"
    autofocus
    destroy-on-close
    transition="h-popover-slide"
    @update:visible="open = $event">
    <topic-list />
</h-popover>
```

`reference` 可以是 DOM 节点、带 `getBoundingClientRect()` 的对象（比如光标所在的选区），也可以是 `{ top, right, bottom, left }` 视口坐标矩形。

| 属性                   | 说明                                                                                            | 类型                    | 默认值         |
| ---------------------- | ----------------------------------------------------------------------------------------------- | ----------------------- | -------------- |
| value                  | 是否显示，支持 `v-model`                                                                        | Boolean                 | -              |
| visible                | 是否显示，支持 `.sync`；与 value 同时传入时优先                                                 | Boolean                 | -              |
| reference              | 参照物，传了就锚在它上面，见下方说明                                                            | DOM 节点 / Object       | -              |
| trigger                | 触发方式：`click`、`hover`、`manual`，只对插槽里的触发元素生效                                  | String                  | click          |
| placement              | 弹出位置：`top`、`bottom`、`left`、`right`，可带 `-start`、`-end`，也支持 `auto` 系列           | String                  | bottom         |
| width                  | 面板宽度，数字按 px 处理                                                                        | Number / String         | -              |
| min-width              | 面板最小宽度；传入 width 时默认与 width 相同                                                    | Number / String         | 120            |
| offset                 | 面板与参照物的间距                                                                              | Number                  | 8              |
| append-to-body         | 是否挂载到 body                                                                                 | Boolean                 | true           |
| disabled               | 是否禁用                                                                                        | Boolean                 | false          |
| close-on-outside       | 点击外部是否关闭；点在触发元素、参照物上不算外部                                                | Boolean                 | true           |
| close-on-press-escape  | 按 Esc 是否关闭，规则见下方说明                                                                 | Boolean                 | true           |
| close-on-content-click | 点击面板内容是否关闭，适合操作菜单                                                              | Boolean                 | false          |
| visible-arrow          | 是否显示箭头                                                                                    | Boolean                 | false          |
| popper-class           | 面板附加类名                                                                                    | String / Array / Object | -              |
| open-delay             | hover 打开延迟，单位 ms                                                                         | Number                  | 0              |
| close-delay            | hover 关闭延迟，单位 ms                                                                         | Number                  | 100            |
| z-index                | 面板层级                                                                                        | Number / String         | 4000           |
| role                   | 面板无障碍角色                                                                                  | String                  | tooltip        |
| aria-label             | 面板的无障碍名称                                                                                | String                  | -              |
| autofocus              | 打开时把焦点移进面板，见下方说明                                                                | Boolean                 | false          |
| return-focus           | 关闭后还焦点：还给打开前有焦点的元素，它不在了再还给参照物；点外面关的不还                      | Boolean                 | 同 autofocus   |
| destroy-on-close       | 关闭后连面板带内容一起销毁，下次打开重建                                                        | Boolean                 | false          |
| transition             | 过渡名，内置 `h-popover-fade`（只有透明度）和 `h-popover-slide`（淡入同时从参照物那侧挪出 4px） | String                  | h-popover-fade |

插槽：`reference`（传了 reference 属性时可以不放）、默认内容。

事件：`input`、`update:visible`、`show`、`after-enter`、`hide`、`after-leave`。点外面、按 Esc、点内容关闭时都会触发 `update:visible`，由外面控制开关时据此同步。实例方法：`show()`、`hide()`、`toggle()`、`updatePosition()`、`focusPanel(selector)`。

传 `reference` 时：

- 开关由外面控制（`visible` 或 `v-model`），`trigger` 只管插槽里的触发元素
- 传 `null` 表示要锚在外部参照物上、只是暂时还没有，和不传不一样：不传就锚在插槽里的触发元素上。插槽里没放触发元素时，组件在原处不占位，也不带 `aria-expanded` 这类触发元素才用的属性
- 面板按视口定位：首选那侧放得下就不翻，放不下而另一侧放得下才翻过去，两侧都放不下就留在首选那侧整体收进视口；离视口边至少 8px，贴边时差的几 px 由收进视口让出来，参照物被滚出视口时面板停在视口边上
- 页面任何一处滚动、窗口缩放、面板或参照物（连同它所在的块）尺寸变化，都会重新定位
- 参照物是矩形时，打开前有焦点的元素不在了就不还焦点

不传 `reference` 时，面板跟着触发元素定位：首选那侧离视口边不够 8px、另一侧够时翻过去；两侧都不够时留在首选那侧、整体收进视口，会压住触发元素。

`autofocus` 打开时先找面板里带 `autofocus` 或 `data-autofocus` 的元素，没有就落在面板上。`return-focus` 不传时跟着它走：焦点移进去了，按 Esc 或由外面关上时就还回来。

按 Esc 的规则所有气泡都一样：焦点在面板里时只关这个气泡，并截住这次按键，开在弹窗、抽屉里时外层不跟着关；焦点不在面板里时，页面上任何地方按 Esc 也会关，但这次按键已经被页面上别处拦下（`event.defaultPrevented`）时不关。两种情况都认 `Escape` 和 `Esc`，输入法组字时的 Esc 不算。焦点不在面板里时，开在弹窗、抽屉里的气泡会和外层一起关。

`destroy-on-close` 适合内容每次打开都要从头初始化的面板。挂到 body 时会保留面板里已有的滚动位置，比如开场就滚到选中项的时间列。

`transition` 也可以传自己的过渡名，样式要写在全局样式里。默认的 `h-popover-fade` 只有透明度变化，没有位移。面板的位置写在 `left`、`top`（朝上、靠右弹时可能是 `bottom`、`right`）上，不占用 `transform`，自定义过渡可以放心用 `transform`。

业务可通过 `--h-popover-padding`、`--h-popover-radius`、`--h-popover-bg-color`、`--h-popover-border`、`--h-popover-shadow`、`--h-popover-text-color`、`--h-popover-font-size`（默认 14px）和 `--h-popover-line-height`（默认 1.5）调整外观。

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

## 开关

```javascript
import HSwitch from 'hanser-ui/components/h-switch';
```

```html
<h-switch v-model="multi" aria-label="多选" />

<!-- 不用 v-model 时，在 change 里自己改值 -->
<h-switch :value="!!vote.anonymous" aria-label="隐藏投票人" @change="(anonymous) => patch({ anonymous })" />
```

| 属性     | 说明                     | 类型    | 默认值 |
| -------- | ------------------------ | ------- | ------ |
| value    | 是否打开，支持 `v-model` | Boolean | false  |
| disabled | 是否禁用                 | Boolean | false  |

事件：`input(value)`、`change(value)`，每次点击都触发，值是切换后的状态。组件自己不改状态，调用方不更新 `value` 就不会切过去。

方法：`focus()`，把焦点放到开关上；禁用时原生按钮聚焦不上，什么也不发生。

尺寸 36×22，打开时底色是 `--theme-accent-color`，圆钮滑动 0.18s。

无障碍：根元素就是 `button`，带 `role="switch"` 和 `aria-checked`，空格、回车都能切换。组件没有文字，调用方要传 `aria-label`（直接落在按钮上），或用 `aria-labelledby` 指向旁边的文字。

## 数字步进

```javascript
import HStepper from 'hanser-ui/components/h-stepper';
```

```html
<h-stepper v-model="max" :min="2" :max="options.length" minus-label="少选一项" plus-label="多选一项">
    最多 {{ max }} 项
</h-stepper>
```

只有减、加两个按钮，中间显示当前值，不能直接输入。

| 属性        | 说明                   | 类型    | 默认值    |
| ----------- | ---------------------- | ------- | --------- |
| value       | 当前值，支持 `v-model` | Number  | 0         |
| min         | 最小值                 | Number  | -Infinity |
| max         | 最大值                 | Number  | Infinity  |
| step        | 每次加减的步长         | Number  | 1         |
| disabled    | 是否禁用               | Boolean | false     |
| minus-label | 减号按钮的无障碍名称   | String  | 减少      |
| plus-label  | 加号按钮的无障碍名称   | String  | 增加      |

插槽：默认插槽（参数 `{ value }`），自定义中间显示的文字，不传时显示数字。

事件：`input(value)`、`change(value, oldValue)`，只在值真的变了时触发；结果超出 `min`、`max` 时按边界取值。

方法：`focus()`，把焦点放到第一个能点的按钮上，到下限时落在加号上；整个禁用，或 `min` 等于 `max` 两个按钮都点不了时，什么也不做。

- 小数步长按值和步长里位数多的那个取整，0.1 加 0.2 得到 0.3
- 到 `min` 或 `max` 时那一侧的按钮隐藏，位置留着，数字不会左右跳；整个禁用时两个按钮都显示成半透明
- 用键盘按到头时，焦点自动移到另一侧按钮上，不会掉回页面开头

手机上要放大点击区时，在调用方覆盖 `.h-stepper__btn` 的 `width`、`height`（默认 24px）。

无障碍：数值区带 `aria-live="polite"`，变化时读屏会念出来。两个按钮只有图形，不传时读屏念「减少」「增加」；最好按场景传 `minus-label`、`plus-label`，说清加减的是什么。

## 滚轮选择

```javascript
import HPicker from 'hanser-ui/components/h-picker';
```

```html
<h-picker v-model="picked" :columns="columns" :column-flex="[1.7, 1, 1]" @change="onPick">
    <template #divider="{ index }">
        <span v-if="index === 1">:</span>
    </template>
</h-picker>
```

几列并排的滚轮，中间那条底色是选中位，滚动停下时吸到最近的可选项。不可选的项隐去但留着位置，停在上面会弹回最近能选的，一样近时先往后找。外面改了 `value`，或者选项增减让选中项挪了位置，都会平滑滚过去；`value` 在某列里找不到时停在第一项。

| 属性               | 说明                                                                | 类型   | 默认值 |
| ------------------ | ------------------------------------------------------------------- | ------ | ------ |
| columns            | 每列一组选项 `[[{ label, value, disabled }]]`，`label` 是显示的文字 | Array  | []     |
| value              | 每列选中项的 value，支持 `v-model`                                  | Array  | []     |
| item-height        | 每项高度，单位 px                                                   | Number | 44     |
| visible-item-count | 一屏露出几项。选中项总在正中，双数时上下边缘各露出半项              | Number | 6      |
| column-flex        | 各列宽度的比例，不给就等分                                          | Array  | []     |

插槽：`divider`（参数 `{ index }`），放在第 `index` 列和下一列之间，比如时、分之间的冒号。

| 事件   | 说明             | 回调参数                            |
| ------ | ---------------- | ----------------------------------- |
| input  | 选中项变化时触发 | 各列选中的 value 数组               |
| change | 选中项变化时触发 | 各列选中的 value 数组、变化的列序号 |

方法：`confirm()`，立刻停下惯性，按各列当前位置落定选中项，同步发 `input` 和 `change`；位置没变的列不发，几列都变时按列各发一次，后一列带上前一列刚定的值。

滚动停下 110ms 后才落定并发 `change`，滚轮还在惯性滚动时点「确定」会拿到上一次的值。「确定」这类按钮先调 `confirm()`，`$nextTick` 后再读值。组件没有工具栏，不发 confirm 事件。

外面没采纳这次选择（比如超出范围被拉回）时，滚轮会滚回实际选中的那项。每列能用 Tab 选中，上下方向键在可选项之间挪一格；读屏按 `spinbutton` 读出当前项的 `label`。

## 月历

```javascript
import HCalendar from 'hanser-ui/components/h-calendar';
```

```html
<h-calendar v-model="date" :today="today" :disabled-date="(day) => day < start" @change="pickDay" />
```

固定 6 行的月历，可以翻月，面板高度不随月份跳。相邻那个月一天都选不了时，那边的翻页按钮隐去。不是今年的月份标题带年份。每次外面给新的 `value` 都会翻到那个月。

| 属性              | 说明                                   | 类型     | 默认值   |
| ----------------- | -------------------------------------- | -------- | -------- |
| value             | 选中的那天，只看年月日，支持 `v-model` | Date     | null     |
| disabled-date     | 传入某天，返回 true 表示这天不能选     | Function | -        |
| first-day-of-week | 每周从周几开始，取 1 到 7，7 是周日    | Number   | 7        |
| today             | 哪天算今天，按别的时区展示时由外面给   | Date     | 当前时间 |

| 事件   | 说明               | 回调参数             |
| ------ | ------------------ | -------------------- |
| input  | 选中日期变化时触发 | 选中那天 0 点的 Date |
| change | 选中日期变化时触发 | 选中那天 0 点的 Date |

格子宽度用变量调整，写在调用方自己的类名上：`--h-calendar-cell-width`（默认 36px），月历总宽是它的 7 倍。

键盘：日期格里只有一格能用 Tab 选中，是选中的那天，不在本月就是第一个能选的；左右方向键差一天、上下差一周，跳过不能选的日子，跨月时跟着翻页，选中跟着焦点走。日期格带 `aria-pressed`，今天带 `aria-current="date"`。
