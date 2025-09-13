<script lang="ts">
  import ExpensesScreen from "@/components/Expenses/ExpensesScreen.svelte";
  import ExpenseTypesScreen from "@/components/ExpenseTypes/ExpenseTypesScreen.svelte";
  import { getExpenses } from "@/firebase/expenses";
  import { monthYear } from "@/stores/monthYear";
  import { user } from "@/stores/user";
  import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";

  import { expenses } from "@/stores/expenses";
  import { screenLoadingState } from "@/stores/pageState";
  import { onMount } from "svelte";
  import { getMonthlyExpenseTypes } from "@/firebase/monthlyExpenseTypes";

  enum View {
    Expenses = "expenses",
    ExpenseTypes = "expenseTypes",
  }

  let monthlyExpenseTypesLoaded: boolean = false;

  onMount(async () => {
    if ($user && $monthYear) {
      const retrievedMonthlyExpenseTypes = await getMonthlyExpenseTypes(
        $user.id,
        $monthYear.id,
      );

      monthlyExpenseTypes.set(retrievedMonthlyExpenseTypes);
      monthlyExpenseTypesLoaded = true;
    }
  });

  let selected: View = View.Expenses;

  $: {
    if (
      $user &&
      $monthYear &&
      monthlyExpenseTypesLoaded &&
      selected === View.Expenses
    ) {
      screenLoadingState.set(true);
      getExpenses($user.id, $monthYear.id, $monthlyExpenseTypes).then(
        (retrievedExpenses) => {
          screenLoadingState.set(false);
          console.log(retrievedExpenses)
          expenses.set(retrievedExpenses);
        },
      );
    }
  }

  $: {
    if ($user && $monthYear && selected === View.ExpenseTypes) {
      screenLoadingState.set(true);
      getMonthlyExpenseTypes($user.id, $monthYear.id).then(
        (retrievedMonthlyExpenseTypes) => {
          screenLoadingState.set(false);
          monthlyExpenseTypes.set(retrievedMonthlyExpenseTypes);
        },
      );
    }
  }
</script>

<div class="">
  <div class="flex w-full bg-app-bg-600 rounded-md">
    <button
      on:click={() => {
        selected = View.Expenses;
      }}
      disabled={selected === View.Expenses}
      class="flex-1 btn !rounded-md {selected === View.Expenses
        ? 'btn-primary'
        : ''}">Expenses</button
    >
    <button
      on:click={() => {
        selected = View.ExpenseTypes;
      }}
      disabled={selected === View.ExpenseTypes}
      class="flex-1 btn !rounded-md {selected === View.ExpenseTypes
        ? 'btn-primary'
        : ''}">Per Expense Type</button
    >
  </div>

  {#if selected === View.Expenses}
    <ExpensesScreen />
  {:else if selected === View.ExpenseTypes}
    <ExpenseTypesScreen />
  {/if}
</div>
