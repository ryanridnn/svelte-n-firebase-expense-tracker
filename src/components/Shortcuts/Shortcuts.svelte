<script lang="ts">
  import ShortcutModal from "./ShortcutModal.svelte";
  import { shortcutModalState } from "@/stores/modals";
</script>

<div class="container px-4 py-6">
  <div class="font-bold text-2xl">Shortcuts</div>
  <div class="mt-1 text-app-text-grey-100 text-sm">
    Shortcuts helps you to add expense faster
  </div>
</div>

<div class="fixed bottom-0 left-0 w-full px-6 py-4 bg-app-bg-100">
  <button
    on:click={() => shortcutModalState.set({ type: "add" })}
    class="btn btn-primary w-full"
  >
    Add Shortcuts
  </button>
</div>

<ShortcutModal />
