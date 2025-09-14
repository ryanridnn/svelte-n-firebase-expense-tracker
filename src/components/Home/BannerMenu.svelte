<script lang="ts">
  import { Icon, EllipsisVertical, Wrench } from "svelte-hero-icons";
  import { useNavigate } from "svelte-navigator";

  const navigate = useNavigate();

  let open = false;
</script>

<div class="relative">
  <button
    class="rounded-full bg-white bg-opacity-10 active:bg-opacity-20 transition p-2"
    on:click={() => (open = !open)}
  >
    <Icon src={EllipsisVertical} class="size-5" />
  </button>

  <div
    class="absolute -bottom-2 translate-y-full right-0 rounded-xl overflow-hidden bg-app-bg-100 {open
      ? 'opacity-1 pointer-events-all'
      : 'opacity-0 pointer-events-none'}"
  >
    <div
      class="bg-white bg-opacity-10 px-4 py-3 border-[1px] border-solid border-app-input-outline-normal rounded-xl text-sm"
    >
      <button
        class="flex items-center gap-2"
        on:click={() => navigate("/shortcuts")}
      >
        <Icon src={Wrench} class="size-4" />
        <span>Shortcuts</span>
      </button>
    </div>
  </div>
</div>
