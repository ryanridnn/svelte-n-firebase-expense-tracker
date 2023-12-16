<script lang="ts">
  import Header from "@/components/Home/Header.svelte";
  import { monthYear } from "@/stores/monthYear";
  import MainScreen from "@/components/Home/MainScreen.svelte";
  import ExpenseModal from "@/components/Expenses/ExpenseModal.svelte";
  import ExpenseTypeModal from "@/components/ExpenseTypes/ExpenseTypeModal.svelte";
</script>

<Header />
{#if $monthYear}
  <MainScreen />
  <ExpenseModal />
  <ExpenseTypeModal />
{/if}
