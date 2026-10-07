# Shared Components

| Name | Path | Purpose | Props/slots |
|------|------|---------|------------|
| Button | src/shared/components/ui/Button.vue | Primary, red-outline (cancel), and secondary actions, with a compact small variant for inline actions. | variant: `primary` / `red-outline` / `secondary`; size: `default` / `sm`; default slot; forwarded native button attributes |
| Field | src/shared/components/ui/Field.vue | Label, hint, translated error text and slot-driven form wrapper. | id, label, hint, errorKey, errorParams, required, class, labelClass, contentClass, slot props `id`, `errorId`, `hasError` |
| Input | src/shared/components/ui/Input.vue | Base input with optional static unit suffix and focus/error styling. | id, type, invalid, unit, errorId, inputmode, class, inputClass, v-model |
| Select | src/shared/components/ui/Select.vue | Reka UI Select with a compact trigger, accessible popup, error styling, and placeholder support. | id, options, placeholder, invalid, errorId, disabled, class, v-model |
| StepperInput | src/shared/components/ui/StepperInput.vue | Numeric stepper field reusing Field for label/error, with +/- buttons, long-press repeat, unconfirmed-prefill styling, and unit label. | id, label, hint, errorKey, errorParams, unconfirmed, required, unit, min, max, step, decimals, disabled, class, inputClass, v-model; emits `confirmed` |
| Sheet | src/shared/components/ui/Sheet.vue | Bottom sheet with overlay, focus trap, Esc support, and a trigger that restores focus after close. | open, title, description, class, contentClass, slot `trigger`, default slot, slot `close` |
| Tabs | src/shared/components/ui/Tabs.vue | Reusable tab list with compact sub-tab sizing and content slots. | modelValue, items, class, listClass, triggerClass, contentClass, slot default and `content-{value}` |
