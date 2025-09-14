<script lang="ts">
  import Items from "@/components/Expenses/Items.svelte";
  import CurrencyInput from "@/components/Common/CurrencyInput.svelte";
  import { type Writable } from "svelte/store";
  import { type ExpenseState } from "@/hooks/useExpenseStates";

  import { globalExpenseTypes } from "@/stores/expenseType";

  // firebase
  import { getExpenseTypes } from "@/firebase/expenseTypes";

  // types
  import type { ExpenseType } from "@/types";

  const fetchTypeOptions = async () => {
    if ($user) {
      const types = await getExpenseTypes($user.id);

      globalExpenseTypes.set(types);
      typeOptions = types;
    }
  };

  let typeOptions: ExpenseType[] = [];

  // stores
  import { user } from "@/stores/user";

  import type { ChangeEventHandler } from "svelte/elements";

  export let expense: Writable<ExpenseState>;
  export let refreshExpensesDepedency: string | null;

  export let currencyInputWrapperRef: HTMLElement | null = null;

  const onAmountChange = (newAmount: number) => {
    expense.update((prev) => ({
      ...prev,
      amount: newAmount,
    }));
  };

  const updateExpense = <T extends keyof ExpenseState>(
    key: T,
    value: ExpenseState[T],
  ) => {
    expense.update((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const onNoteChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    updateExpense("note", e.currentTarget.value);
  };

  const onTypeChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    updateExpense("type", e.currentTarget.value);
  };

  const addItem = (item: string) => {
    expense.update((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }));
  };

  const deleteItem = (item: string) => {
    expense.update((prev) => ({
      ...prev,
      items: prev.items.filter((each) => each !== item),
    }));
  };

  const onRefreshed = (dep: string | null) => {
    if (dep) {
      fetchTypeOptions();
    }
  };

  $: onRefreshed(refreshExpensesDepedency);
</script>

<div class="flex flex-col gap-3">
  <div bind:this={currencyInputWrapperRef} class="flex flex-col gap-2">
    <label for="expense-nominal">Amount</label>
    <CurrencyInput value={$expense.amount} onValueChange={onAmountChange} />
  </div>
  <div class="flex flex-col gap-2">
    <label for="expense-note">Note</label>
    <input
      type="text"
      class="input"
      value={$expense.note}
      on:change={onNoteChange}
      id="expense-note"
      name="expense-note"
    />
  </div>
  <div class="flex flex-col gap-2">
    <label for="expense-type">Type</label>
    {#if typeOptions.length > 0}
      <select class="input" value={$expense.type} on:change={onTypeChange}>
        {#each typeOptions as typeOption}
          <option value={typeOption.id}>{typeOption.name}</option>
        {/each}
      </select>
    {/if}
  </div>
  <div class="pt-2">
    <Items items={$expense.items} {addItem} {deleteItem} />
  </div>
</div>
