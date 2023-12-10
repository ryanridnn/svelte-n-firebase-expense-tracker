<script lang="ts">
  import Modal from "@/components/Modal.svelte";
  import { expenseModalState, type ExpenseModalState } from "@/stores/modals";
  import CurrencyInput from "@/components/CurrencyInput.svelte";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import { getExpenseTypes } from "@/firebase/expenseTypes";
  import { user } from "@/stores/user";
  import type { Expense, ExpenseType } from "@/types";
  import moment from "moment";
  import {
    createNewExpense,
    deleteExpense,
    editExpense,
    type EditExpensePayload,
    type ExpenseChanged,
  } from "@/firebase/expenses";
  import { monthYear } from "@/stores/monthYear";
  import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";
  import { expenses } from "@/stores/expenses";
  import LoadingButton from "@/components/LoadingButton.svelte";

  let open: boolean = false;
  let typeOptions: ExpenseType[] = [];

  let amount: number = 0;
  let note: string = "";
  let type: string = "";
  let loading: boolean = false;
  let addingOrEditing: boolean = false;
  let deleting: boolean = false;

  const closeModal = () => {
    // open = false;
    expenseModalState.set(false);
    loading = false;
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

  const reflectEditedExpense = (
    newExpense: EditExpensePayload,
    changed: ExpenseChanged,
    date: string,
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

    expenses.update((currentGroupedExpensesArr) => {
      return currentGroupedExpensesArr.map((eachGroup) => {
        if (eachGroup.title === date) {
          return {
            ...eachGroup,
            list: eachGroup.list.map((eachExpense) => {
              if (eachExpense.id === newExpense.id) {
                return {
                  ...eachExpense,
                  amount: newExpense.amount,
                  note: newExpense.note,
                  type: newExpense.type,
                };
              } else {
                return eachExpense;
              }
            }),
          };
        } else {
          return eachGroup;
        }
      });
    });
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
        loading = true;
        addingOrEditing = true;
        await createNewExpense($user.id, $monthYear.id, payload);
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
        addingOrEditing = false;
        closeModal();
      } else if (
        $expenseModalState.type === "edit" &&
        $expenseModalState.init
      ) {
        const changed = validateChange();
        if (changed.overall) {
          loading = true;
          addingOrEditing = true;
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

          reflectEditedExpense(
            editExpensePayload,
            changed,
            $expenseModalState.init.normalizedDate,
          );
          addingOrEditing = false;
          closeModal();
        } else {
        }
      }
    }
  };

  const getModalMode = (modalState: ExpenseModalState | false) => {
    if (modalState) {
      if (modalState.type === "add") {
        return "add";
      } else {
        return "edit";
      }
    } else {
      return "add";
    }
  };

  const reflectDeletedExpense = (currentExpense: Expense) => {
    monthYear.update((currentMonthYear) => {
      if (currentMonthYear) {
        return {
          ...currentMonthYear,
          amount: currentMonthYear.amount - currentExpense.amount,
        };
      } else {
        return currentMonthYear;
      }
    });

    monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
      return currentMonthlyExpenseTypes.map((monthlyExpenseType) => {
        if (monthlyExpenseType.id === currentExpense.id) {
          return {
            ...monthlyExpenseType,
            amount: monthlyExpenseType.amount - currentExpense.amount,
          };
        } else {
          return monthlyExpenseType;
        }
      });
    });

    expenses.update((currentGroupedExpensesArr) => {
      return currentGroupedExpensesArr.map((eachGroup) => {
        if (eachGroup.title === currentExpense.normalizedDate) {
          return {
            ...eachGroup,
            list: eachGroup.list.filter(
              (eachExpense) => eachExpense.id !== currentExpense.id,
            ),
          };
        } else {
          return eachGroup;
        }
      });
    });
  };

  const onDelete = async () => {
    if (
      $user &&
      $monthYear &&
      $expenseModalState &&
      $expenseModalState.type === "edit" &&
      $expenseModalState.init
    ) {
      loading = true;
      deleting = true;
      const currentExpense = $expenseModalState.init;

      await deleteExpense($user.id, $monthYear.id, currentExpense);

      reflectDeletedExpense(currentExpense);

      deleting = false;
      closeModal();
    }
  };

  $: modalMode = getModalMode($expenseModalState);
  $: showDelete = $expenseModalState && $expenseModalState.type === "edit";
  $: console.log(loading);
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header"
    >{modalMode === "edit" ? "Edit Expense" : "Add Expense"}</span
  >
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
    <LoadingButton
      class="btn btn-primary w-full rounded-md mt-7"
      disabled={loading}
      on:click={onSubmit}
      loading={addingOrEditing}
    >
      <span slot="normalText"
        >{modalMode === "edit" ? "Edit Expense" : "Add Expense"}</span
      >
      <span slot="loadingText"
        >{modalMode === "edit" ? "Editing..." : "Adding..."}</span
      >
    </LoadingButton>
    {#if showDelete}
      <LoadingButton
        loading={deleting}
        on:click={onDelete}
        disabled={loading}
        class="btn bg-app-theme-red w-full rounded-md mt-4"
      >
        <span slot="normalText">Delete Expense</span>
        <span slot="loadingText">Deleting...</span>
      </LoadingButton>
    {/if}
  </div>
</Modal>
