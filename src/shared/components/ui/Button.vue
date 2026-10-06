<script setup lang="ts">
import type { ButtonHTMLAttributes } from 'vue'
import { computed } from 'vue'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

defineOptions({ inheritAttrs: false })

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-s-2 whitespace-nowrap rounded-control font-semibold disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground active:brightness-92',
        'red-outline':
          'border border-danger bg-transparent text-danger active:bg-danger-soft disabled:border-muted disabled:bg-muted',
        secondary: 'border border-border bg-card text-accent disabled:border-muted',
      },
      size: {
        default: 'h-control px-s-4 text-body',
        sm: 'button-small h-small px-s-3 text-caption',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
)

type ButtonProps = {
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  type?: ButtonHTMLAttributes['type']
  class?: string
}

const props = withDefaults(defineProps<ButtonProps>(), {
  type: 'button',
  variant: 'primary',
  size: 'default',
})

const classes = computed(() =>
  cn(buttonVariants({ variant: props.variant, size: props.size }), props.class)
)
</script>

<template>
  <button v-bind="$attrs" :class="classes" :type="type">
    <slot />
  </button>
</template>

<style scoped>
button:focus-visible {
  outline: 2px solid var(--color-ring);
  outline-offset: 2px;
}

.button-small::after {
  content: '';
  position: absolute;
  inset: -6px -4px;
}
</style>
