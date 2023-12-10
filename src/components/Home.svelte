<script lang="ts">
  import Header from "@/components/Header.svelte";
  import { monthYear } from "@/stores/monthYear";
  import MainScreen from "@/components/MainScreen.svelte";
  import ExpenseModal from "@/components/ExpenseModal.svelte";
  import ExpenseTypeModal from "@/components/ExpenseTypeModal.svelte";
</script>

<Header />
{#if $monthYear}
  <MainScreen />
  <ExpenseModal />
  <ExpenseTypeModal />
{/if}
