<script lang="ts">
  import { expenseTypeModalState } from "@/stores/modals";
  import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";
  import { screenLoadingState } from "@/stores/pageState";
  import ExpenseTypeCard from "@/components/ExpenseTypes/ExpenseTypeCard.svelte";

  const openModal = () => {
    expenseTypeModalState.set({
      type: "add",
    });
  };
</script>

<div class="flex flex-col gap-4 mt-6 pb-20">
  {#if !$screenLoadingState}
    {#if $monthlyExpenseTypes.length > 0}
      {#each $monthlyExpenseTypes as monthlyExpenseType}
        <ExpenseTypeCard {monthlyExpenseType} />
      {/each}
    {:else}
      <div class="flex justify-center pt-8 text-sm">No Expense Types</div>
    {/if}
  {/if}
</div>
<div class="fixed bottom-0 left-0 w-full px-6 py-4 bg-app-bg-100">
  <button on:click={openModal} class="btn btn-primary w-full"
    >Add Expense Type</button
  >
</div>
