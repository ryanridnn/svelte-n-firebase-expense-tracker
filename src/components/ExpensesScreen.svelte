<script lang="ts">
  import { expenseModalState } from "@/stores/modals";
  import { expenses } from "@/stores/expenses";
  import moment from "moment";
  import ExpenseCard from "@/components/ExpenseCard.svelte";

  const openModal = () => {
    expenseModalState.set({ type: "add" });
  };
</script>

<div class="mt-6 flex flex-col gap-8 pb-20">
  {#each $expenses as group}
    <div class="w-full">
      <div class="flex justify-center w-full mx-auto text-xs font-semibold">
        <div class="px-4 py-2 bg-app-bg-200 rounded-md">
          {moment(group.title, "DD/MM/YYYY").format("DD MMMM YYYY")}
        </div>
      </div>
      <div class="flex flex-col gap-4 mt-5">
        {#each group.list as expense}
          <ExpenseCard {expense} />
        {/each}
      </div>
    </div>
  {/each}
</div>

<div class="fixed bottom-0 left-0 w-full px-6 py-4 bg-app-bg-100">
  <button on:click={openModal} class="btn btn-primary w-full"
    >Add Expense</button
  >
</div>
