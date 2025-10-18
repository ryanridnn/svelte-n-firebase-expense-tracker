<script lang="ts">
  import Modal from "../Common/Modal.svelte";
  import LoadingButton from "@/components/Common/LoadingButton.svelte";
  import ExpenseForm from "../Expenses/ExpenseForm.svelte";
  import { shortcutModalState, type ShortcutModalState } from "@/stores/modals";
  import { useExpenseStates } from "@/hooks/useExpenseStates";
  import { user } from "@/stores/user";
  import {
    createNewShortcut,
    updateShortcut,
    deleteShortcut,
  } from "@/firebase/shortcuts";
  import { shortcuts } from "@/stores/shortcuts";

  // hooks
  import { useError } from "@/hooks/error";
  import ErrorAlert from "../Common/ErrorAlert.svelte";
  import type { Shortcut } from "@/types";
  import { globalExpenseTypes } from "@/stores/expenseType";

  $: mode = getMode($shortcutModalState);
  const { error, setError, clearError } = useError();

  let name: string = "";
  const expense = useExpenseStates();
  let refreshExpensesDepedency: string | null = new Date().toISOString();
  let currencyInputWrapperRef: HTMLElement | null = null;

  let addingOrEditing = false;
  let deleting = false;

  const getMode = (state: ShortcutModalState | false) => {
    if (state) {
      return state.type;
    } else {
      return false;
    }
  };

  let loading = false;

  const addToList = (shortcut: Shortcut) => {
    shortcuts.update((prev) => {
      const match = $globalExpenseTypes.find(
        (expenseType) => expenseType.id === shortcut.type,
      );

      const new_shortcut = {
        ...shortcut,
        expenseType: match,
      };

      const list = [...prev.list, new_shortcut];

      return {
        list,
        loading: false,
      };
    });
  };

  const editFromList = (
    shortcutId: string,
    payload: Omit<Shortcut, "id" | "createdAt" | "updatedAt">,
  ) => {
    shortcuts.update((prev) => {
      const list = [...prev.list].map((s) => {
        if (s.id === shortcutId) {
          return {
            ...s,
            ...payload,
          };
        } else {
          return s;
        }
      });

      return {
        list,
        loading: false,
      };
    });
  };

  const removeFromList = (shortcutId: string) => {
    shortcuts.update((prev) => {
      const list = prev.list.filter((shortcut) => shortcut.id !== shortcutId);

      return {
        loading: false,
        list,
      };
    });
  };

  const onSubmit = async () => {
    if (name && $expense.amount && $expense.type && $user && $expense.note) {
      if (mode === "add") {
        const payload = {
          name,
          amount: $expense.amount,
          note: $expense.note,
          type: $expense.type,
          items: $expense.items,
        };

        const newShortcut = await createNewShortcut($user.id, payload);
        addToList(newShortcut);
      } else if (
        mode === "edit" &&
        $shortcutModalState &&
        $shortcutModalState.init
      ) {
        const id = $shortcutModalState.init.id;
        const payload = {
          name,
          amount: $expense.amount,
          note: $expense.note,
          type: $expense.type,
          items: $expense.items,
        };

        await updateShortcut($user.id, id, payload);
        editFromList(id, payload);
      }

      closeAndReset();
    } else {
      setError("Make sure to enter some values!");
    }
  };

  const onDelete = async () => {
    if ($user && $shortcutModalState && $shortcutModalState.init?.id) {
      try {
        await deleteShortcut($user.id, $shortcutModalState.init.id);
        removeFromList($shortcutModalState.init.id);

        closeAndReset();
      } catch (e) {}
    } else {
    }
  };

  const closeAndReset = () => {
    shortcutModalState.set(false);

    name = "";

    expense.set({
      amount: 0,
      note: "",
      type: "",
      items: [],
    });
  };

  $: onModalChanged($shortcutModalState);

  const onModalChanged = (state: ShortcutModalState | false) => {
    if (state) {
      if (state.type === "edit" && state.init) {
        name = state.init.name;
        expense.set({
          amount: state.init.amount,
          note: state.init.note,
          type: state.init.type,
          items: state.init.items || [],
        });
      }
    } else {
      closeAndReset();
    }
  };
</script>

<Modal open={Boolean(mode)} closeModal={() => (mode = false)}>
  <span class="font-bold text-xl" slot="header"
    >{mode === "edit" ? "Edit Shortcut" : "Add Shortcut"}</span
  >
  <div class="mt-4 font-medium">
    <ErrorAlert error={$error} addMarginBottom />
    <div class="flex flex-col gap-2 mb-3">
      <label for="expense-note">Shortcut Name</label>
      <input
        type="text"
        class="input"
        value={name}
        on:change={(e) => (name = e.currentTarget.value)}
        id="expense-name"
        name="expense-name"
      />
    </div>
    <ExpenseForm
      {expense}
      {refreshExpensesDepedency}
      bind:currencyInputWrapperRef
    />
  </div>

  <LoadingButton
    class="btn btn-primary w-full rounded-md mt-6"
    disabled={addingOrEditing}
    on:click={onSubmit}
    {loading}
  >
    <span slot="normalText"
      >{mode === "edit" ? "Edit Shortcut" : "Add Shortcut"}</span
    >
    <span slot="loadingText"
      >{mode === "edit" ? "Editing..." : "Adding..."}</span
    >
  </LoadingButton>
  {#if mode === "edit"}
    <LoadingButton
      class="btn bg-app-theme-red w-full rounded-md mt-4"
      disabled={deleting}
      on:click={onDelete}
      {loading}
    >
      <span slot="normalText">Delete Shortcut</span>
      <span slot="loadingText">Deleting</span>
    </LoadingButton>
  {/if}
</Modal>
