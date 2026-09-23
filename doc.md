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
