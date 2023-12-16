<script lang="ts">
  import { Router, Route } from "svelte-navigator";

  import Home from "@/components/Home/Home.svelte";
  import Login from "@/components/Login/Login.svelte";
  import AuthRedirector from "@/components/Layout/AuthRedirector.svelte";
  import Layout from "@/components/Layout/Layout.svelte";
</script>

<Router>
  <main class="bg-app-bg-100 min-h-screen text-app-text-light">
    <AuthRedirector />
    <Layout>
      <Route path="/"><Home /></Route>
      <Route path="/login"><Login /></Route>
    </Layout>
  </main>
</Router>

<style></style>
