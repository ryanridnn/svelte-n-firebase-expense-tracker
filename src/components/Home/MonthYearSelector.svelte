<script lang="ts">
  import moment from "moment";
  import { ChevronLeft, ChevronRight, Icon } from "svelte-hero-icons";
  import { getMonthName } from "@/firebase/helpers";
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { getMonthYear } from "@/firebase/monthYear";

  export let open: boolean;
  export let toggleSelector: () => void;
  export let month: number = moment().month();
  export let year: number = moment().year();

  const months: string[] = moment.months();

  $: monthName = getMonthName(month);

  const currentMonthYear = {
    month,
    year,
  };

  const closeSelector = () => {
    toggleSelector();
  };

  const fetchMonthYear = async () => {
    if ($user) {
      const currentMonthYear = await getMonthYear($user.id, month, year);
      monthYear.set(currentMonthYear);
    }
  };

  const prev = async (revert?: boolean) => {
    if (monthName === months[0]) {
      month = months.length - 1;
      year -= 1;
    } else {
      month -= 1;
    }

    if (!revert) {
      await fetchMonthYear();
      toggleSelector();
    }
  };

  const next = async (revert?: boolean) => {
    if (monthName === months[months.length - 1]) {
      month = 0;
      year += 1;
    } else {
      month += 1;
    }

    if (!revert) {
      await fetchMonthYear();
      toggleSelector();
    }
  };

  $: isNextDisabled =
    month === currentMonthYear.month && year === currentMonthYear.year;
</script>

<div
  class="absolute w-full flex items-center justify-between px-4 py-4 bg-app-bg-100 z-[99] border-b-[1px] border-b-solid border-[#8E93A8] transition duration-150 {open
    ? 'top-[100%]'
    : 'translate-y-[-100%]'}"
>
  <button on:click={() => prev()}><Icon src={ChevronLeft} size="20" /></button>
  <div class="font-bold uppercase">{monthName} {year}</div>
  <button
    disabled={isNextDisabled}
    class="disabled:text-gray-400"
    on:click={() => next()}><Icon src={ChevronRight} size="20" /></button
  >
</div>

<div
  on:click={closeSelector}
  class="fixed top-0 left-0 w-screen h-screen bg-black {open
    ? 'opacity-[.2] pointer-events-auto z-[10]'
    : 'opacity-[0] pointer-events-none'}"
></div>
