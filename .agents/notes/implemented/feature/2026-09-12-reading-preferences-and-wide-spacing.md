# Agent Note: Reading preferences and wide spacing

Status: implemented

English | [中文](2026-09-12-reading-preferences-and-wide-spacing.zh.md)

## Problem

The durable `ui-theme` section carried the color preference and one content font size, and that size axis stopped at 17 px. A reader who needs larger text, wider letterforms, or more space between letters and lines had no setting for any of it: the conversation rendered in one system stack, at a ceiling chosen for layout comfort rather than for reading.

## Decision

`ThemeSettings` gains `fontFamily` and `wideSpacing`, and `FONT_SIZE_MAX` rises from 17 to 28 px. The plugin registers a Reading row in the General section — the slot the Appearance and font-size rows already occupy — whose pills select `system`, `verdana`, `tahoma`, or `comic` and whose switch turns the wide spacing on. Both writes take the path the existing preferences take: accepted values go through the `ui-theme` settings scope, every change emits `theme/change`, and a section pushed from the Host is adopted without writing back. Every preference write also resolves to whether the settled state kept the requested value, and the row that asked shows a short notice while the last write did not survive: the settings transport reports a refusal as a plain settlement and reloads the durable section, so the service compares the state that settles against the request instead of trusting any transport outcome.

The browser projects the two choices as body attributes rather than inline variables: `body[data-dsh-font-family]` and `body[data-dsh-wide-spacing]`, written by the pre-plugin bootstrap script and by ui-layout's `ThemePresenter`, which retracts both on dispose. `base.css` owns what they mean — one `--dsw-font-family` stack per family id, plus the letter spacing, word spacing, and `--dsh-reading-line-extra` increment of the wide-spacing rule. `gradient-shadow-text.css` adds `--dsh-reading-line-extra` to each Markdown ladder line-height, so wide spacing lifts prose and headings together while the fixed small and code variants stay dense.

Attributes rather than values keep one authority per fact: the stylesheets decide what each family stack and "wide" mean, TypeScript carries only the persisted choice, and the rules sit beside the tokens they override.

## Alternatives considered

**Bundle a dyslexia-specific webfont (OpenDyslexic, Atkinson Hyperlegible).** Deferred: the client bundle ships no webfont, so a bundled face also brings font assets, `@font-face` rules, package `files` entries, and a third-party notice. The picker offers installed families first, and a bundled face becomes one more entry in the same table.

**Write the family stacks from TypeScript.** Rejected: `base.css` is the font-stack authority, and serializing the stacks into both the bootstrap script and the presenter creates a second copy that drifts; the `system` choice would need a copy of the sheet's own stack just to restore it.

**Raise the secondary tier instead of the body ceiling.** Rejected: a reader who needs larger text needs it in the prose, not only in the chrome one step under it.

## Consequences

The reading choice reaches every `--dsw-font-family` consumer, because the token is declared once on `:root` and overridden per family id on body. Wide spacing inherits letter and word spacing into every descendant, code blocks included, and adds its increment to the Markdown ladder's line-heights; the fixed small and code variants stay dense. At the 28 px ceiling the content delta is 14 px, and the ladder expresses every dependent measurement against that delta, so proportions hold. Only installed families are selectable, and the settings-scope schema rejects an unknown family id or a non-boolean spacing value before either reaches the document. The four preference setters return `Promise<boolean>` — a signature the client API catalog carries for dynamic-plugin authors — instead of `void`; validation still throws synchronously, and a caller that ignores the returned promise cannot raise an unhandled rejection, because the service folds a lost transport into the same `false` a refusal settles.

## Related

- [Web styling system](../process/2026-07-19-web-styling-system.md) — the framework's font-size and spacing policy, which this change extends rather than replaces.
- [@deepseek-ai/dsh-client-ui-theme](../../../../packages/client/ui-theme/README.md) — the package that owns the settings section, the rows, and the token sheets.
