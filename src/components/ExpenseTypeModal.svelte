<script lang="ts">
  import Modal from "@/components/Modal.svelte";
  import CurrencyInput from "@/components/CurrencyInput.svelte";
  import {
    expenseTypeModalState,
    type ExpenseTypeModalState,
  } from "@/stores/modals";
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { createNewExpenseType } from "@/firebase/expenseTypes";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import {
    editExpenseType,
    type EditExpenseTypePayload,
    type ExpenseTypeChanged,
  } from "@/firebase/monthlyExpenseTypes";
  import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";

  let open: boolean = false;

  let name: string = "";
  let limit: number = 0;

  $: {
    if ($expenseTypeModalState) {
      open = true;

      if ($expenseTypeModalState.init) {
        name = $expenseTypeModalState.init.name;
        limit = $expenseTypeModalState.init.limit;
      }
    } else {
      open = false;

      clearValues();
    }
  }

  const clearValues = () => {
    name = "";
    limit = 0;
  };

  const closeModal = () => {
    expenseTypeModalState.set(false);
  };

  const onNameChange = (e: any) => {
    name = e.target.value;
  };

  const onLimitChange = (e: number) => {
    limit = e;
  };

  const validateChange = () => {
    const changed = {
      overall: false,
      name: false,
      limit: false,
    };

    if (
      $expenseTypeModalState &&
      $expenseTypeModalState.type === "edit" &&
      $expenseTypeModalState.init
    ) {
      const currentExpenseType = $expenseTypeModalState.init;

      if (currentExpenseType.name !== name) {
        changed.name = true;
      }

      if (currentExpenseType.limit !== limit) {
        changed.limit = true;
      }

      changed.overall = changed.name || changed.limit;

      return changed;
    } else {
      return changed;
    }
  };

  const reflectExpenseTypeEdit = (
    newExpenseType: EditExpenseTypePayload,
    changed: ExpenseTypeChanged,
  ) => {
    monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
      return currentMonthlyExpenseTypes.map((each) => {
        if (each.id === newExpenseType.id) {
          return {
            ...each,
            name: newExpenseType.name,
            limit: newExpenseType.limit,
          };
        } else {
          return each;
        }
      });
    });

    if (changed.limit) {
      const diff = newExpenseType.limit - newExpenseType.initLimit;

      monthYear.update((currentMonthYear) => {
        if (currentMonthYear) {
          return {
            ...currentMonthYear,
            limit: currentMonthYear.limit + diff,
          };
        } else {
          return currentMonthYear;
        }
      });
    }
  };

  const onSubmit = async () => {
    if ($user && $monthYear && $expenseTypeModalState && name && limit) {
      const payload = {
        name,
        limit,
        amount: 0,
      };

      if ($expenseTypeModalState.type === "add") {
        const newExpenseType = await createNewExpenseType(
          $user.id,
          $monthYear.id,
          payload,
        );
        globalExpenseTypes.update((prev) => {
          return [...prev, newExpenseType];
        });
        monthYear.update((prev) => {
          if (prev) {
            return {
              ...prev,
              limit: prev.limit + limit,
            };
          } else {
            return prev;
          }
        });
        open = false;
      } else if (
        $expenseTypeModalState.type === "edit" &&
        $expenseTypeModalState.init
      ) {
        const changed = validateChange();

        if (changed.overall) {
          const editExpenseTypePayload = {
            id: $expenseTypeModalState.init.id,
            name,
            limit,
            initLimit: $expenseTypeModalState.init.limit,
          };

          await editExpenseType(
            $user.id,
            $monthYear.id,
            editExpenseTypePayload,
            changed,
          );

          reflectExpenseTypeEdit(editExpenseTypePayload, changed);

          closeModal();
        } else {
        }
      }
    }
  };

  const getModalText = (modalState: ExpenseTypeModalState | false) => {
    if (modalState) {
      if (modalState.type === "add") {
        return "Add Expense Type";
      } else {
        return "Edit Expense Type";
      }
    } else {
      return "Add Expense Type";
    }
  };

  $: modalText = getModalText($expenseTypeModalState);
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header">{modalText}</span>
  <div class="mt-4 font-medium">
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <label for="expense-note">Name</label>
        <input
          type="text"
          class="input"
          value={name}
          on:change={onNameChange}
          id="expense-note"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label for="expense-nominal">Limit</label>
        <CurrencyInput value={limit} onValueChange={onLimitChange} />
      </div>
    </div>
    <button on:click={onSubmit} class="btn btn-primary w-full rounded-md mt-7"
      >{modalText}</button
    >
  </div>
</Modal>
