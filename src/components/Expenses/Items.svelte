<script lang="ts">
  import { Icon, Plus, Trash, XMark } from "svelte-hero-icons";

  export let items: string[];

  let adding: boolean = false;
  let item: string = "";
  let input: HTMLInputElement;

  const toggleAdding = () => {
    adding = !adding;

    if (adding && input) {
      setTimeout(() => {
        input.focus();
      });
    }
  };

  const onAdd = () => {
    if (items.find((each) => each === item)) return;
    items = [...items, item];
    item = "";

    toggleAdding();
  };

  const onDelete = (selectedItem: string) => {
    items = items.filter((each) => each !== selectedItem);
  };
</script>

<div>
  <div class="flex justify-between items-center">
    <div>Items</div>
    <button
      on:click={toggleAdding}
      class="flex justify-center items-center gap-1 btn-opaque"
    >
      <Icon src={adding ? XMark : Plus} size={adding ? "18" : "16"} />
      <span>{adding ? "Cancel" : "Add Item"}</span>
    </button>
  </div>
  <div class="mt-3 flex flex-col gap-3">
    {#each items as item}
      <div
        class="flex justify-between items-center py-2 px-3 bg-app-bg-800 rounded-md"
      >
        <span>
          {item}
        </span>
        <button
          on:click={() => onDelete(item)}
          class="text-app-theme-red btn-opaque"
        >
          <Icon src={Trash} size="18" solid />
        </button>
      </div>
    {/each}
  </div>
  <div
    class={`relative ${adding ? "" : "hidden"} ${items.length > 0 && "mt-3"}`}
  >
    <input
      bind:this={input}
      type="text"
      class="input w-full !pr-14"
      bind:value={item}
      id="expense-item"
    />
    <button
      class="absolute top-50 translate-y-min-50 right-4 text-app-theme-green font-semibold"
      on:click={onAdd}
    >
      ADD
    </button>
  </div>
</div>
