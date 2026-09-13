# Agent Note: Reading preferences and wide spacing

Status: implemented

[English](2026-09-12-reading-preferences-and-wide-spacing.md) | 中文

## Problem

持久化的 `ui-theme` 区段此前只保存配色偏好与一个正文字号，而该字号轴止步于 17 px。需要更大文字、更宽字形，或字母与行之间更多空白的读者，对这些都没有可选项：会话只以一种系统字体栈渲染，其上限定位于排版舒适度而非阅读。

## Decision

`ThemeSettings` 新增 `fontFamily` 与 `wideSpacing`，`FONT_SIZE_MAX` 由 17 提升到 28 px。插件在「通用」分区注册阅读行——即外观行与字号行已占用的同一 slot——其胶囊按钮选择 `system`、`verdana`、`tahoma` 或 `comic`，一个开关开启宽间距。两处写入与既有偏好走同一条路径：通过的值经 `ui-theme` settings scope 写入，每次变更发出 `theme/change`，Host 推送的区段被采纳而不回写。每次偏好写入还会结算「落定状态是否保留了请求值」，提出请求的那一行在最后一次写入未能存活时显示简短提示：settings 传输把拒绝当作普通结算并重新加载持久区段，因此服务比较落定后的状态与请求，而不依赖任何传输结论。

浏览器把这两个选择投影为 body 属性而非内联变量：`body[data-dsh-font-family]` 与 `body[data-dsh-wide-spacing]`，由插件前引导脚本与 ui-layout 的 `ThemePresenter` 写入，后者在 dispose 时把两者一并撤回。`base.css` 拥有它们的含义——每个 family id 对应一个 `--dsw-font-family` 字体栈，以及宽间距规则的字距、词距与 `--dsh-reading-line-extra` 增量。`gradient-shadow-text.css` 把 `--dsh-reading-line-extra` 加进 Markdown 阶梯的每处行高，因此宽间距同时抬高正文与标题，而固定的小号与代码变体保持紧凑。

以属性而非取值承载，使每个事实只有一处权威：字体栈与「宽」的含义由样式表决定，TypeScript 只保存所选值，规则就写在它们所覆盖的 token 旁边。

## Alternatives considered

**打包一款面向阅读障碍的 webfont（OpenDyslexic、Atkinson Hyperlegible）。** 延后：客户端 bundle 目前不附带任何 webfont，附带字形还需字体资源、`@font-face` 规则、包 `files` 条目与第三方许可声明。选择器先提供已安装字体系列，附带字形日后成为同一张表里的一行。

**由 TypeScript 写出字体系列栈。** 否决：`base.css` 是字体栈的权威，把栈序列化进引导脚本与展示转换器会产生一份会漂移的副本；`system` 选项还得复制样式表自身的字体栈才能还原。

**改为提高低一档字号的上限而非正文字号上限。** 否决：需要更大文字的读者要在正文里得到它，而不只是在低一档的界面元素中。

## Consequences

阅读选择会到达每个 `--dsw-font-family` 消费方，因为该 token 只在 `:root` 声明一次，并按 family id 在 body 上覆盖。宽间距把字距与词距继承到所有后代（含代码块），并给 Markdown 阶梯的行高加上增量；固定的小号与代码变体保持紧凑。在 28 px 上限处正文字号增量为 14 px，而阶梯的每个相关度量都基于该增量表达，因此比例得以保持。可选的只有已安装字体系列，settings scope schema 会在未知 family id 或非布尔间距值到达文档前拒绝它们。四个偏好写入方法返回 `Promise<boolean>`（客户端 API 目录为动态插件作者记录该签名）而非 `void`；校验仍然同步抛出，而忽略返回值的调用方不会产生未处理的 rejection，因为服务把传输丢失折叠为与拒绝相同的 `false`。

## Related

- [Web 样式系统](../process/2026-07-19-web-styling-system.zh.md) —— 该框架的字号与间距策略，本变更扩展而非取代它。
- [@deepseek-ai/dsh-client-ui-theme](../../../../packages/client/ui-theme/README.zh.md) —— 拥有该设置分区、各行与 token 样式表的包。
