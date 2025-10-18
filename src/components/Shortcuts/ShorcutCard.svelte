<script lang="ts">
  import type { Shortcut } from "@/types";
  import { formatRupiah } from "@/helpers";
  import { Icon, ArrowLongRight } from "svelte-hero-icons";
  import { shortcutModalState } from "@/stores/modals";
  import { hideAmount } from "@/stores/hideAmount";

  export let shortcut: Shortcut;

  const onClick = () => {
    shortcutModalState.set({
      type: "edit",
      init: shortcut,
    });
  };
</script>

<button
  on:click={onClick}
  class="px-4 py-4 main-gradient rounded-lg hover:scale-[.96] transition duration-200"
>
  <div class="flex justify-between items-center font-bold text-lg">
    <span>
      {shortcut.name}
    </span>
    <div>
      <Icon src={ArrowLongRight} size="20" />
    </div>
  </div>
  <div
    class="flex items-center gap-2 mt-1 text-xs font-semibold text-app-text-grey-100"
  >
    <div class="">
      {formatRupiah(shortcut.amount, $hideAmount)}
    </div>
    <div class="w-[4px] h-[4px] rounded-full bg-[#677876]"></div>
    <div class="">
      {shortcut.expenseType ? shortcut.expenseType.name : shortcut.type}
    </div>
    <div class="w-[4px] h-[4px] rounded-full bg-[#677876]"></div>
    <div class="">{shortcut.note}</div>
  </div>
</button>
