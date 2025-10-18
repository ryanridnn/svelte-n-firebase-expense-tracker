<script lang="ts">
  import { user } from "@/stores/user";
  import { onMount } from "svelte";
  import type { Shortcut } from "@/types";
  import { getShortcuts } from "@/firebase/shortcuts";
  import { getShortcutsData } from "./helpers";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import { shortcuts } from "@/stores/shortcuts";
  import { formatRupiahShort } from "@/helpers";
  import { expenseModalState } from "@/stores/modals";

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

  const selectShortcut = (shortcut: Shortcut) => {
    expenseModalState.set({
      type: "add",
      shortcut: shortcut,
    });
  };
</script>

<div
  class="px-6 overflow-x-auto mb-4 no-scrollbar flex items-center gap-2 pr-6"
>
  {#each $shortcuts.list as shortcut}
    <button
      class="px-3.5 py-1.5 text-sm main-gradient rounded-xl whitespace-nowrap hover:scale-[.9] transition"
      on:click={() => selectShortcut(shortcut)}
      >{shortcut.name + " " + formatRupiahShort(shortcut.amount)}
    </button>
  {/each}
</div>
