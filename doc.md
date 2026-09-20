# hanser弹幕组UI库使用文档

## 引入
````javascript
import 'normalize.css';
import 'hanser-ui/theme/var.css';
````

## 弹窗

````javascript
import HDialog from 'hanser-ui/components/h-dialog';
````

````html
<h-dialog :visible.sync="visible" title="标题" :width="480" @close="handleClose">
    弹窗内容
    <template #foot>
        <button @click="visible = false">取消</button>
        <button @click="submit">确定</button>
    </template>
</h-dialog>
````

| 属性 | 说明 | 类型 | 默认值 |
| -- | -- | -- | -- |
| visible | 是否显示，支持 `.sync` | Boolean | false |
| title | 标题 | String | - |
| aria-label | 无标题时的无障碍名称 | String | 弹窗 |
| width | 面板宽度，数字按 px 处理 | Number / String | 480 |
| max-height | 面板最大高度，数字按 px 处理 | Number / String | calc(100vh - 24px) |
| scroll | 内容超出时是否在内容区滚动 | Boolean | true |
| close-on-overlay | 点击遮罩是否关闭 | Boolean | true |
| close-on-escape | 按 Esc 是否关闭 | Boolean | true |
| show-close | 是否显示关闭按钮 | Boolean | true |
| append-to-body | 是否挂载到 body | Boolean | true |
| lock-scroll | 打开时是否锁定页面滚动 | Boolean | true |
| z-index | 遮罩层级 | Number / String | 3000 |
| panel-class | 面板附加类名 | String / Array / Object | - |
| body-class | 内容区附加类名 | String / Array / Object | - |
| row | 面板是否横向排列，用于 aside 侧栏 | Boolean | false |

插槽：`head`、默认内容、`foot`、`aside`。事件：`update:visible`、`close`。

## 单选

````html
<h-radio-group v-model="radioSelected" @change="radioChange">
    <h-radio v-for="item in radioList" :key="item" :value="item" :label="item" :disabled="item === 1"></h-radio>
</h-radio-group>
````
说明:
1. `h-radio-group` 和 `h-radio` 必须一起使用，且 `h-radio` 必须为 `h-radio-group` 的子元素
2. `radioSelected` 只能为基础数据类型，不支持对象

| 属性 | 说明 |
| -- | -- |
| radioSelected | 绑定的值，为当前选中的值 |
| value | 当前单选对应的值 |
| label | 单选展示的文本 |
| disabled | 禁用状态 |
| border | 带有边框状态 |

| 事件 | 说明 | 回调值 |
| -- | -- | -- |
| change | 选中值改变时触发事件（点击当前选中的 `radio` 或点击 `disabled` 状态的 `radio` 不会触发 `change` 事件） | 当前选中的值 |
