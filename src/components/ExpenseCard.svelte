<script lang="ts">
  import type { Expense } from "@/types";
  import { formatRupiah } from "@/helpers";
  import { Icon, ArrowLongRight } from "svelte-hero-icons";

  export let expense: Expense;
</script>

<div class="px-4 py-4 main-gradient rounded-lg">
  <div class="flex justify-between items-center font-bold text-lg uppercase">
    <span>
      {formatRupiah(expense.amount)}
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
</div>
