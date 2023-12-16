<script lang="ts">
  import { onMount } from "svelte";
  import { Icon, ArrowRightOnRectangle } from "svelte-hero-icons";
  import moment from "moment";
  import { user } from "@/stores/user";
  import { monthYear } from "@/stores/monthYear";
  import { logOut } from "@/firebase/users";
  import { getMonthYear } from "@/firebase/monthYear";

  onMount(async () => {
    const monthYearId = moment().format("MMM-YYYY").toLowerCase();

    if ($user) {
      const currentMonthYear = await getMonthYear($user.id, monthYearId);
      monthYear.set(currentMonthYear);
    }
  });
</script>

<header
  class="bg-app-bg-100 flex justify-center items-center sticky top-0 px-5 py-5 border-b-[1px] border-b-solid border-[#8E93A8]"
>
  <div class="font-bold">DECEMBER</div>
  <div class="absolute top-[50%] right-5 translate-y-[-50%]">
    <button on:click={logOut}>
      <Icon src={ArrowRightOnRectangle} size="24" />
    </button>
  </div>
</header>
