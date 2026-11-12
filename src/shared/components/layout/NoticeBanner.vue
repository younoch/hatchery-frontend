<template>
  <div
    role="status"
    class="flex items-start gap-s-2 border-b border-border bg-warning-soft px-s-4 py-s-2 text-caption text-sync-pending"
  >
    <svg
      class="h-[1rem] w-[1rem] shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16.5v.01" />
    </svg>
    <span><slot /></span>
  </div>
</template>