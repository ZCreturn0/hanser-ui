# hanser弹幕组UI库使用文档

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
