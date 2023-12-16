<script lang="ts">
  import moment from "moment";

  // components
  import Modal from "@/components/Common/Modal.svelte";
  import CurrencyInput from "@/components/Common/CurrencyInput.svelte";
  import LoadingButton from "@/components/Common/LoadingButton.svelte";
  import ErrorAlert from "@/components/Common/ErrorAlert.svelte";

  // stores
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { expenseModalState } from "@/stores/modals";
  import { globalExpenseTypes } from "@/stores/expenseType";

  // firebase
  import { getExpenseTypes } from "@/firebase/expenseTypes";
  import {
    createNewExpense,
    deleteExpense,
    editExpense,
  } from "@/firebase/expenses";

  // types
  import type { ExpenseType } from "@/types";

  // hooks
  import { useError } from "@/hooks/error";

  // helpers
  import {
    validateChange,
    getModalMode,
    reflectDeletedExpense,
    reflectEditedExpense,
  } from "@/components/Expenses/helpers";

  let open: boolean = false;
  let typeOptions: ExpenseType[] = [];

  let amount: number = 0;
  let note: string = "";
  let type: string = "";
  let loading: boolean = false;
  let addingOrEditing: boolean = false;
  let deleting: boolean = false;

  const { error, setError, clearError } = useError();

  const closeModal = () => {
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
      clearError();
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
    loading = false;
  };

  const onAmountChange = (e: number) => {
    amount = e;
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
        const changed = validateChange({
          expenseModalState: $expenseModalState,
          amount,
          note,
          type,
        });
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
          setError("Please change something to edit!");
        }
      }
    } else {
      setError("Make sure to enter some values!");
    }
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
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header"
    >{modalMode === "edit" ? "Edit Expense" : "Add Expense"}</span
  >
  <div class="mt-4 font-medium">
    <ErrorAlert error={$error} addMarginBottom />
    <div class="flex flex-col gap-3">
      <div class="flex flex-col gap-2">
        <label for="expense-nominal">Amount</label>
        <CurrencyInput value={amount} onValueChange={onAmountChange} />
      </div>
      <div class="flex flex-col gap-2">
        <label for="expense-note">Note</label>
        <input type="text" class="input" bind:value={note} id="expense-note" />
      </div>
      <div class="flex flex-col gap-2">
        <label for="expense-type">Type</label>
        {#if typeOptions.length > 0}
          <select class="input" bind:value={type}>
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
