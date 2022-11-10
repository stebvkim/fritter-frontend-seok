<!-- Page for account settings and management -->
<!-- User should be authenticated in order to see this page -->

<template>
  <main>
    <section>

      <header>
        <h2>Follower settings for @{{ $store.state.username }}</h2>
      </header>
      <FollowForm />
      <UnfollowForm />

      <h2> Users @{{ $store.state.username }} is following:</h2>
      <p
        v-for="name in $store.state.following"
      >
        {{name}}
      </p>

    </section>
  </main>
</template>

<script>
import FollowForm from '@/components/Following/FollowForm.vue';
import UnfollowForm from '@/components/Following/UnfollowForm.vue';

export default {
  name: 'FollowPage',
  components: {
    FollowForm,
    UnfollowForm
  }
};
</script>
