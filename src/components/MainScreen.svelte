<script lang="ts">
  import Tabs from "@/components/Tabs.svelte";
  import { formatRupiah, numToFixed } from "@/helpers";
  import { monthYear } from "@/stores/monthYear";

  const getLimit = () => {
    if (!$monthYear || $monthYear?.limit === 0) {
      return "-";
    } else {
      return numToFixed(($monthYear?.amount / $monthYear?.limit) * 100, 1);
    }
  };

  $: amount = formatRupiah($monthYear?.amount || 0);
  $: limit = (() => {
    if (!$monthYear || $monthYear?.limit === 0) {
      return "-";
    } else {
      return numToFixed(($monthYear?.amount / $monthYear?.limit) * 100, 1);
    }
  })();
</script>

<div class="p-5">
  <div class="px-6 py-6 main-gradient rounded-xl mt-2">
    <div class="font-bold text-3xl uppercase">{amount}</div>
    <div class="font-bold mt-2">
      <span class="text-app-theme-yellow"
        >{limit !== "-" ? `${limit} %` : limit}</span
      > used from monthly limit
    </div>
    <div class="text-sm mt-2 font-medium text-app-text-grey-100">
      Used this month
    </div>
  </div>
  <div class="mt-5">
    <Tabs />
  </div>
</div>
