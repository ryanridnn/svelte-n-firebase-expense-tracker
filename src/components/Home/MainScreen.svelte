<script lang="ts">
  import Tabs from "@/components/Home/Tabs.svelte";
  import { formatRupiah, numToFixed } from "@/helpers";
  import { monthYear } from "@/stores/monthYear";
  import { hideAmount, toggleHideAmount } from "@/stores/hideAmount";
  import { Icon, Eye, EyeSlash } from "svelte-hero-icons";
  import BannerMenu from "./BannerMenu.svelte";

  $: amount = formatRupiah($monthYear?.amount || 0, $hideAmount);
  $: limit = (() => {
    if (!$monthYear || $monthYear?.limit === 0) {
      return "-";
    } else {
      return numToFixed(($monthYear?.amount / $monthYear?.limit) * 100, 1);
    }
  })();

  $: notExist = $monthYear && $monthYear.notExist;
</script>

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
      <div class="flex justfiy-start mt-3">
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
