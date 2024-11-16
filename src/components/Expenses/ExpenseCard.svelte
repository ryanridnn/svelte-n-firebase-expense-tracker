<script lang="ts">
  import type { Expense } from "@/types";
  import { formatRupiah } from "@/helpers";
  import { Icon, ArrowLongRight } from "svelte-hero-icons";
  import { expenseModalState } from "@/stores/modals";
  import { hideAmount } from "@/stores/hideAmount";

  export let expense: Expense;

  const onClick = () => {
    expenseModalState.set({
      type: "edit",
      init: expense,
    });
  };
</script>

<button
  on:click={onClick}
  class="px-4 py-4 main-gradient rounded-lg hover:scale-[.96] transition duration-200"
>
  <div class="flex justify-between items-center font-bold text-lg uppercase">
    <span>
      {formatRupiah(expense.amount, $hideAmount)}
    </span>
    <div>
      <Icon src={ArrowLongRight} size="20" />
    </div>
  </div>
  <div
    class="flex items-center gap-2 mt-1 text-xs font-semibold text-app-text-grey-100"
  >
    <div class="">
      {expense.expenseType ? expense.expenseType.name : expense.type}
    </div>
    <div class="w-[4px] h-[4px] rounded-full bg-[#677876]"></div>
    <div class="">{expense.note}</div>
  </div>
</button>
