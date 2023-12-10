<script lang="ts">
  import Modal from "@/components/Modal.svelte";
  import { expenseModalState, type ExpenseModalState } from "@/stores/modals";
  import CurrencyInput from "@/components/CurrencyInput.svelte";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import { getExpenseTypes } from "@/firebase/expenseTypes";
  import { user } from "@/stores/user";
  import type { ExpenseType } from "@/types";
  import moment from "moment";
  import {
    createNewExpense,
    editExpense,
    type EditExpensePayload,
    type ExpenseChanged,
  } from "@/firebase/expenses";
  import { monthYear } from "@/stores/monthYear";
  import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";

  let open: boolean = false;
  let typeOptions: ExpenseType[] = [];

  let amount: number = 0;
  let note: string = "";
  let type: string = "";

  const closeModal = () => {
    // open = false;
    expenseModalState.set(false);
  };

  const fetchTypeOptions = async () => {
    if ($user) {
      const types = await getExpenseTypes($user.id);

      globalExpenseTypes.set(types);
      typeOptions = types;
    }
  };

  $: {
    if ($expenseModalState) {
      fetchTypeOptions();
      open = true;
    } else {
      open = false;
      clearValues();
    }

    if (
      $expenseModalState &&
      $expenseModalState.type === "edit" &&
      $expenseModalState.init
    ) {
      amount = $expenseModalState.init.amount;
      note = $expenseModalState.init.note;
      type = $expenseModalState.init.type;
    }
  }

  const clearValues = () => {
    amount = 0;
    note = "";
    type = "";
  };

  const onAmountChange = (e: number) => {
    amount = e;
  };

  const onNoteChange = (e: any) => {
    note = e.target.value;
  };

  const onTypeChange = (e: any) => {
    type = e.target.value;
  };

  const validateChange = () => {
    const changed: ExpenseChanged = {
      amount: false,
      note: false,
      type: false,
      overall: false,
    };

    if (
      $expenseModalState &&
      $expenseModalState.type === "edit" &&
      $expenseModalState.init
    ) {
      const currentExpense = $expenseModalState.init;

      if (amount !== currentExpense.amount) {
        changed.amount = true;
      }

      if (note !== currentExpense.note) {
        changed.note = true;
      }

      if (type !== currentExpense.type) {
        changed.type = true;
      }

      changed.overall = changed.amount || changed.note || changed.type;

      return changed;
    } else {
      return changed;
    }
  };

  const reflectEdited = (
    newExpense: EditExpensePayload,
    changed: ExpenseChanged,
  ) => {
    if (changed.amount) {
      const diff = newExpense.amount - newExpense.initAmount;

      monthYear.update((currentMonthYear) => {
        if (currentMonthYear) {
          return {
            ...currentMonthYear,
            amount: currentMonthYear.amount + diff,
          };
        } else {
          return currentMonthYear;
        }
      });
    }

    if (changed.type) {
      monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
        return currentMonthlyExpenseTypes.map((each) => {
          if (each.id === newExpense.initType) {
            return {
              ...each,
              amount: each.amount - 1 * newExpense.initAmount,
            };
          } else if (each.id === newExpense.type) {
            return {
              ...each,
              amount: each.amount + newExpense.amount,
            };
          } else {
            return each;
          }
        });
      });
    } else if (changed.amount) {
      const diff = newExpense.amount - newExpense.initAmount;
      monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
        return currentMonthlyExpenseTypes.map((each) => {
          if (each.id == newExpense.type) {
            return {
              ...each,
              amount: each.amount + diff,
            };
          } else {
            return each;
          }
        });
      });
    }
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
      } else if (
        $expenseModalState.type === "edit" &&
        $expenseModalState.init
      ) {
        const changed = validateChange();
        if (changed.overall) {
          const editExpensePayload = {
            id: $expenseModalState.init.id,
            amount,
            note,
            type,
            initAmount: $expenseModalState.init.amount,
            initType: $expenseModalState.init.type,
          };

          await editExpense(
            $user.id,
            $monthYear.id,
            editExpensePayload,
            changed,
          );

          reflectEdited(editExpensePayload, changed);
          closeModal();
        } else {
        }
      }
    }
  };

  const getModalText = (modalState: ExpenseModalState | false) => {
    if (modalState) {
      if (modalState.type === "add") {
        return "Add Expense";
      } else {
        return "Edit Expense";
      }
    } else {
      return "Add Expense";
    }
  };

  $: modalText = getModalText($expenseModalState);
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header">{modalText}</span>
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
      >{modalText}</button
    >
  </div>
</Modal>
