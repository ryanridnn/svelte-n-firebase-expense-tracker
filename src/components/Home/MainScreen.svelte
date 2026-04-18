<script lang="ts">
  import Tabs from "@/components/Home/Tabs.svelte";
  import { formatRupiah, numToFixed } from "@/helpers";
  import { monthYear } from "@/stores/monthYear";
  import { hideAmount, toggleHideAmount } from "@/stores/hideAmount";
  import { Icon, Eye, EyeSlash, Sparkles } from "svelte-hero-icons";
  import BannerMenu from "./BannerMenu.svelte";
  import { scanBulkImage } from "@/ai";
  import toast from "svelte-french-toast";
  import { writable } from "svelte/store";
  import type { ExpenseInput, ExpenseType } from "@/types";
  import Modal from "../Common/Modal.svelte";
  import { v4 } from "uuid";
  import { globalExpenseTypes } from "@/stores/expenseType";
  import ExpenseRow from "../Expenses/ExpenseRow.svelte";
  import LoadingButton from "../Common/LoadingButton.svelte";
  import { user } from "@/stores/user";
  import { getExpenseTypes } from "@/firebase/expenseTypes";
  import { createNewExpenses } from "@/firebase/expenses";

  const fetchTypeOptions = async () => {
    if ($user) {
      const types = await getExpenseTypes($user.id);

      globalExpenseTypes.set(types);

      return types;
    }
  };

  $: amount = formatRupiah($monthYear?.amount || 0, $hideAmount);
  $: limit = (() => {
    if (!$monthYear || $monthYear?.limit === 0) {
      return "-";
    } else {
      return numToFixed(($monthYear?.amount / $monthYear?.limit) * 100, 1);
    }
  })();

  $: notExist = $monthYear && $monthYear.notExist;

  let inputRef: HTMLInputElement;

  const onButtonClick = () => {
    if (inputRef) {
      inputRef.click();
    }
  };

  let show_bulk_modal = false;
  let loading_ai = false;
  let adding = false;

  let expenses = writable<ExpenseInput[]>([]);

  $: glob_expenseTypes = $globalExpenseTypes;

  const onFileChange = async (
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
  ) => {
    const files = e.currentTarget.files;

    if (files && files.length > 0) {
      const file = files[0];
      loading_ai = true;
      show_bulk_modal = true;

      try {
        const resp = await scanBulkImage(file);

        toast.success("Scanned successfully");

        let expenseType = "";

        let expenseTypes: ExpenseType[] = glob_expenseTypes;

        if (glob_expenseTypes.length === 0) {
          const resp = await fetchTypeOptions();

          if (resp) {
            expenseTypes = resp;
          }
        }

        const personal = expenseTypes.find(
          (each) => each.name.toLowerCase() === "personal",
        );

        if (personal) {
          expenseType = personal.id;
        } else if (expenseTypes[0]) {
          expenseType = expenseTypes[0].id;
        }

        expenses.set(
          resp.map((item) => ({
            id: v4(),
            amount: item.expense,
            note: item.note,
            type: expenseType,
          })),
        );
      } catch (e) {
        expenses.set([
          {
            id: v4(),
            amount: 0,
            note: "",
            type: "",
          },
        ]);

        toast.error("Something went wrong");
      }

      loading_ai = false;

      if (e.target) {
        // @ts-ignore
        e.target.value = "";
      }
    } else {
    }
  };

  const onSubmit = async () => {
    if ($expenses.length > 0) {
      adding = true;

      if ($user && $monthYear) {
        const resp = await createNewExpenses(
          $user.id,
          $monthYear.id,
          $expenses.map((expense) => ({
            ...expense,
          })),
        );

        const total = resp.reduce((acc, row) => acc + row.amount, 0);

        monthYear.update((prev) => {
          if (prev) {
            return {
              ...prev,
              amount: prev.amount + total,
            };
          } else {
            return prev;
          }
        });
      }

      adding = false;
      toast.success("Added successfully");
      show_bulk_modal = false;
    } else {
      toast.error("Please add some expenses");
    }
  };
</script>

<Modal
  bind:open={show_bulk_modal}
  closeModal={() => {
    show_bulk_modal = false;
  }}
>
  <span slot="header" class="font-bold text-xl">Scan Bulk</span>
  <div>
    {#if loading_ai}
      <div>Loading...</div>
    {:else}
      <div class="flex flex-col gap-2">
        {#each $expenses as expense, expenseIndex (expense.id)}
          <ExpenseRow {expenses} {expense} index={expenseIndex} />
        {/each}
      </div>

      <LoadingButton
        class="btn btn-primary w-full rounded-md mt-6"
        disabled={adding}
        on:click={onSubmit}
        loading={adding}
      >
        <span slot="normalText">Add</span>
        <span slot="loadingText">Adding...</span>
        <span></span>
      </LoadingButton>
    {/if}
  </div>
</Modal>

<div class="p-5">
  <div class="px-6 py-6 main-gradient rounded-xl mt-2">
    <div class="flex justify-between items-center">
      <div class="font-bold text-3xl uppercase">{notExist ? "-" : amount}</div>
      <BannerMenu />
    </div>

    {#if notExist}
      <div class="font-bold mt-2">No records for this month</div>
    {:else}
      <div class="font-bold mt-2">
        <span class="text-app-theme-yellow"
          >{limit !== "-" ? `${limit} %` : limit}</span
        > used from monthly limit
      </div>
      <div class="text-sm mt-2 font-medium text-app-text-grey-100">
        Used this month
      </div>
      <div class="flex justfiy-start items-center gap-3 mt-3">
        <button
          class="flex items-center gap-1.5 bg-app-theme-yellow text-app-text-dark px-3 py-2 text-sm rounded-lg transition font-medium active:bg-opacity-80"
          on:click={onButtonClick}
        >
          <Icon src={Sparkles} class="size-4" />
          <span> Scan with AI </span>
        </button>
        <input
          type="file"
          bind:this={inputRef}
          on:change={onFileChange}
          class="hidden"
        />
        <button
          on:click={toggleHideAmount}
          class="flex items-center gap-1.5 px-3 py-2 bg-white bg-opacity-10 text-sm text-slate-200 rounded-lg transtion active:bg-opacity-15 font-medium"
        >
          {#if $hideAmount}
            <Icon src={Eye} class="size-4" />
            <span> Show Amount </span>
          {:else}
            <Icon src={EyeSlash} class="size-4" />
            <span> Hide Amount </span>
          {/if}
        </button>
      </div>
    {/if}
  </div>
  <div class="mt-5">
    {#if !notExist}
      <Tabs />
    {/if}
  </div>
</div>
