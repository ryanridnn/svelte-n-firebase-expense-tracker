<script lang="ts">
  import { auth } from "@/firebase/";
  import { useNavigate } from "svelte-navigator";
  import { onMount, onDestroy } from "svelte";
  import { onAuthStateChanged } from "firebase/auth";
  import type { Unsubscribe } from "firebase/firestore";
  import { user, userLoaded } from "@/stores/user";
  import type { User } from "@/types";

  const navigate = useNavigate();

  let unsub: Unsubscribe;

  onMount(() => {
    unsub = onAuthStateChanged(auth, (currentUser) => {
      userLoaded.set(true);

      if (currentUser) {
        const normalizedUser: User = {
          id: currentUser.uid,
          name: currentUser.displayName as string,
          email: currentUser.email as string,
          avatar: currentUser.photoURL as string,
        };
        user.set(normalizedUser);
        navigate("/");
      } else {
        user.set(null);
        navigate("/login");
      }
    });
  });

  onDestroy(() => {
    if (unsub) {
      unsub();
    }
  });
</script>
