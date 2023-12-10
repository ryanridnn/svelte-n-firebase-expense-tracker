<script lang="ts">
  import Modal from "@/components/Modal.svelte";
  import { expenseModalState } from "@/stores/modals";
  import CurrencyInput from "@/components/CurrencyInput.svelte";
  // import { onMount } from "svelte";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import { getExpenseTypes } from "@/firebase/expenseTypes";
  import { user } from "@/stores/user";
  import type { ExpenseType } from "@/types";
  import moment from "moment";
  import { createNewExpense } from "@/firebase/expenses";
  import { monthYear } from "@/stores/monthYear";

  let open: boolean = false;
  let typeOptions: ExpenseType[] = [];

  let amount: number = 0;
  let note: string = "";
  let type: string = "";

  const closeModal = () => {
    open = false;
  };

  const fetchTypeOptions = async () => {
    if ($user) {
      const types = await getExpenseTypes($user.id);

      globalExpenseTypes.set(types);
      typeOptions = types;
    }
  };

  $: (() => {
    if ($expenseModalState) {
      fetchTypeOptions();
      open = true;
    } else {
      open = false;
    }
  })();

  const onAmountChange = (e: number) => {
    amount = e;
  };

  const onNoteChange = (e: any) => {
    note = e.target.value;
  };

  const onTypeChange = (e: any) => {
    type = e.target.value;
  };

  const onSubmit = async () => {
    if (amount && type && $expenseModalState && $monthYear && $user) {
      const payload = {
        amount,
        note,
        type,
        normalizedDate: moment().format("DD/MM/YYYY"),
      };

      if ($expenseModalState.type === "add") {
        const newExpense = await createNewExpense(
          $user.id,
          $monthYear.id,
          payload,
        );
        monthYear.update((prev) => {
          if (prev) {
            return {
              ...prev,
              amount: prev.amount + amount,
            };
          } else {
            return prev;
          }
        });
        expenseModalState.set(false);
      }
    }
  };
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header">Add Expense</span>
  <div class="mt-4 font-medium">
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <label for="expense-nominal">Amount</label>
        <CurrencyInput value={amount} onValueChange={onAmountChange} />
      </div>
      <div class="flex flex-col gap-2">
        <label for="expense-note">Note</label>
        <input
          type="text"
          class="input"
          value={note}
          on:change={onNoteChange}
          id="expense-note"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="expense-type">Type</label>
        {#if typeOptions.length > 0}
          <select class="input" value={type} on:change={onTypeChange}>
            {#each typeOptions as typeOption}
              <option value={typeOption.id}>{typeOption.name}</option>
            {/each}
          </select>
        {/if}
      </div>
    </div>
    <button on:click={onSubmit} class="btn btn-primary w-full rounded-md mt-7"
      >Add Expense</button
    >
  </div>
</Modal>
