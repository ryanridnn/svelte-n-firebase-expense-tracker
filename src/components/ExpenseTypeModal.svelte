<script lang="ts">
  import Modal from "@/components/Modal.svelte";
  import CurrencyInput from "@/components/CurrencyInput.svelte";
  import { expenseTypeModalState } from "@/stores/modals";
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { createNewExpenseType } from "@/firebase/expenseTypes";
  import { globalExpenseTypes } from "@/stores/expenseType";

  let open: boolean = false;

  let name: string = "";
  let limit: number = 0;

  $: (() => {
    if ($expenseTypeModalState) {
      open = true;
    } else {
      open = false;
    }
  })();

  const closeModal = () => {
    open = false;
  };

  const onNameChange = (e: any) => {
    name = e.target.value;
  };

  const onLimitChange = (e: number) => {
    limit = e;
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
      }
    }
  };
</script>

<Modal {open} {closeModal}>
  <span class="font-bold text-xl" slot="header">Add Expense Type</span>
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
      >Add Expense Type</button
    >
  </div>
</Modal>
