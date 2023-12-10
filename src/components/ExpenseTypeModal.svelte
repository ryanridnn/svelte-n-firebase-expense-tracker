<script lang="ts">
  import Modal from "@/components/Modal.svelte";
  import CurrencyInput from "@/components/CurrencyInput.svelte";
  import {
    expenseTypeModalState,
    type ExpenseTypeModalState,
  } from "@/stores/modals";
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import {
    createNewExpenseType,
    deleteExpenseType,
  } from "@/firebase/expenseTypes";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import {
    editExpenseType,
    type EditExpenseTypePayload,
    type ExpenseTypeChanged,
  } from "@/firebase/monthlyExpenseTypes";
  import { monthlyExpenseTypes } from "@/stores/monthlyExpenseTypes";
  import type { MonthlyExpenseType } from "@/types";
  import LoadingButton from "@/components/LoadingButton.svelte";
  import ErrorAlert from "@/components/ErrorAlert.svelte";
  import { useError } from "@/hooks/error";

  let open: boolean = false;

  let name: string = "";
  let limit: number = 0;
  let loading: boolean = false;
  let addingOrEditing = false;
  let deleting = false;

  const { error, setError, clearError } = useError();

  $: {
    if ($expenseTypeModalState) {
      open = true;

      if ($expenseTypeModalState.init) {
        name = $expenseTypeModalState.init.name;
        limit = $expenseTypeModalState.init.limit;
      }
    } else {
      open = false;

      clearError();
      clearValues();
    }
  }

  const clearValues = () => {
    name = "";
    limit = 0;
  };

  const closeModal = () => {
    expenseTypeModalState.set(false);
    loading = false;
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
        loading = true;
        addingOrEditing = true;
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
        addingOrEditing = false;
        closeModal();
      } else if (
        $expenseTypeModalState.type === "edit" &&
        $expenseTypeModalState.init
      ) {
        const changed = validateChange();

        if (changed.overall) {
          loading = true;
          addingOrEditing = true;
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

          addingOrEditing = false;
          closeModal();
        } else {
          setError("Please change something to edit!");
        }
      }
    } else {
      setError("Make sure to enter some values!");
    }
  };

  const getModalMode = (modalState: ExpenseTypeModalState | false) => {
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

  const reflectDeletedExpenseType = (
    currentExpenseType: MonthlyExpenseType,
  ) => {
    monthlyExpenseTypes.update((currentMonthlyExpenseTypes) => {
      return currentMonthlyExpenseTypes.filter(
        (each) => each.id !== currentExpenseType.id,
      );
    });

    monthYear.update((currentMonthYear) => {
      if (currentMonthYear) {
        return {
          ...currentMonthYear,
          limit: currentMonthYear.limit - currentExpenseType.limit,
        };
      } else {
        return currentMonthYear;
      }
    });
  };

  const onDelete = async () => {
    if (
      $user &&
      $monthYear &&
      $expenseTypeModalState &&
      $expenseTypeModalState.type === "edit" &&
      $expenseTypeModalState.init
    ) {
      const currentExpenseType = $expenseTypeModalState.init;

      if (currentExpenseType.amount === 0) {
        loading = true;
        deleting = true;
        await deleteExpenseType($user.id, $monthYear.id, currentExpenseType);

        reflectDeletedExpenseType(currentExpenseType);
        deleting = false;
        closeModal();
      }
    }
  };

  $: modalMode = getModalMode($expenseTypeModalState);
  $: showDelete =
    $expenseTypeModalState && $expenseTypeModalState.type === "edit";
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header"
    >{modalMode === "edit" ? "Edit Expense Type" : "Add Expense Type"}</span
  >
  <div class="mt-4 font-medium">
    <ErrorAlert error={$error} addMarginBottom />
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
    <LoadingButton
      loading={addingOrEditing}
      on:click={onSubmit}
      disabled={loading}
      class="btn btn-primary w-full rounded-md mt-7"
    >
      <span slot="normalText"
        >{modalMode === "edit" ? "Edit Expense Type" : "Add Expense Type"}</span
      >
      <span slot="loadingText">
        {modalMode === "edit" ? "Editing..." : "Adding..."}
      </span>
    </LoadingButton>
    {#if showDelete}
      <LoadingButton
        loading={deleting}
        on:click={onDelete}
        disabled={loading}
        class="btn bg-app-theme-red w-full rounded-md mt-4"
      >
        <span slot="normalText">Delete Expense Type</span>
        <span slot="loadingText">Deleting...</span>
      </LoadingButton>
    {/if}
  </div>
</Modal>
