<template>
  <div class="flex flex-1 flex-col items-center justify-center gap-s-3 px-s-4 py-s-4 text-center">
    <p class="text-body text-muted-foreground"><slot /></p>
    <slot name="action" />
  </div>
</template>