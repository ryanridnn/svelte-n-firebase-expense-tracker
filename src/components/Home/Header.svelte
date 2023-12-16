<script lang="ts">
  import { onMount } from "svelte";
  import { Icon, ArrowRightOnRectangle } from "svelte-hero-icons";
  import moment from "moment";
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { logOut } from "@/firebase/users";
  import { getMonthYear } from "@/firebase/monthYear";
  import MonthYearSelector from "@/components/Home/MonthYearSelector.svelte";
  import { getMonthName } from "@/firebase/helpers";

  let month: number = moment().month();
  let year: number = moment().year();

  $: monthName = getMonthName(month);

  onMount(async () => {
    if ($user) {
      const currentMonthYear = await getMonthYear($user.id, month, year);
      monthYear.set(currentMonthYear);
    }
  });

  let open: boolean = false;

  const toggleSelector = () => {
    open = !open;
  };
</script>

<header class="sticky top-0">
  <div
    on:click={toggleSelector}
    class="relative bg-app-bg-100 flex justify-center items-center px-5 py-5 border-b-[1px] border-b-solid border-[#8E93A8] z-[100]"
  >
    <div
      class="font-bold uppercase transition duration-150 {open
        ? 'opacity-0'
        : ''}"
    >
      {monthName}
      {year}
    </div>
    <div class="absolute top-[50%] right-5 translate-y-[-50%]">
      <button on:click|preventDefault={logOut}>
        <Icon src={ArrowRightOnRectangle} size="24" />
      </button>
    </div>
  </div>
  <MonthYearSelector {open} {toggleSelector} bind:month bind:year />
</header>
