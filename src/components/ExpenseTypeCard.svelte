<script lang="ts">
  import { formatRupiah, numToFixed } from "@/helpers";
  import type { MonthlyExpenseType } from "@/types";
  import { Icon, ArrowLongRight } from "svelte-hero-icons";

  export let monthlyExpenseType: MonthlyExpenseType;

  const getBarBg = (percentage: number) => {
    if (percentage <= 75) {
      return "bg-app-theme-green";
    } else if (percentage < 100) {
      return "bg-app-theme-yellow";
    } else {
      return "bg-app-theme-red";
    }
  };

  $: percentage = numToFixed(
    (monthlyExpenseType.amount / monthlyExpenseType.limit) * 100,
    2,
  );
  $: barBg = getBarBg(percentage);
  $: lineBg = percentage >= 100 ? "danger" : "primary";
</script>

<div class="px-4 py-3 main-gradient rounded-lg">
  <div class="flex items-center justify-between font-bold text-lg">
    <span>
      {monthlyExpenseType.name}
    </span>
    <div>
      <Icon src={ArrowLongRight} size="20" />
    </div>
  </div>
  <div
    class="mt-3 rounded-full h-[4px] w-full {lineBg === 'danger'
      ? 'bg-app-theme-red-accent'
      : 'bg-app-bg-500'}"
  >
    <div
      class="w-full h-full rounded-full {barBg}"
      style="width: {percentage > 100
        ? `${1 / percentage}%`
        : `${percentage}%`}"
    ></div>
  </div>
  <div
    class="text-xs mt-3 font-semibold flex justify-between items-center text-app-text-grey-100"
  >
    <div>
      {percentage}%
    </div>
    <div>
      {formatRupiah(monthlyExpenseType.amount)} out of {formatRupiah(
        monthlyExpenseType.limit,
      )}
    </div>
  </div>
</div>
