<script lang="ts">
  import moment from "moment";

  // components
  import Modal from "@/components/Common/Modal.svelte";
  import LoadingButton from "@/components/Common/LoadingButton.svelte";
  import ErrorAlert from "@/components/Common/ErrorAlert.svelte";
  import ExpenseForm from "./ExpenseForm.svelte";

  // stores
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { expenseModalState, type ExpenseModalState } from "@/stores/modals";

  // firebase
  import {
    createNewExpense,
    deleteExpense,
    editExpense,
  } from "@/firebase/expenses";

  // hooks
  import { useError } from "@/hooks/error";

  // helpers
  import {
    validateChange,
    getModalMode,
    reflectDeletedExpense,
    reflectEditedExpense,
  } from "@/components/Expenses/helpers";
  import { onMount } from "svelte";
  import { useExpenseStates } from "@/hooks/useExpenseStates";
  import { Camera, Icon } from "svelte-hero-icons";
  import { scanImage } from "@/ai";
  import { globalExpenseTypes } from "@/stores/expenseType";

  let open: boolean = false;

  let inputRef: HTMLInputElement;

  const expense = useExpenseStates();
  let refreshExpensesDepedency: string | null = null;

  let currencyInputWrapperRef: HTMLElement | null = null;

  let loading: boolean = false;
  let addingOrEditing: boolean = false;
  let deleting: boolean = false;

  const { error, setError, clearError } = useError();

  const closeModal = () => {
    expenseModalState.set(false);
  };

  const onModalStateChanged = (state: ExpenseModalState | false) => {
    if (state) {
      refreshExpensesDepedency = new Date().toISOString();
      open = true;
    } else {
      open = false;
      clearError();
      clearValues();
    }

    if (state && state.type === "add" && state.shortcut) {
      expense.set({
        amount: state.shortcut.amount,
        note: state.shortcut.note,
        type: state.shortcut.type,
        items: state.shortcut.items || [],
      });
    }

    if (state && state.type === "edit" && state.init) {
      expense.set({
        ...state.init,
        items: state.init.items || [],
      });
    }
  };

  $: onModalStateChanged($expenseModalState);

  const clearValues = () => {
    expense.set({
      amount: 0,
      note: "",
      type: "",
      items: [],
    });
    loading = false;
  };

  const onPhotoButtonClick = () => {
    inputRef.click();
  };

  const onSubmit = async () => {
    if (
      $expense.amount &&
      $expense.type &&
      $expenseModalState &&
      $monthYear &&
      $user
    ) {
      const payload = {
        amount: $expense.amount,
        note: $expense.note,
        type: $expense.type,
        normalizedDate: moment().format("DD/MM/YYYY"),
        items: $expense.items,
      };

      if ($expenseModalState.type === "add") {
        loading = true;
        addingOrEditing = true;
        await createNewExpense($user.id, $monthYear.id, payload);
        monthYear.update((prev) => {
          if (prev) {
            return {
              ...prev,
              amount: prev.amount + $expense.amount,
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
          amount: $expense.amount,
          note: $expense.note,
          type: $expense.type,
          items: $expense.items,
        });
        if (changed.overall) {
          loading = true;
          addingOrEditing = true;
          const editExpensePayload = {
            id: $expenseModalState.init.id,
            amount: $expense.amount,
            note: $expense.note,
            type: $expense.type,
            items: $expense.items,
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

  onMount(() => {
    const cb = (e: KeyboardEvent) => {
      if (e.altKey && e.code === "KeyI") {
        expenseModalState.set({
          type: "add",
        });

        setTimeout(() => {
          if (currencyInputWrapperRef) {
            const input: HTMLInputElement | null =
              currencyInputWrapperRef.querySelector(".currency-input");

            if (input && input.focus) {
              input.focus();
            }
          }
        }, 100);
      }
    };

    document.addEventListener("keydown", cb);

    return () => {
      document.removeEventListener("keydown", cb);
    };
  });

  let loading_ai = false;

  $: expenseTypes = $globalExpenseTypes;

  const onFileChange = async (
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) => {
    const files = e.currentTarget.files;

    if (files) {
      const file = files[0];

      loading_ai = true;
      try {
        const resp = await scanImage(file);

        let expenseType = "";
        const personal = expenseTypes.find(
          (each) => each.name.toLowerCase() === "personal",
        );

        if (personal) {
          expenseType = personal.id;
        } else if (expenseTypes[0]) {
          expenseType = expenseTypes[0].id;
        }

        expense.set({
          amount: resp.expense,
          note: resp.note,
          items: resp.items || [],
          type: expenseType,
        });
      } catch (e) {}
    }

    loading_ai = false;
    if (e.target) {
      // @ts-ignore
      e.target.value = "";
    }
  };
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header"
    >{modalMode === "edit" ? "Edit Expense" : "Add Expense"}</span
  >
  <div slot="actions">
    <button
      class="rounded-full bg-white bg-opacity-10 active:bg-opacity-20 transition flex justify-center items-center size-9"
      on:click={onPhotoButtonClick}
    >
      {#if loading_ai}
        <span class="loader"></span>
      {:else}
        <Icon src={Camera} size="20" />
      {/if}
    </button>
    <input
      type="file"
      accept="image/*"
      class="hidden"
      bind:this={inputRef}
      on:change={onFileChange}
    />
  </div>
  <div class="mt-4 font-medium">
    <ErrorAlert error={$error} addMarginBottom />
    <ExpenseForm
      {expense}
      {refreshExpensesDepedency}
      bind:currencyInputWrapperRef
    />
    <LoadingButton
      class="btn btn-primary w-full rounded-md mt-6"
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
