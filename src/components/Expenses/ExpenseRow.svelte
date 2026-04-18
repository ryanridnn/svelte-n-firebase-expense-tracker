<script lang="ts">
  import type { ExpenseInput } from "@/types";
  import CurrencyInput from "../Common/CurrencyInput.svelte";
  import { Icon, Trash } from "svelte-hero-icons";
  import type { Writable } from "svelte/store";

  export let expenses: Writable<ExpenseInput[]>;

  export let expense: ExpenseInput;
  export let index: number;

  const onFieldChange = (field: string, value: any) => {
    expenses.update((prev) => {
      return prev.map((each, i) => {
        if (i === index) {
          return {
            ...each,
            [field]: value,
          };
        } else {
          return each;
        }
      });
    });
  };

  const onDelete = () => {
    expenses.update((prev) => {
      return prev.filter((each, i) => i !== index);
    });
  };
</script>

<div class="flex items-center gap-2">
  <div class="flex-1">
    <input
      type="text"
      value={expense.note}
      on:input={(e) => {
        onFieldChange("note", e.currentTarget.value);
      }}
      class="input w-full"
    />
  </div>

  <div class="flex-1">
    <CurrencyInput
      value={expense.amount}
      onValueChange={(value) => {
        onFieldChange("amount", value);
      }}
    />
  </div>

  <button class="px-2 py-2" on:click={onDelete}>
    <Icon src={Trash} class="size-4 text-app-theme-red" />
  </button>
</div>
