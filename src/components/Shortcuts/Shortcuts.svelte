<script lang="ts">
  import ShortcutModal from "./ShortcutModal.svelte";
  import { shortcutModalState } from "@/stores/modals";
  import { shortcuts } from "@/stores/shortcuts";
  import { getShortcuts } from "@/firebase/shortcuts";
  import { onMount } from "svelte";
  import { globalExpenseTypes } from "@/stores/expenseType";

  import { user } from "@/stores/user";
  import ShorcutCard from "./ShorcutCard.svelte";
  import type { Shortcut } from "@/types";
  import { getShortcutsData } from "./helpers";

  const fetchShortcuts = async () => {
    if ($user?.id) {
      let fetched_shortcuts: Shortcut[] = await getShortcuts($user.id);

      const populated_shortcuts = getShortcutsData(
        fetched_shortcuts,
        $globalExpenseTypes,
      );

      shortcuts.set({
        loading: false,
        list: populated_shortcuts,
      });
    }
  };

  onMount(() => {
    fetchShortcuts();
  });
</script>

<div class="container px-4 py-6">
  <div class="font-bold text-2xl">Shortcuts</div>
  <div class="mt-1 text-app-text-grey-100 text-sm">
    Shortcuts helps you to add expense faster
  </div>

  <div class="mt-6 flex flex-col gap-4 pb-20">
    {#if !$shortcuts.loading}
      {#if $shortcuts.list.length > 0}
        {#each $shortcuts.list as shortcut}
          <ShorcutCard {shortcut} />
        {/each}
      {:else}
        <div class="flex justify-center pt-8 text-sm">No Shortcuts</div>
      {/if}
    {/if}
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
