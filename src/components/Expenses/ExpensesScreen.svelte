<script lang="ts">
  import { expenseModalState } from "@/stores/modals";
  import { expenses } from "@/stores/expenses";
  import { screenLoadingState } from "@/stores/pageState";
  import moment from "moment";
  import ExpenseCard from "@/components/Expenses/ExpenseCard.svelte";
  import { formatRupiah } from "@/helpers";
  import { hideAmount } from "@/stores/hideAmount";

  const openModal = () => {
    expenseModalState.set({ type: "add" });
  };
</script>

<div class="mt-6 flex flex-col gap-8 pb-20">
  {#if !$screenLoadingState}
    {#if $expenses.length > 0}
      {#each $expenses as group}
        <div class="w-full">
          <div class="flex justify-between items-center w-full mx-auto">
            <div class="text-sm font-bold">
              {moment(group.title, "DD/MM/YYYY").format("DD MMMM YYYY")}
            </div>
            <div class="font-medium text-app-text-grey-100 text-sm">
              {formatRupiah(group.total, $hideAmount)}
            </div>
          </div>
          <div class="flex flex-col gap-4 mt-5">
            {#each group.list as expense}
              <ExpenseCard {expense} />
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      <div class="flex justify-center pt-8 text-sm">No Expenses</div>
    {/if}
  {/if}
</div>

<div class="fixed bottom-0 left-0 w-full px-6 py-4 bg-app-bg-100">
  <button on:click={openModal} class="btn btn-primary w-full"
    >Add Expense</button
  >
</div>
